import { Command, Options } from '@effect/cli'
import { version, name } from '../utils/version.js' with { type: 'macro' }
import { Console, Effect } from 'effect'
import { Settings } from '../services/settings.js'
import { openCommand } from './open.js'
import { pipelineCommand } from './pipeline.js'

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
		const message = `Hello Bun! ${version()}`
		yield* _(Console.log(message))
	}),
).pipe(Command.withDescription('ignore me'))

export const cli = rootCommand.pipe(
	Command.withSubcommands([testCommand, openCommand, pipelineCommand]),
	Command.run({
		name: name(),
		version: version(),
	}),
)
