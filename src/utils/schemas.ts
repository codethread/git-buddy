import { Schema as S } from '@effect/schema'

export const decodeJson = S.decodeUnknownEither(S.parseJson())

/** Make a schema value optional */
export const Maybe = <A, I, R>(s: S.Schema<A, I, R>) =>
	S.optionalWith(s, { as: 'Option' })
