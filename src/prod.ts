import { Effect } from 'effect'
import { program } from './main.js'

program(process.argv).pipe(Effect.runPromise)
