import { Context, Effect, Layer } from 'effect'
import { Schema as S } from '@effect/schema'
import type { Envs } from './getEnvs.js'

const UserSettingsSchema = S.Struct({
	name: S.String,
	cli: S.Struct({
		hideBuiltinHelp: S.Boolean,
	}),
})

export type StoredSettings = S.Schema.Type<typeof UserSettingsSchema>

export const decodeUserSettings = S.decodeUnknownEither(UserSettingsSchema)
