import { Console, Context, Effect, Layer } from 'effect'
import { Prompt, type PromptErrors } from './prompt.js'
import { getEnvs } from './settings/getEnvs.js'
import {
	defaultConfigJson,
	serialiseConfiig as serialiseConfig,
	serialiseConfiig,
	type ConfigJson,
	type UserConfig,
} from './settings/schema.js'
import { mergeConfigs, recoverFromInvalidConfig } from './settings/helpers.js'
import Conf from 'conf'
import { defaultRootOptions, type RootOptions } from '../domain/types.js'
import { name, version } from '../utils/version.js'
import type { FileSystem } from '@effect/platform'
import {
	UnexpectedError,
	UninitialisedCli,
	UserCancelled,
} from '../domain/errors.js'

export class Config extends Context.Tag('ct/Config')<
	Config,
	{
		readonly applyRootOptions: (opts: RootOptions) => Effect.Effect<void>
		readonly config: Effect.Effect<UserConfig, UserCancelled | UninitialisedCli>
		/** Open the users settings file and validate changes */
		readonly open: Effect.Effect<void, PromptErrors, FileSystem.FileSystem>
	}
>() {}

export const ConfigLive = Layer.effect(
	Config,
	Effect.gen(function* (_) {
		const envs = yield* _(getEnvs)
		const prompt = yield* _(Prompt)

		let rootOptions = defaultRootOptions

		const store = new Conf<ConfigJson>({
			projectName: name(),
			projectVersion: version(),
			defaults: defaultConfigJson,
		})

		// validating now means reading config is guaranteed to work and simplifies callers
		const db = yield* _(recoverFromInvalidConfig(store.store))
		store.store = yield* _(serialiseConfiig(db))

		return Config.of({
			open: Effect.gen(function* (_) {
				const out = yield* _(prompt.editor(store.store))

				yield* _(
					serialiseConfig(out),
					Effect.tap((config) => {
						store.store = config
					}),
					Effect.catchTag('ParseError', (e) => Effect.die(e)),
				)

				return out
			}).pipe(Effect.withSpan('Config.open')),

			config: Effect.gen(function* () {
				yield* _(Effect.logInfo('hey there conf'))
				if (!rootOptions._set)
					return yield* _(new UninitialisedCli({ store: db }))
				return mergeConfigs(rootOptions, envs, db)
			}).pipe(Effect.withSpan('Config.config')),

			applyRootOptions: (opts) =>
				Effect.gen(function* (_) {
					yield* _(Console.log('set!'))
					rootOptions = {
						...opts,
						_set: true,
					}
				}).pipe(Effect.withSpan('Config.applyRootOptions')),
		})
	}).pipe(Effect.withSpan('ConfigLive')),
)

export const getSettings = Config.pipe(
	Effect.andThen((_) => _.config),
	Effect.tapBoth({
		onFailure: (e) => Effect.logWarning(String(e)),
		onSuccess: Effect.logInfo,
	}),
	Effect.withSpan('getSettings'),
)
