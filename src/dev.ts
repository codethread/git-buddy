import { NodeSdk } from '@effect/opentelemetry'
import { BunRuntime } from '@effect/platform-bun'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { Console, Effect, LogLevel, Logger } from 'effect'

import { program } from './main.js'

export const args: string[] = [
	'pipeline',
	'--branch=https://gitlab.com/AHDesigns/nodejs/-/pipelines/1420207648',
]

const NodeSdkLive = NodeSdk.layer(() => ({
	resource: { serviceName: 'git-buddy' },
	spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
}))

program(
	process.argv.length > 2 ? process.argv : ['bun', 'bun'].concat(args),
).pipe(
	Effect.tap(Console.log('✓ Done')),
	Effect.provide(Logger.pretty),
	// Effect.provide(Logger.replace(Logger.defaultLogger, Logger.none)),
	Logger.withMinimumLogLevel(LogLevel.All),
	Effect.provide(NodeSdkLive),
	Effect.catchAllCause(Effect.logError),
	(program) =>
		BunRuntime.runMain(program, {
			teardown: (_exit, _) => {},
		}),
)
