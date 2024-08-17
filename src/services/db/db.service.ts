import Conf from 'conf'
import { Console, Context, Effect, Layer, Match, Option } from 'effect'

import { UnexpectedError } from '_/domain/errors.js'
import {
	type StoredUserSettings,
	type UserSettings,
	decodeUserSettings,
	defaultConfigJson,
	serialiseConfiig,
} from '_/domain/userSettings.js'
import { name, version } from '_/utils/version.js'

import { getEnvs } from '../envs/envs.service.js'
import { Prompt } from '../prompt/prompt.service.js'
import { mergeSettings } from '../settings/mergeConfigs.js'
import { validateOrManuallyUpdate } from './validator.js'

export class Db extends Context.Tag('ct/Db')<
	Db,
	{
		readonly setAll: (conf: UserSettings) => Effect.Effect<UserSettings>
		readonly getAll: Effect.Effect<UserSettings>
		readonly getSerialised: Effect.Effect<StoredUserSettings>
	}
>() {}

export const DbLive = Layer.effect(
	Db,
	Effect.gen(function* (_) {
		const envs = yield* _(getEnvs)
		const prompt = yield* _(Prompt)

		const store = new Conf<StoredUserSettings>({
			projectName: name(),
			projectVersion: version(),
			defaults: defaultConfigJson,
		})

		// validating now means reading config is guaranteed to work and simplifies callers
		const validated = yield* _(validateOrManuallyUpdate(prompt, store.store))

		// update the stored value if the config was updatd
		yield* _(
			validated,
			Match.value,
			Match.tag('Updated', ({ config }) =>
				serialiseConfiig(config).pipe(
					Effect.tap((s) => {
						store.store = s
					}),
				),
			),
			Match.orElse(() => Effect.void),
		)

		/** access the store, from this point on we expect this to succeed */
		const readDb = () =>
			decodeUserSettings(store.store).pipe(
				Effect.catchTag('ParseError', (e) => UnexpectedError(e)),
			)
		debugger

		return Db.of({
			getAll: Effect.gen(function* (_) {
				const db = yield* _(readDb())
				return mergeSettings({ db, envs, rootOptions: Option.none() })
			}).pipe(Effect.withSpan('Db.getAll')),

			getSerialised: Effect.gen(function* (_) {
				const db = yield* _(readDb())
				return yield* _(serialiseConfiig(db))
			}).pipe(
				Effect.catchTag('ParseError', (e) =>
					UnexpectedError(
						e,
						`This shouldn't be possible, please try editing you config manually at "${store.path}"\n`,
					),
				),
				Effect.withSpan('Db.getSerialised'),
			),

			setAll: (config) =>
				Effect.gen(function* (_) {
					const cereal = yield* _(serialiseConfiig(config))
					store.store = cereal
					return config
				}).pipe(
					Effect.catchTag('ParseError', (e) => UnexpectedError(e)),
					Effect.withSpan('Db.setAll'),
				),
		})
	}).pipe(Effect.withSpan('DbLive')),
)
