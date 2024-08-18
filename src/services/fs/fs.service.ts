import { FileSystem } from '@effect/platform'
import { BunFileSystem } from '@effect/platform-bun'
import { Context, Effect, Layer } from 'effect'
import path from 'node:path'

import { createSchema } from '_/domain/userSettings.js'
import { paths } from '_/utils/paths.js'

export class Fs extends Context.Tag('ct/Fs')<
	Fs,
	{
		readonly createSchemaFile: Effect.Effect<string>
	}
>() {}

export const FsLive: Layer.Layer<Fs> = Layer.effect(
	Fs,
	Effect.gen(function* (_) {
		const fs = yield* _(FileSystem.FileSystem)

		return Fs.of({
			createSchemaFile: Effect.gen(function* (_) {
				const { data: dir } = paths
				const filePath = path.join(dir, 'config.json')

				yield* _(fs.makeDirectory(dir)).pipe(
					Effect.catchIf(
						(e) => e._tag === 'SystemError' && e.reason === 'AlreadyExists',
						() => Effect.void,
					),
				)
				yield* _(fs.writeFileString(filePath, JSON.stringify(createSchema())))

				return filePath
			}).pipe(
				Effect.tapError(Effect.logError),
				Effect.catchAll(Effect.die),
				Effect.withSpan('createSchemaFile'),
			),
		})
	}).pipe(Effect.provide(BunFileSystem.layer), Effect.withSpan('FsLive')),
)
