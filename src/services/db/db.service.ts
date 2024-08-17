import Conf from 'conf'
import { Console, Context, Effect, Layer, Option } from 'effect'

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
import { mergeSettings } from '../settings/mergeConfigs.js'
import { ConfigRecovery, ConfigRecoveryLive } from './recovery.js'

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
		const store = new Conf<StoredUserSettings>({
			projectName: name(),
			projectVersion: version(),
			defaults: defaultConfigJson,
		})
		const validator = yield* _(ConfigRecovery)

		// validating now means reading config is guaranteed to work and simplifies callers
		store.store = yield* _(
			validator.validateWithIntervention(store.store),
			Effect.andThen(serialiseConfiig),
		)
		const readDb = () =>
			decodeUserSettings(store.store).pipe(
				Effect.catchTag('ParseError', (e) => UnexpectedError(e)),
			)

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
					yield* _(Console.log(cereal))
					store.store = cereal
					return config
				}).pipe(
					Effect.catchTag('ParseError', (e) => UnexpectedError(e)),
					Effect.withSpan('Db.setAll'),
				),
		})
	}).pipe(Effect.provide(ConfigRecoveryLive), Effect.withSpan('DbLive')),
)
