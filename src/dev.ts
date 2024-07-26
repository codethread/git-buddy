import { CliConfig } from '@effect/cli'
import { Effect } from 'effect'
import { program } from './main.js'

const hideBuiltIns = Bun.env.BUDDY_HIDE_BUILTIN === 'false' ? false : true

program.pipe(
	Effect.provide(
		CliConfig.layer({
			showBuiltIns: hideBuiltIns,
		}),
	),
	Effect.runSync,
)
