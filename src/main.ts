import { version } from './version.js' with { type: 'macro' }

export const message = `Hello Bun! ${version()} env: ${Bun.env.NODE_ENV ?? 'production'}`
