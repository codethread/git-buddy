import { Config, Data, Effect, Option as O, Redacted } from 'effect'

import { prettyPrint } from '_/utils/fns.js'

const nodenvs = ['production', 'test', 'development'] as const

export class Envs extends Data.Class<{
	readonly hideBuiltin: O.Option<boolean>
	readonly nodenv: (typeof nodenvs)[number]
	readonly gitlabToken: O.Option<Redacted.Redacted<string>>
}> {
	override toString() {
		return prettyPrint('Envs', this)
	}
}

type EnvStruct = Record<keyof Envs, any>

const envs = {
	nodenv: Config.literal(...nodenvs)('NODE_ENV').pipe(
		Config.withDefault('production'),
	),
	hideBuiltin: Config.boolean('BUDDY_HIDE_BUILTIN').pipe(Config.option),
	gitlabToken: Config.redacted('BUDDY_GITLAB_TOKEN').pipe(Config.option),
} satisfies EnvStruct

export const getEnvs = Config.all(envs).pipe(
	Effect.andThen((envs) => new Envs(envs)),
	Effect.tap(Effect.logDebug),
	Effect.withSpan('getEnvs'),
)
