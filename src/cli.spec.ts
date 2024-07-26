import { test } from 'bun:test'
import { cli } from './cli.js'
import { Effect } from 'effect'
import { BunContext } from '@effect/platform-bun'
import { CliConfig } from '@effect/cli'

test('cli runs', () => {
	cli(['bun', 'bun', '_test']).pipe(
		Effect.provide(BunContext.layer),
		Effect.runSync,
	)
})
