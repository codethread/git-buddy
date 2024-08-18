import { describe, expect, test } from 'bun:test'
import { ConfigProvider, Effect, Option } from 'effect'

import { getEnvs } from '../envs/envs.service.js'

describe('getEnvs', () => {
	const scenario = (envs: Record<string, string>) =>
		getEnvs.pipe(Effect.withConfigProvider(ConfigProvider.fromJson(envs)))

	test('getEnvs marshals environment', () => {
		const out = scenario({
			BUDDY_HIDE_BUILTIN: 'true',
			NODE_ENV: 'test',
		}).pipe(Effect.runSync)

		expect(out).toEqual({
			nodenv: 'test',
			hideBuiltin: Option.some(true),
			gitlabToken: Option.none(),
		})
	})

	test('getEnvs fails as expected', () => {
		const out = scenario({
			NODE_ENV: 'invalid',
		}).pipe(Effect.flip, Effect.runSyncExit)
		expect(out._tag).toBe('Failure')
	})
})
