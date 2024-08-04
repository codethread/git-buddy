import { Context, Effect, Layer, Match, Option } from 'effect'
import ids from '../utils/ids.js'
import { InvalidConfig, UserCancelled } from '../domain/errors.js'
import { decodeUserSettings, type StoredSettings } from './settings/schema.js'
import { decodeJson } from '../utils/schemas.js'
import { FileSystem } from '@effect/platform'
import { createSchemaFile, openEditor } from './prompt/helpers.js'

export type PromptErrors = UserCancelled | InvalidConfig

interface EditorOptions {
	ext: 'json' | 'txt'
}
export class Prompt extends Context.Tag(ids.prompt)<
	Prompt,
	{
		/** open a file and return the value after updated */
		readonly editor: (
			content: StoredSettings,
			opts?: EditorOptions,
		) => Effect.Effect<StoredSettings, PromptErrors, FileSystem.FileSystem>
	}
>() {}

export const PromptLive = Layer.effect(
	Prompt,
	Effect.gen(function* (_) {
		return {
			editor: (content, opts = { ext: 'json' }) =>
				Effect.gen(function* (_) {
					const maybeSchema = yield* _(
						createSchemaFile,
						Effect.andThen(
							Option.match({
								onNone: () => ({}),
								onSome: (path) => ({ $schema: path }),
							}),
						),
					)

					yield* _(
						openEditor({
							// name: toolName + toolVersion,
							message: 'Edit configuration',
							postfix: opts.ext === 'json' ? '.json' : '.txt',
							default: JSON.stringify(
								{
									...maybeSchema,
									...content,
								},
								null,
								2,
							),
						}),
					)
				}).pipe(
					Effect.andThen(decodeJson),
					Effect.andThen(decodeUserSettings),
					Effect.mapError((e) =>
						Match.value(e).pipe(
							Match.tag('ParseError', InvalidConfig.of),
							Match.orElse((_) => _),
						),
					),
				),
		}
	}),
)
