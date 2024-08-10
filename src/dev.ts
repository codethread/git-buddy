import { NodeSdk } from '@effect/opentelemetry'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { Console, Effect, LogLevel, Logger } from 'effect'
import { program } from './main.js'

export const args: string[] = []

const NodeSdkLive = NodeSdk.layer(() => ({
	resource: { serviceName: 'git-buddy' },
	spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
}))

program(args.length ? ['bun', 'bun'].concat(args) : process.argv).pipe(
	Effect.tap(Console.log('✓ Done')),
	Effect.provide(Logger.pretty),
	// Effect.provide(Logger.replace(Logger.defaultLogger, Logger.none)),
	Logger.withMinimumLogLevel(LogLevel.All),
	Effect.provide(NodeSdkLive),
	Effect.catchAllCause(Effect.logError),
	Effect.runPromise,
)
