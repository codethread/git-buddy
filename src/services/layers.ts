import { CliConfig } from '@effect/cli'
import { Layer, Effect } from 'effect'
import { getSettings, ConfigLive } from './settings.js'
import { PromptLive } from './prompt.js'

const AppSettingsLive = ConfigLive.pipe(Layer.provide(PromptLive))

const CliConfigLive = Layer.effect(
	CliConfig.CliConfig,
	Effect.gen(function* (_) {
		const {
			cli: { hideBuiltinHelp },
		} = yield* _(
			getSettings,
			Effect.catchTag('UninitialisedCli', (e) => Effect.succeed(e.store)),
			Effect.tap((s) => Effect.logDebug('cli', s)),
		)

		return CliConfig.make({ showBuiltIns: !hideBuiltinHelp })
	}).pipe(Effect.withSpan('CliConfigLive')),
).pipe(Layer.provide(AppSettingsLive))

export const AppLive = Layer.merge(CliConfigLive, AppSettingsLive)
