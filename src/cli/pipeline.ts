import { Command } from '@effect/cli'
import { Console, Effect } from 'effect'

import { getSettings } from '../services/settings/settings.service.js'

export const pipelineCommand = Command.make('pipeline', {}, () =>
	Effect.gen(function* (_) {
		yield* _(getSettings, Effect.tap(Console.log))
	}),
)
