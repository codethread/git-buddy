import { JSONSchema, Schema as S } from '@effect/schema'

const UserSettingsSchema = S.Struct({
	name: S.String,
	cli: S.Struct({
		hideBuiltinHelp: S.Boolean,
	}),
	gitlab: S.Struct({
		graphUrl: S.Option(S.String),
		token: S.optionalWith(S.Redacted(S.String), { as: 'Option' }),
	}),
})

export const createSchema = () => JSONSchema.make(UserSettingsSchema)

export type StoredSettings = S.Schema.Type<typeof UserSettingsSchema>

export const decodeUserSettings = S.decodeUnknownEither(UserSettingsSchema)
