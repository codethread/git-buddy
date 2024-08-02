import editor from '@inquirer/editor'
import { Schema as S } from '@effect/schema'
import { Context, Effect, Either, Layer, Match } from 'effect'
import { type PartialDeep } from 'type-fest'
import merge from 'lodash.merge'
import ids from '../utils/ids.js'
import {
	InvalidConfig,
	InvalidTestSetup,
	UnexpectedError,
	UserCancelled,
} from '../domain/errors.js'
import { decodeUserSettings, type StoredSettings } from './settings/schema.js'
import { decodeJson } from '../utils/schemas.js'

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
		) => Effect.Effect<StoredSettings, PromptErrors>
	}
>() {}

const openEditor = (options: Parameters<typeof editor>[0]) =>
	Effect.tryPromise({
		try: () => editor(options),
		catch: (e) => {
			console.log(e)
			if (typeof e === 'object' && e !== null && 'isTtyError' in e) {
				throw UnexpectedError.of(e)
			}
			return UserCancelled.of()
		},
	})

export const PromptLive = Layer.succeed(
	Prompt,
	Prompt.of({
		editor: (content, opts = { ext: 'json' }) =>
			openEditor({
				// name: toolName + toolVersion,
				message: 'Edit configuration',
				postfix: opts.ext === 'json' ? '.json' : '.txt',
				default: JSON.stringify(
					{
						$schema: 'https://unpkg.com/knip@5/schema.json', // TODO: how do schema?
						...content,
					},
					null,
					2,
				),
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
	}),
)
