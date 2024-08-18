import envPaths from 'env-paths'

import { name } from './version.js'

export const paths = envPaths(name())
