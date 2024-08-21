import { Command, Options } from '@effect/cli'
import { Console, Effect, Option } from 'effect'

import { Db, type DbService } from '_/services/db/db.service.js'

import {
	Settings,
	type SettingsService,
} from '../services/settings/settings.service.js'

const view = Options.boolean('view').pipe(
	Options.optional,
	Options.withDescription('print out your settings'),
)

export const openCommand = Command.make('open', { view }, (args) =>
	Effect.gen(function* (_) {
		yield* _(Effect.logDebug(args))

		const { view } = args
		const settings = yield* _(Settings)
		const db = yield* _(Db)

		yield* _(
			view,
			Option.match({
				onSome: (view) => (view ? runView(db) : runOpen(settings)),
				onNone: () => {
					throw new Error('???')
				},
			}),
		)
	}).pipe(Effect.withSpan('openCmd')),
).pipe(Command.withDescription('Update settings in your editor'))

const runOpen = (settings: SettingsService) =>
	Effect.gen(function* (_) {
		yield* _(Console.log('open'))
		yield* _(
			settings.open,
			Effect.tapErrorTag('InvalidConfig', (e) => Console.log(String(e))),
			Effect.retry({ while: (e) => Boolean(e) }),
		)
		yield* _(Console.log('Settings saved!'))
	}).pipe(Effect.withSpan('open.runView'))

const runView = (db: DbService) =>
	Effect.gen(function* (_) {
		yield* _(db.getSerialised, Effect.andThen(Console.log))
	}).pipe(Effect.withSpan('open.runOpen'))
