import { test, expect, describe } from 'bun:test'
import { Effect, ConfigProvider, Option } from 'effect'
import { getEnvs } from './getEnvs.js'

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
			hideBuiltin: true,
			gitlabToken: Option.none(),
		})
	})

	test('getEnvs fails as expected', () => {
		const out = scenario({
			NODE_ENV: 'invalid',
		}).pipe(Effect.flip, Effect.runSync)

		expect(out._tag).toBe('ConfigError')
	})

	test.each([
		['production', false],
		['development', true],
		['test', true],
	])('getEnvs in environment %s has correct defaults of %p', (env, outcome) => {
		const prod = scenario({
			NODE_ENV: env,
		}).pipe(Effect.runSync)

		expect(prod).toMatchObject({
			hideBuiltin: outcome,
		})
	})
})
