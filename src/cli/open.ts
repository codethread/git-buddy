import { Command, Prompt } from '@effect/cli'
import { Console, Effect, Option, Redacted } from 'effect'

import { CliLive } from '../services/layers.js'
import { Settings } from '../services/settings/settings.service.js'

export const openCommand = Command.make('open', {}, () =>
	Effect.gen(function* (_) {
		yield* _(Console.log('open'))
		const settings = yield* _(Settings)
		yield* _(
			settings.open,
			Effect.tapErrorTag('InvalidConfig', (e) => Console.log(String(e))),
			Effect.retry({ while: (e) => Boolean(e) }),
		)
		const news = yield* _(settings.getAll)
		yield* _(Console.log('Settings saved!', news))
		const y = yield* _(
			news.gitlab,
			Option.andThen((_) => _.token),
			Option.andThen(Redacted.value),
		)
		yield* _(Console.log({ y }))
	}).pipe(Effect.withSpan('openCmd')),
).pipe(Command.withDescription('Update settings in your editor'))
