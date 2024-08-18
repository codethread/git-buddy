import { Prompt as CliPrompt } from '@effect/cli'
import { BunTerminal } from '@effect/platform-bun'
import { Context, Effect, Layer, Match, Redacted } from 'effect'

import { InvalidConfig } from '_/domain/errors.js'
import {
	type StoredUserSettings,
	type UserSettings,
	decodeUserSettings,
} from '_/domain/userSettings.js'
import { decodeJson } from '_/utils/schemas.js'

import { Fs, FsLive } from '../fs/fs.service.js'
import { openEditor } from './openEditor.js'

export type PromptErrors = InvalidConfig

interface EditorOptions {
	ext: 'json' | 'txt'
}

export class Prompt extends Context.Tag('ct/Prompt')<
	Prompt,
	{
		/** open a file and return the value after updated */
		readonly editor: (
			content: StoredUserSettings,
			opts?: EditorOptions,
		) => Effect.Effect<UserSettings, PromptErrors>

		readonly confirm: (msg: string) => Effect.Effect<boolean>
	}
>() {}

export type PromptService = Context.Tag.Service<Prompt>

export const PromptLive: Layer.Layer<Prompt> = Layer.effect(
	Prompt,
	Effect.gen(function* (_) {
		const fs = yield* _(Fs)

		return Prompt.of({
			confirm: (message) =>
				CliPrompt.confirm({ message }).pipe(
					Effect.catchTag('QuitException', () => Effect.succeed(false)),
					// XXX: no idea if this is a bad idea here, time will tell
					Effect.provide(BunTerminal.layer),
				),
			editor: ({ $schema, ...content }, opts = { ext: 'json' }) =>
				Effect.gen(function* (_) {
					const $schema = yield* _(fs.createSchemaFile)

					return yield* _(
						openEditor({
							message: 'Edit configuration',
							postfix: opts.ext === 'json' ? '.json' : '.txt',
							default: JSON.stringify(
								{
									$schema: $schema,
									...content,
								},
								null,
								2,
							),
						}),
					)
				}).pipe(
					Effect.map(Redacted.value),
					Effect.andThen(decodeJson),
					Effect.andThen(decodeUserSettings),
					Effect.mapError((e) =>
						Match.value(e).pipe(
							Match.tag('ParseError', InvalidConfig.of),
							Match.orElse((_) => _),
						),
					),
					Effect.withSpan('Prompt.editor'),
				),
		})
	}).pipe(Effect.provide(FsLive), Effect.withSpan('PromptLive')),
)
