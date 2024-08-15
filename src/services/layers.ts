import { CliConfig } from '@effect/cli'
import { Layer, Effect } from 'effect'
import { PromptLive } from './prompt.js'
import { Db, DbLive } from './db.js'
import { ConfigLive } from './settings.js'

export const AppConfigLive = Layer.effect(
	CliConfig.CliConfig,
	Effect.gen(function* (_) {
		const db = yield* _(Db)
		const {
			cli: { hideBuiltinHelp },
		} = yield* _(db.getAll)

		return CliConfig.make({ showBuiltIns: !hideBuiltinHelp })
	}).pipe(Effect.provide(DbLive), Effect.withSpan('AppConfigLive')),
)

// export const CliLive = Layer.mergeAll(
// 	ConfigLive.pipe(Layer.provide(PromptLive), Layer.provide(DbLive)),
// )
export const CliLive = ConfigLive
