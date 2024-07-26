import { CliConfig } from '@effect/cli'
import { BunContext } from '@effect/platform-bun'
import { Effect } from 'effect'
import { cli } from './cli.js'

export const program = cli(process.argv).pipe(Effect.provide(BunContext.layer))
