import editor from '@inquirer/editor'
import { Prompt as CliPrompt } from '@effect/cli'
import { Context, Effect, Layer, Match, Redacted } from 'effect'
import {
	InvalidConfig,
	UnexpectedError,
	UserCancelled,
} from '../domain/errors.js'
import {
	decodeUserSettings,
	type ConfigJson,
	type UserConfig,
} from './settings/schema.js'
import { decodeJson } from '../utils/schemas.js'
import { FileSystem, Terminal } from '@effect/platform'
import { Fs, FsLive } from './prompt/helpers.js'
import { BunTerminal } from '@effect/platform-bun'

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
		) => Effect.Effect<UserConfig, PromptErrors>

		readonly confirm: (msg: string) => Effect.Effect<boolean>
	}
>() {}

export type PromptService = Context.Tag.Service<Prompt>

export const PromptLive = Layer.effect(
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
					const maybeSchema = yield* _(fs.createSchemaFile)

					return yield* _(
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

function openEditor(options: Parameters<typeof editor>[0]) {
	return Effect.tryPromise({
		try: () => editor(options),
		catch: (e) => {
			if (typeof e === 'object' && e !== null && 'isTtyError' in e) {
				throw UnexpectedError(e, 'Not a terminal\n')
			}
			return UserCancelled.of()
		},
	}).pipe(
		Effect.andThen(Redacted.make),
		Effect.tapBoth({
			onFailure: Effect.logError,
			onSuccess: Effect.logDebug,
		}),
		Effect.catchTag('UserCancelled', (e) =>
			UnexpectedError(e, 'User cancelled during edit, please raise a bug\n'),
		),
		Effect.withSpan('openEditor'),
	)
}
