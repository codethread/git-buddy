import { Effect, LogLevel, Logger } from 'effect'
import { program } from './main.js'

program(process.argv).pipe(
	// TODO: file logger
	// Effect.provide(Logger.replace(Logger.defaultLogger, Logger.none)),
	Logger.withMinimumLogLevel(LogLevel.None),
	Effect.runPromise,
)
