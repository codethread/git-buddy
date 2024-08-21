import { BunContext } from '@effect/platform-bun'
import { Effect } from 'effect'

import { cli } from './cli/cli.js'
import { DbLive } from './services/db/db.service.js'
import { AppConfigLive } from './services/layers.js'
import { NetLive } from './services/net/net.service.js'
import { PromptLive } from './services/prompt/prompt.service.js'

export const program = (args: string[]) =>
	cli(args).pipe(
		Effect.provide(AppConfigLive),
		Effect.provide(NetLive),
		Effect.provide(DbLive),
		Effect.provide(PromptLive),
		Effect.provide(BunContext.layer),
		Effect.withSpan('app', { captureStackTrace: true }),
	)
