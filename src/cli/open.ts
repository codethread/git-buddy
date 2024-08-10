import { Command } from '@effect/cli'
import { Config } from '../services/settings.js'
import { Console, Effect } from 'effect'
import { applyRootArgs } from './cli.js'

export const openCommand = Command.make('open', {}, () =>
	Effect.gen(function* (_) {
		yield* _(Console.log('open'))
		yield* _(applyRootArgs)
		const settings = yield* _(Config)
		yield* _(
			settings.open,
			Effect.tapErrorTag('InvalidConfig', (e) => Console.log(String(e))),
			Effect.retry({
				until: (e) => e._tag === 'UserCancelled',
			}),
		)
		const news = yield* _(settings.config)
		yield* _(Console.log('Settings saved!', news))
	}).pipe(Effect.withSpan('openCmd')),
).pipe(Command.withDescription('Update settings in your editor'))
