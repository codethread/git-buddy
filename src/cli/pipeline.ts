import { Command } from '@effect/cli'
import { Console, Effect } from 'effect'

import { getSettings } from '../services/settings/settings.service.js'

export const pipelineCommand = Command.make('pipeline', {}, () =>
	Effect.gen(function* (_) {
		// from url, infer repo, pipeline
		// make request
	}),
)
