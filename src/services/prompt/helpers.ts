import editor from '@inquirer/editor'
import path from 'node:path'
import { FileSystem } from '@effect/platform'
import { Effect } from 'effect'
import envPaths from 'env-paths'
import { UnexpectedError, UserCancelled } from '../../domain/errors.js'
import { createSchema } from '../settings/schema.js'
import { name } from '../../utils/version.js'

export const openEditor = (options: Parameters<typeof editor>[0]) =>
	Effect.tryPromise({
		try: () => editor(options),
		catch: (e) => {
			if (typeof e === 'object' && e !== null && 'isTtyError' in e) {
				throw UnexpectedError.of(e)
			}
			return UserCancelled.of()
		},
	})

export const createSchemaFile = Effect.gen(function* (_) {
	const fs = yield* _(FileSystem.FileSystem)

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
}).pipe(Effect.tapError(Effect.logError), Effect.option)
