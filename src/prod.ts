import { CliConfig } from '@effect/cli'
import { Effect } from 'effect'
import { program } from './main.js'

// TODO: can this be controlled any other way...
const hideBuiltIns = Bun.env.BUDDY_HIDE_BUILTIN === 'true'

program.pipe(
	Effect.provide(
		CliConfig.layer({
			showBuiltIns: !hideBuiltIns,
		}),
	),
	Effect.runSync,
)
