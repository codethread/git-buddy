import { CliConfig } from '@effect/cli'
import { Layer, Effect } from 'effect'
import { getSettings, SettingsLive } from './settings.js'
import { PromptLive } from './prompt.js'

const AppSettingsLive = SettingsLive.pipe(Layer.provide(PromptLive))

const CliConfigLive = Layer.effect(
	CliConfig.CliConfig,
	Effect.gen(function* (_) {
		const {
			cli: { hideBuiltinHelp },
		} = yield* _(getSettings)

		return CliConfig.make({ showBuiltIns: !hideBuiltinHelp })
	}),
).pipe(Layer.provide(AppSettingsLive))

export const AppLive = Layer.merge(CliConfigLive, AppSettingsLive)
