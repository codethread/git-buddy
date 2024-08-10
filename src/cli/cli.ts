import { Command, Options } from '@effect/cli'
import { version, name } from '../utils/version.js' with { type: 'macro' }
import { Console, Effect, Option, Redacted } from 'effect'
import { Config } from '../services/settings.js'
import { openCommand } from './open.js'
import { pipelineCommand } from './pipeline.js'
import { ConfigSchema, type ConfigJson } from '../services/settings/schema.js'
import { Schema, Serializable } from '@effect/schema'

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
	(rootArgs) =>
		Effect.gen(function* (_) {
			const config = yield* _(Config)
			yield* _(config.applyRootOptions(rootArgs))

			const {
				cli: { hideBuiltinHelp },
			} = yield* _(config.config)

			yield* Console.log(
				`Hi there! pass --help to see what I can do.${
					hideBuiltinHelp
						? `

Looks like you have hideBuiltinHelp=true! This means I won't display the builtin help options, I'm sure you know what you are doing, but just in case you can run me with:

BUDDY_HIDE_BUILTIN=false git-buddy --help`
						: ''
				}`,
			)
		}).pipe(Effect.withSpan('rootCmd')),
)

/**
 * Store any root options in config for later used. MUST be called by all
 * commands expecting to read from config
 */
export const applyRootArgs = Effect.gen(function* (_) {
	const rootArgs = yield* _(rootCommand)
	const config = yield* _(Config)
	yield* _(config.applyRootOptions(rootArgs))
}).pipe(Effect.withSpan('applyRootArgs'))

const testCommand = Command.make('_test', {}, () =>
	Effect.gen(function* (_) {
		const message = `Hello Bun! ${version()}`
		yield* _(Console.log(message))
	}).pipe(Effect.withSpan('testCmd')),
).pipe(Command.withDescription('ignore me'))

export const cli = rootCommand.pipe(
	Command.withSubcommands([testCommand, openCommand, pipelineCommand]),
	Command.run({
		name: name(),
		version: version(),
	}),
)
