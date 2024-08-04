import { Console, Context, Effect, Layer, Match, pipe, Struct } from 'effect'
import ids from '../utils/ids.js'
import { Prompt, type PromptErrors } from './prompt.js'
import { Prompt as P } from '@effect/cli'
import { InvalidConfig, UserCancelled } from '../domain/errors.js'
import { getEnvs } from './settings/getEnvs.js'
import { decodeUserSettings, type StoredSettings } from './settings/schema.js'
import { mergeConfigs, recoverFromInvalidConfig } from './settings/helpers.js'
import Conf from 'conf'
import { defaultRootOptions, type RootOptions } from '../domain/types.js'
import { name, version } from '../utils/version.js'
import type { FileSystem } from '@effect/platform'

export class Settings extends Context.Tag(ids.settings)<
	Settings,
	{
		readonly applyRootOptions: (opts: RootOptions) => Effect.Effect<void>
		readonly settings: Effect.Effect<StoredSettings>
		/** Open the users settings file and validate changes */
		readonly open: Effect.Effect<void, PromptErrors, FileSystem.FileSystem>
	}
>() {}

type SettingsService = Context.Tag.Service<Settings>

export const SettingsLive = Layer.effect(
	Settings,
	Effect.gen(function* (_) {
		const envs = yield* _(getEnvs)
		const prompt = yield* _(Prompt)

		let rootOptions = defaultRootOptions

		const store = new Conf<StoredSettings>({
			projectName: name(),
			projectVersion: version(),
			defaults: {
				name: 'dave',
				cli: {
					hideBuiltinHelp: false,
				},
				gitlab: {} as any,
			},
		})

		const db = yield* _(recoverFromInvalidConfig(store.store))
		store.store = db

		const open: SettingsService['open'] = Effect.gen(function* (_) {
			const out = yield* _(prompt.editor(db))

			store.store = out
			return out
		})

		return Settings.of({
			open,
			settings: Effect.gen(function* () {
				return mergeConfigs(rootOptions, envs, store.store)
			}),
			applyRootOptions: (opts) =>
				Effect.gen(function* (_) {
					rootOptions = opts
				}),
		})
	}),
)

export const getSettings = Settings.pipe(Effect.andThen((_) => _.settings))
export const applyRootArgs = (opts: RootOptions) =>
	Settings.pipe(Effect.andThen((_) => _.applyRootOptions(opts)))
