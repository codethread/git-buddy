import { Console, Context, Effect, Layer, Match, pipe, Struct } from 'effect'
import ids from '../utils/ids.js'
import { Prompt, type PromptErrors } from './prompt.js'
import { Prompt as P } from '@effect/cli'
import { InvalidConfig, UserCancelled } from '../domain/errors.js'
import { getEnvs } from './settings/getEnvs.js'
import { decodeUserSettings, type StoredSettings } from './settings/schema.js'
import { recoverFromInvalidConfig } from './settings/helpers.js'
import Conf from 'conf'
import { name, version } from '../version.js'

export class Settings extends Context.Tag(ids.settings)<
	Settings,
	{
		readonly settings: Effect.Effect<StoredSettings>
		/** Open the users settings file and validate changes */
		readonly open: Effect.Effect<void, PromptErrors>
	}
>() {}

type SettingsService = Context.Tag.Service<Settings>

export const SettingsLive = Layer.effect(
	Settings,
	Effect.gen(function* (_) {
		const envs = yield* _(getEnvs)
		const prompt = yield* _(Prompt)

		const store = new Conf<StoredSettings>({
			projectName: name(),
			projectVersion: version(),
			defaults: {
				name: 'dave',
				cli: {
					hideBuiltinHelp: false,
				},
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
				return store.store
			}),
		})
	}),
)

export const getSettings = Settings.pipe(Effect.andThen((_) => _.settings))
