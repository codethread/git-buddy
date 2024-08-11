import { Command, Prompt } from '@effect/cli'
import { Config } from '../services/settings.js'
import { Console, Effect } from 'effect'
import { CliLive } from '../services/layers.js'

export const openCommand = Command.make('open', {}, () =>
	Effect.gen(function* (_) {
		yield* _(Console.log('open'))
		const settings = yield* _(Config)
		yield* _(
			settings.open,
			Effect.tapErrorTag('InvalidConfig', (e) => Console.log(String(e))),
			Effect.retry({ while: (e) => Boolean(e) }),
		)
		const news = yield* _(settings.config)
		yield* _(Console.log('Settings saved!', news))
	}).pipe(Effect.withSpan('openCmd')),
).pipe(Command.withDescription('Update settings in your editor'))
