import { BunRuntime } from '@effect/platform-bun'
import { Effect, LogLevel, Logger } from 'effect'

import { program } from './main.js'

program(process.argv).pipe(
	Effect.provide(Logger.pretty),
	// TODO: file logger
	// Effect.provide(Logger.replace(Logger.defaultLogger, Logger.none)),
	Logger.withMinimumLogLevel(LogLevel.None),
	BunRuntime.runMain,
)
