import {
	HttpClient,
	HttpClientRequest,
	HttpClientResponse,
} from '@effect/platform'
import { Context, Duration, Effect, Layer, Redacted } from 'effect'
import type { TimeoutException } from 'effect/Cause'

import { NoInternet, RemoteError, UnexpectedError } from '_/domain/errors.js'
import type { GraphRequest } from '_/utils/graphqlRequest.js'

export type GraphqlError = NoInternet | RemoteError | TimeoutException

export class Net extends Context.Tag('ct/Net')<
	Net,
	{
		readonly graphql: <A, I>(
			url: string,
			token: Redacted.Redacted<string>,
			request: GraphRequest<A, I>,
		) => Effect.Effect<A, GraphqlError, never>
	}
>() {}

export const NetLive = Layer.succeed(
	Net,
	Net.of({
		graphql: (url, token, { body, schema }) =>
			Effect.logDebug({ url, token, body }).pipe(
				Effect.andThen(() =>
					HttpClientRequest.post(url).pipe(
						HttpClientRequest.setHeaders({
							Authorization: `Bearer ${Redacted.value(token)}`,
							'content-type': 'application/json',
						}),
						HttpClientRequest.jsonBody(body),
					),
				),
				Effect.andThen(HttpClient.fetch),
				Effect.andThen(HttpClientResponse.schemaBodyJson(schema)),
				Effect.timeout(Duration.seconds(5)),
				Effect.scoped,
				Effect.catchTags({
					ResponseError: (e) => new RemoteError({ message: e.message, url }),
					RequestError: UnexpectedError,
					HttpBodyError: UnexpectedError,
					ParseError: UnexpectedError,
				}),
				Effect.tap(Effect.logDebug),
				Effect.withSpan('Net.graphql'),
			),
	}),
)
