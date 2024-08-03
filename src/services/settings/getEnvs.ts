import { Effect, Config } from 'effect'

export const getEnvs = Effect.gen(function* (_) {
	const nodenv = yield* _(
		Config.literal(
			'production',
			'test',
			'development',
		)('NODE_ENV').pipe(Config.withDefault('production')),
	)

	const [hideBuiltin, gitlabToken] = yield* _(
		Config.all([
			Config.boolean('BUDDY_HIDE_BUILTIN').pipe(
				Config.withDefault(nodenv !== 'production'),
			),
			Config.redacted('BUDDY_GITLAB_TOKEN').pipe(Config.option),
		]),
	)

	return {
		hideBuiltin,
		nodenv,
		gitlabToken,
	}
})

export type Envs = Effect.Effect.Success<typeof getEnvs>
