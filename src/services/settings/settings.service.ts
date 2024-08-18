import type { FileSystem } from '@effect/platform'
import { Context, Effect, Layer, Option } from 'effect'

import { rootCommand } from '_/cli/cli.js'
import { type UserSettings } from '_/domain/userSettings.js'

import { Db, DbLive } from '../db/db.service.js'
import { getEnvs } from '../envs/envs.service.js'
import {
	Prompt,
	type PromptErrors,
	PromptLive,
} from '../prompt/prompt.service.js'
import { mergeSettings } from './mergeConfigs.js'

export class Settings extends Context.Tag('ct/Settings')<
	Settings,
	{
		readonly getAll: Effect.Effect<UserSettings>
		/** Open the users settings file and validate changes */
		readonly open: Effect.Effect<
			UserSettings,
			PromptErrors,
			FileSystem.FileSystem
		>
	}
>() {}

export const SettingsLive = Layer.effect(
	Settings,
	Effect.gen(function* (_) {
		const rootOptions = yield* _(rootCommand)
		const envs = yield* _(getEnvs)
		const db = yield* _(Db)
		const prompt = yield* _(Prompt)

		return Settings.of({
			open: db.getSerialised.pipe(
				Effect.andThen(prompt.editor),
				Effect.andThen(db.setAll),
				Effect.tap(Effect.logDebug),
				Effect.withSpan('Config.open'),
			),

			getAll: db.getAll.pipe(
				Effect.andThen((stored) =>
					mergeSettings({
						rootOptions: Option.some(rootOptions),
						envs,
						db: stored,
					}),
				),
				Effect.withSpan('Config.config'),
			),
		})
	}).pipe(
		Effect.provide(DbLive),
		Effect.provide(PromptLive),
		Effect.withSpan('ConfigLive'),
	),
)

export const getSettings = Settings.pipe(
	Effect.andThen((_) => _.getAll),
	Effect.withSpan('getSettings'),
)
