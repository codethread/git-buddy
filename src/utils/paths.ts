import envPaths from 'env-paths'
import { name } from './version.js' with { type: 'macro' }

export const paths = envPaths(name())
