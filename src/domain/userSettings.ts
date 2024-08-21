import { JSONSchema, Schema as S, Serializable } from '@effect/schema'

/** Make a schema value optional */
export const Maybe = <A, I, R>(s: S.Schema<A, I, R>) =>
	S.optionalWith(s, { as: 'Option' })

export class UserSettings extends S.Class<UserSettings>('Config')({
	$schema: S.optional(S.String),

	cli: S.Struct({
		hideBuiltinHelp: S.Boolean,
	}),

	gitlab: Maybe(
		S.Struct({
			token: Maybe(
				S.Redacted(
					S.String.annotations({
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
			graphUrl: Maybe(
				S.String.annotations({
					description: [
						'Your gitlab graphql url',
						'likely in the format:',
						'',
						'https://<your-site.com>/api/graphql @link https://docs.gitlab.com/ee/api/graphql/',
					].join('\n'),
					examples: ['https://gitlab.com/api/graphql'],
				}),
			),
		}),
	),
}) {
	get [Serializable.symbol]() {
		return UserSettings
	}
}

export type StoredUserSettings = typeof UserSettings.Encoded

export const defaultConfigJson: StoredUserSettings = {
	cli: {
		hideBuiltinHelp: false,
	},
}

export const createSchema = () => JSONSchema.make(UserSettings)

export const decodeUserSettings = S.decodeUnknownEither(UserSettings, {
	errors: 'all',
})

export const serialiseConfiig = Serializable.serialize
