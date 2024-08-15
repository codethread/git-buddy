import editor from '@inquirer/editor'
import path from 'node:path'
import { FileSystem } from '@effect/platform'
import { Context, Effect, Layer, Redacted } from 'effect'
import envPaths from 'env-paths'
import { UnexpectedError, UserCancelled } from '../../domain/errors.js'
import { createSchema, type ConfigJson } from '../settings/schema.js'
import { name } from '../../utils/version.js'
import { BunFileSystem } from '@effect/platform-bun'

export class Fs extends Context.Tag('ct/Fs')<
	Fs,
	{
		readonly createSchemaFile: Effect.Effect<string>
	}
>() {}

export const FsLive = Layer.effect(
	Fs,
	Effect.gen(function* (_) {
		const fs = yield* _(FileSystem.FileSystem)

		return Fs.of({
			createSchemaFile: Effect.gen(function* (_) {
				const { data: dir } = envPaths(name())
				const filePath = path.join(dir, 'schema.json')

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
