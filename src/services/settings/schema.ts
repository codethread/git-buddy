import { JSONSchema, Schema as S, Serializable } from '@effect/schema'
import { Maybe } from '../../utils/schemas.js'

export class ConfigSchema extends S.Class<ConfigSchema>('Config')({
	$schema: S.optional(S.String),

	cli: S.Struct({
		hideBuiltinHelp: S.Boolean,
	}),

	gitlab: Maybe(
		S.Struct({
			graphUrl: Maybe(
				S.NonEmptyString.annotations({
					description: [
						'Your gitlab graphql url',
						'likely in the format:',
						'',
						'https://<your-site.com>/api/graphql @link https://docs.gitlab.com/ee/api/graphql/',
					].join('\n'),
					examples: ['https://gitlab.com/api/graphql'],
				}),
			),
			token: Maybe(
				S.Redacted(
					S.NonEmptyString.annotations({
						description: [
							'you api token, generated in your profile, e.g',
							'',
							'https://gitlab.example.com/-/user_settings/personal_access_tokens?name=Example+Access+token&scopes=api,read_user,read_registry\n\nSee more at https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html',
							'',
							'NOTE! if you prefer not to persist this on your filesystem, a token can be passed as a cli option, see --help for more',
						].join('\n'),
					}),
				),
			),
		}),
	),
}) {
	get [Serializable.symbol]() {
		return ConfigSchema
	}
}

export type ConfigJson = typeof ConfigSchema.Encoded

export const defaultConfigJson: ConfigJson = {
	cli: {
		hideBuiltinHelp: false,
	},
}

export const createSchema = () => JSONSchema.make(ConfigSchema)

export type UserConfig = S.Schema.Type<typeof ConfigSchema>

export const decodeUserSettings = S.decodeUnknownEither(ConfigSchema)

export const serialiseConfiig = Serializable.serialize
