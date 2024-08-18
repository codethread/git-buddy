import { Schema as S } from '@effect/schema'

export const decodeJson = S.decodeUnknownEither(S.parseJson())
