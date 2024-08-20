import { Console, Data, Effect, Match } from 'effect'

import { InvalidConfig, UserCancelled } from '_/domain/errors.js'
import { type UserSettings, decodeUserSettings } from '_/domain/userSettings.js'

import { type PromptService } from '../prompt/prompt.service.js'

type Conf = Data.TaggedEnum<{
	Valid: { config: UserSettings }
	Updated: { config: UserSettings }
}>

const Conf = Data.taggedEnum<Conf>()

export function validateOrManuallyUpdate(
	prompt: PromptService,
	config: object,
): Effect.Effect<Conf, InvalidConfig | UserCancelled> {
	return Effect.gen(function* (_) {
		const validated = yield* _(decodeUserSettings(config), Effect.merge)

		return yield* _(
			validated,
			Match.value,
			Match.tag('ParseError', (e) =>
				Effect.gen(function* (_) {
					yield* _(Console.log(String(e)))
					const updated = yield* _(promptAndEdit(prompt, config))
					return Conf.Updated({ config: updated })
				}),
			),
			Match.orElse((valid) => Effect.succeed(Conf.Valid({ config: valid }))),
		)
	}).pipe(Effect.withSpan('validateWithIntervention'))
}

function promptAndEdit(prompt: PromptService, input: object) {
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
