import { Console, Effect } from 'effect'
import { Command } from '@effect/cli'
import { applyRootArgs, getSettings } from '../services/settings.js'
import { rootCommand } from './cli.js'

export const pipelineCommand = Command.make('pipeline', {}, () =>
	Effect.gen(function* (_) {
		const rootArgs = yield* _(rootCommand)
		yield* _(applyRootArgs(rootArgs))

		yield* _(getSettings, Effect.tap(Console.log))
	}),
)
