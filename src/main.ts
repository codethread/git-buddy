import { BunContext } from '@effect/platform-bun'
import { Effect } from 'effect'
import { cli } from './cli/cli.js'
import { AppConfigLive, CliLive } from './services/layers.js'
import { DbLive } from './services/db.js'
import { PromptLive } from './services/prompt.js'

export const program = (args: string[]) =>
	cli(args).pipe(
		Effect.provide(AppConfigLive),
		Effect.provide(DbLive),
		Effect.provide(PromptLive),
		Effect.provide(BunContext.layer),
		Effect.withSpan('app', { captureStackTrace: true }),
	)
