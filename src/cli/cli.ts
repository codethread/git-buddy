import { Command, Options } from '@effect/cli'
import { version, name } from '../utils/version.js' with { type: 'macro' }
import { Console, Effect } from 'effect'
import { openCommand } from './open.js'
import { Db } from '../services/db.js'
import { CliLive } from '../services/layers.js'

const gitlabRepo = Options.text('repo').pipe(
	Options.optional,
	Options.withDescription('the repo url, defaults to the current git project'),
)

const gitlabToken = Options.redacted('token').pipe(
	Options.optional,
	Options.withDescription('gitlab token'),
)

export const rootCommand = Command.make(
	'git-buddy',
	{ gitlabRepo, gitlabToken },
	() =>
		Effect.gen(function* (_) {
			const db = yield* _(Db)
			const settings = yield* _(db.getAll)

			yield* Console.log(
				`Hi there! pass --help to see what I can do.${
					settings.cli.hideBuiltinHelp
						? `

Looks like you have hideBuiltinHelp=true! This means I won't display the builtin help options, I'm sure you know what you are doing, but just in case you can run me with:

BUDDY_HIDE_BUILTIN=false git-buddy --help`
						: ''
				}`,
			)
		}).pipe(Effect.withSpan('rootCmd')),
)

const testCommand = Command.make('_test', {}, () =>
	Effect.gen(function* (_) {
		yield* _(Console.log(`Hello Bun! ${version()}`))
	}).pipe(Effect.withSpan('testCmd')),
).pipe(Command.withDescription('ignore me'))

export const cli = rootCommand.pipe(
	Command.withSubcommands([
		Command.provide(openCommand, CliLive),
		Command.provide(testCommand, CliLive),
	]),
	Command.run({
		name: name(),
		version: version(),
	}),
)
