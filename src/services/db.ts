import { Context, Effect, Layer, Option } from 'effect'
import {
	type ConfigJson,
	defaultConfigJson,
	serialiseConfiig,
	type UserConfig,
} from './settings/schema.js'
import { getEnvs } from './settings/getEnvs.js'
import Conf from 'conf'
import { name, version } from '../utils/version.js'
import { ConfigRecovery, ConfigRecoveryLive } from './settings/helpers.js'
import { mergeConfigs } from './settings/mergeConfigs.js'
import { UnexpectedError } from '../domain/errors.js'

export class Db extends Context.Tag('ct/Db')<
	Db,
	{
		readonly setAll: (conf: UserConfig) => Effect.Effect<UserConfig>
		readonly getAll: Effect.Effect<UserConfig>
		readonly getSerialised: Effect.Effect<ConfigJson>
	}
>() {}

export const DbLive = Layer.effect(
	Db,
	Effect.gen(function* (_) {
		const envs = yield* _(getEnvs)
		const store = new Conf<ConfigJson>({
			projectName: name(),
			projectVersion: version(),
			defaults: defaultConfigJson,
		})
		const validator = yield* _(ConfigRecovery)

		// validating now means reading config is guaranteed to work and simplifies callers
		const db = yield* _(validator.validateWithIntervention(store.store))
		store.store = yield* _(serialiseConfiig(db))

		return Db.of({
			getAll: Effect.gen(function* (_) {
				return mergeConfigs({ db, envs, rootOptions: Option.none() })
			}).pipe(Effect.withSpan('Db.getAll')),

			getSerialised: Effect.gen(function* (_) {
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
					const cereal = yield* _(serialiseConfiig(db))
					store.store = cereal
					return config
				}).pipe(
					Effect.catchTag('ParseError', (e) => UnexpectedError(e)),
					Effect.withSpan('Db.setAll'),
				),
		})
	}).pipe(Effect.provide(ConfigRecoveryLive), Effect.withSpan('DbLive')),
)
