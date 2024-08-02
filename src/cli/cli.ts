import { Command } from '@effect/cli'
import { version, name } from '../utils/version.js' with { type: 'macro' }
import { Console, Effect } from 'effect'
import { Settings } from '../services/settings.js'
import { openCommand } from './open.js'

const env = Bun.env.NODE_ENV ?? 'production'

const message = `Hello Bun! ${version()} env: ${env}`

const command = Command.make('git-buddy', {}, () =>
	Effect.gen(function* (_) {
		const settings = yield* _(Settings)
		const {
			cli: { hideBuiltinHelp },
		} = yield* _(settings.settings)

		yield* Console.log(
			`Hi there! pass --help to see what I can do.${
				hideBuiltinHelp
					? `

Looks like you have hideBuiltinHelp=true! This means I won't display the builtin help options, I'm sure you know what you are doing, but just in case you can run me with:

BUDDY_HIDE_BUILTIN=false git-buddy --help`
					: ''
			}`,
		)
	}),
)

const testCommand = Command.make('_test', {}, () =>
	Effect.gen(function* (_) {
		yield* _(Console.log(message))
	}),
).pipe(Command.withDescription('ignore me'))

export const cli = command.pipe(
	Command.withSubcommands([testCommand, openCommand]),
	Command.run({
		name: name(),
		version: version(),
	}),
)
