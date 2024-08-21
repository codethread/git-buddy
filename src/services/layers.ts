import { CliConfig } from '@effect/cli'
import { Effect, Layer } from 'effect'

import { Db, DbLive } from './db/db.service.js'
import { GitlabLive } from './gitlab/gitlab.service.js'
import { NetLive } from './net/net.service.js'
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

const GitLabLiveLayer = GitlabLive.pipe(
	Layer.provide(SettingsLive),
	Layer.provide(NetLive),
)

export const CliLive = Layer.mergeAll(GitLabLiveLayer, SettingsLive)
