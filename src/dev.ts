import { Effect } from 'effect'
import { program } from './main.js'

export const args: string[] = ['open']

program(args.length ? ['bun', 'bun'].concat(args) : process.argv).pipe(
	Effect.runPromise,
)
