import { Console, Effect } from 'effect'
import { Command } from '@effect/cli'
import { getSettings } from '../services/settings.js'

export const pipelineCommand = Command.make('pipeline', {}, () =>
	Effect.gen(function* (_) {
		yield* _(getSettings, Effect.tap(Console.log))
	}),
)
