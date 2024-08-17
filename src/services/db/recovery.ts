import { Console, Context, Effect, Layer, Match } from 'effect'

import {
	InvalidConfig,
	UnexpectedError,
	UserCancelled,
} from '_/domain/errors.js'
import { type UserSettings, decodeUserSettings } from '_/domain/userSettings.js'

import {
	Prompt,
	PromptLive,
	type PromptService,
} from '../prompt/prompt.service.js'

/**
 * This service isn't to be confused with Settings itself, it's merely for Db to
 * boot correctly
 */
export class ConfigRecovery extends Context.Tag('ct/SettingsRecovery')<
	ConfigRecovery,
	{
		readonly validateWithIntervention: (
			config: unknown,
		) => Effect.Effect<UserSettings, InvalidConfig | UserCancelled>
	}
>() {}

export const ConfigRecoveryLive = Layer.effect(
	ConfigRecovery,
	Effect.gen(function* (_) {
		const prompt = yield* _(Prompt)

		return ConfigRecovery.of({
			validateWithIntervention: (config) =>
				Effect.gen(function* (_) {
					const validated = yield* _(decodeUserSettings(config), Effect.merge)

					return yield* _(
						validated,
						Match.value,
						Match.tag('ParseError', (e) =>
							Effect.gen(function* (_) {
								yield* _(Console.log(String(e)))
								return yield* _(promptAndEdit(prompt, config))
							}),
						),
						Match.orElse((valid) => Effect.succeed(valid)),
					)
				}).pipe(Effect.withSpan('ConfigRecovery.validateWithIntervention')),
		})
	}).pipe(Effect.provide(PromptLive), Effect.withSpan('ConfigRecoveryLive')),
)

function promptAndEdit(prompt: PromptService, input: any) {
	return Effect.gen(function* (_) {
		const deal = yield* _(
			prompt.confirm('config is invalid, would you like to correct it?'),
		)

		if (!deal) return yield* _(UserCancelled.of())

		return yield* _(
			prompt.editor(input),
			Effect.tapErrorTag('InvalidConfig', (e) => Console.log(String(e))),
			Effect.retry({}),
		)
	}).pipe(
		// Effect.catchTag('QuitException', (e) => UnexpectedError(e)),
		Effect.withSpan('promptAndEdit'),
	)
}
