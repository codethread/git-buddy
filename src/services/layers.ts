import { CliConfig } from '@effect/cli'
import { Effect, Layer } from 'effect'

import { Db, DbLive } from './db/db.service.js'
import { PromptLive } from './prompt/prompt.service.js'
import { SettingsLive } from './settings/settings.service.js'

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
export const CliLive = SettingsLive
