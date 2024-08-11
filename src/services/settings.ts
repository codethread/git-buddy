import { Context, Effect, Layer, Option } from 'effect'
import { Prompt, type PromptErrors } from './prompt.js'
import { getEnvs } from './settings/getEnvs.js'
import { type UserConfig } from './settings/schema.js'
import type { FileSystem } from '@effect/platform'
import { rootCommand } from '../cli/cli.js'
import { Db } from './db.js'
import { mergeConfigs } from './settings/mergeConfigs.js'

export class Config extends Context.Tag('ct/Config')<
	Config,
	{
		readonly config: Effect.Effect<UserConfig>
		/** Open the users settings file and validate changes */
		readonly open: Effect.Effect<
			UserConfig,
			PromptErrors,
			FileSystem.FileSystem
		>
	}
>() {}

export const ConfigLive = Layer.effect(
	Config,
	Effect.gen(function* (_) {
		const rootOptions = yield* _(rootCommand)
		const envs = yield* _(getEnvs)
		const db = yield* _(Db)
		const prompt = yield* _(Prompt)

		return Config.of({
			open: Effect.gen(function* (_) {
				return yield* _(
					db.getSerialised,
					Effect.andThen(prompt.editor),
					Effect.andThen(db.setAll),
				)
			}).pipe(Effect.withSpan('Config.open')),

			config: Effect.gen(function* () {
				const stored = yield* _(db.getAll)
				return mergeConfigs({
					rootOptions: Option.some(rootOptions),
					envs,
					db: stored,
				})
			}).pipe(Effect.withSpan('Config.config')),
		})
	}).pipe(Effect.withSpan('ConfigLive')),
)

export const getSettings = Config.pipe(
	Effect.andThen((_) => _.config),
	Effect.withSpan('getSettings'),
)
