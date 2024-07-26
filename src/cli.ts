import { Command } from '@effect/cli'
import { version, name } from './version.js' with { type: 'macro' }
import { Console, Effect } from 'effect'

const env = Bun.env.NODE_ENV ?? 'production'
const hideBuiltIns = Boolean(Bun.env.BUDDY_HIDE_BUILTIN)

const message = `Hello Bun! ${version()} env: ${env}`

const command = Command.make('git-buddy', {}, () => {
	return Console.log(
		`Hi there! pass --help to see what I can do.${
			hideBuiltIns
				? `

Looks like you have BUDDY_HIDE_BUILTIN=true! This means I won't display the builtin help options, I'm sure you know what you are doing, but just in case you can run me with:

BUDDY_HIDE_BUILTIN=false git-buddy --help`
				: ''
		}`,
	)
})

const testCommand = Command.make('_test', {}, () =>
	Effect.gen(function* (_) {
		yield* _(Console.log(message))
	}),
).pipe(Command.withDescription('ignore me'))

export const cli = command.pipe(
	Command.withSubcommands([testCommand]),
	Command.run({
		name: name(),
		version: version(),
	}),
)
