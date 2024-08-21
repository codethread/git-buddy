import { Schema as S } from '@effect/schema'
import { Brand } from 'effect'

type Input<A, I> = {
	body: {
		query: string
		variables: Record<string, string | number>
	}
	schema: S.Schema<A, I>
}
export type GraphRequest<A, I> = Brand.Brand<'GraphRequest'> & Input<A, I>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GraphResponse<A extends Input<any, any>> = Required<
	A['schema']['Encoded']['data']
>

export const GraphRequest = <A, I>(a: Input<A, I>) =>
	Brand.nominal<GraphRequest<A, I>>()(a)

// TODO decouple from git current user
export const GraphqlDataSchema = <A>(d: S.Schema<A, A>) =>
	S.Struct({
		data: S.Struct({
			currentUser: S.NullOr(
				S.Struct({
					name: S.String,
				}),
			),
		}).pipe(S.extend(d), S.optional),
		errors: S.optional(S.Array(S.Unknown)),
	})

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GraphqlData
	extends S.Schema.Type<ReturnType<typeof GraphqlDataSchema>> {}

export const gql = (str: TemplateStringsArray, ...fragments: string[]) =>
	str
		.join(' ')
		.concat(...fragments)
		.replaceAll('\n', ' ')
		.replaceAll('\t', '')
		.trim()
