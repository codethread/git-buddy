import { Context, Effect, Layer, Match } from 'effect'
import { InvalidConfig, UserCancelled } from '../domain/errors.js'
import {
	decodeUserSettings,
	type ConfigJson,
	type UserConfig,
} from './settings/schema.js'
import { decodeJson } from '../utils/schemas.js'
import { FileSystem } from '@effect/platform'
import { createSchemaFile, openEditor } from './prompt/helpers.js'

export type PromptErrors = InvalidConfig

interface EditorOptions {
	ext: 'json' | 'txt'
}

export class Prompt extends Context.Tag('ct/Prompt')<
	Prompt,
	{
		/** open a file and return the value after updated */
		readonly editor: (
			content: ConfigJson,
			opts?: EditorOptions,
		) => Effect.Effect<UserConfig, PromptErrors, FileSystem.FileSystem>
	}
>() {}

export const PromptLive = Layer.succeed(
	Prompt,
	Prompt.of({
		editor: ({ $schema, ...content }, opts = { ext: 'json' }) =>
			Effect.gen(function* (_) {
				const maybeSchema = yield* _(createSchemaFile)

				yield* _(
					openEditor({
						message: 'Edit configuration',
						postfix: opts.ext === 'json' ? '.json' : '.txt',
						default: JSON.stringify(
							{
								$schema: maybeSchema,
								...content,
							},
							null,
							2,
						),
					}),
				)
			}).pipe(
				Effect.tap(Effect.logDebug),
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
	}),
)
