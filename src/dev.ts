import { Effect } from 'effect'
import { program } from './main.js'
import { createSchema } from './services/settings/schema.js'

export const args: string[] = ['open']

Bun.write('./build/schema.json', JSON.stringify(createSchema(), null, 2))

program(args.length ? ['bun', 'bun'].concat(args) : process.argv).pipe(
	Effect.runPromise,
)
