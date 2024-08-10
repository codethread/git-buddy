import { BunContext } from '@effect/platform-bun'
import { Effect } from 'effect'
import { cli } from './cli/cli.js'
import { AppLive } from './services/layers.js'

export const program = (args: string[]) =>
	cli(args).pipe(
		Effect.provide(AppLive),
		Effect.provide(BunContext.layer),
		Effect.withSpan('app', { captureStackTrace: true }),
	)
