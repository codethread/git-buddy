import { Effect, Config } from 'effect'

export const getEnvs = Effect.gen(function* (_) {
	const nodenv = yield* _(
		Config.literal(
			'production',
			'test',
			'development',
		)('NODE_ENV').pipe(Config.withDefault('production')),
	)

	const [hideBuiltin] = yield* _(
		Config.all([
			Config.boolean('BUDDY_HIDE_BUILTIN').pipe(
				Config.withDefault(nodenv !== 'production'),
			),
		]),
	)

	return {
		hideBuiltin,
		nodenv,
	}
})

export type Envs = Effect.Effect.Success<typeof getEnvs>
