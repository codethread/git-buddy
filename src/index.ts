import { version } from './version' with { type: 'macro' }

export const message = `Hello Bun! ${version()}`

console.log(message)
