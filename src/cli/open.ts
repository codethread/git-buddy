import { Command } from '@effect/cli'
import { Settings } from '../services/settings.js'
import { Console, Effect } from 'effect'

export const openCommand = Command.make('open', {}, () =>
	Effect.gen(function* (_) {
		const settings = yield* _(Settings)
		yield* _(
			settings.open,
			Effect.tapErrorTag('InvalidConfig', (e) => Console.log(String(e))),
			Effect.retry({
				until: (e) => e._tag === 'UserCancelled',
			}),
		)
		const news = yield* _(settings.settings)
		yield* _(Console.log('Settings saved!', news))
	}),
).pipe(Command.withDescription('Update settings in your editor'))
