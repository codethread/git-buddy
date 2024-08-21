import { Array, Console, Context, Data, Effect, Layer, Option } from 'effect'
import type { TimeoutException } from 'effect/Cause'
import { die } from 'effect/Exit'

import { MissingAuth } from '_/domain/errors.js'
import type { GraphqlData } from '_/utils/graphqlRequest.js'

import { Net } from '../net/net.service.js'
import { Settings } from '../settings/settings.service.js'
import {
	type PipelineById,
	queryForPipelinesById,
} from './queries/queryForPipelinesById.js'

export class Gitlab extends Context.Tag('ct/Gitlab')<
	Gitlab,
	{
		readonly getPipelineForUrl: (
			info: PipelineUrl,
		) => Effect.Effect<PipelineById, TimeoutException>
	}
>() {}

export type PipelineRef = Data.TaggedEnum<{
	Url: { readonly id: string; readonly repo: string; readonly url: string }
}>

type PipelineUrl = Data.TaggedEnum.Value<PipelineRef, 'Url'>

export const PipelineRefs = Data.taggedEnum<PipelineRef>()

class Missing extends Error {
	constructor(...fields: string[]) {
		super(
			`Missing required configuration field(s) "${fields.join(',')}"\nCheck the docs for more information about configuration`,
		)
	}
}

export const GitlabLive = Layer.effect(
	Gitlab,
	Effect.gen(function* (_) {
		const net = yield* _(Net)
		const settings = yield* _(Settings)

		return Gitlab.of({
			getPipelineForUrl: (info) =>
				Effect.gen(function* (_) {
					const { gitlab } = yield* _(settings.getAll)
					const token = gitlab.pipe(
						Option.getOrThrowWith(() => new Missing('gitlab')),
						(s) => s.token,
						Option.getOrThrowWith(() => new Missing('gitlab token')),
					)
					const { data } = yield* _(
						net.graphql(
							info.url,
							token,
							queryForPipelinesById({
								app: info.repo,
								id: gitlabCiPipelineId(info.id),
							}),
						),
						Effect.andThen(failIfErrors),
						Effect.andThen(failIfNoAuth),
						Effect.catchTags({
							NoInternet: die,
							RemoteError: die,
						}),
						Effect.tap(Console.log),
					)
					if (!data) throw new Error('ah')

					return data
				}).pipe(
					Effect.tap(Effect.logDebug),
					Effect.withSpan('Gitlab.getPipelineForUrl'),
				),
		})
	}).pipe(Effect.withSpan('GitlabLive')),
)

const failIfErrors = <A extends GraphqlData>(res: A) =>
	res.errors && Array.isNonEmptyReadonlyArray(res.errors)
		? Effect.dieMessage(JSON.stringify(res.errors))
		: Effect.succeed(res)

const failIfNoAuth = <A extends GraphqlData>(res: A) =>
	res.data?.currentUser === null
		? Effect.die(new MissingAuth({ service: 'gitlab' }))
		: Effect.succeed(res)

function gitlabCiPipelineId(id: string): string {
	return `gid://gitlab/Ci::Pipeline/` + id
}
