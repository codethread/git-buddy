import { Prompt as P } from '@effect/cli'
import { Effect, Console, Match, Option } from 'effect'
import { UnexpectedError, UserCancelled } from '../../domain/errors.js'
import { ConfigSchema, decodeUserSettings, type UserConfig } from './schema.js'
import { Prompt } from '../prompt.js'
import type { RootOptions } from '../../domain/types.js'
import type { Envs } from './getEnvs.js'

const promptAndEdit = (input: any) =>
	Effect.gen(function* (_) {
		const prompt = yield* _(Prompt)

		const deal = yield* _(
			P.confirm({
				message: 'config is invalid, would you like to correct it?',
			}),
		)

		if (!deal) return yield* _(UserCancelled.of())

		return yield* _(
			prompt.editor(input),
			Effect.tapErrorTag('InvalidConfig', (e) => Console.log(String(e))),
			Effect.retry({
				until: (e) => e._tag === 'UserCancelled',
			}),
		)
	}).pipe(
		Effect.catchTag('QuitException', (e) => UnexpectedError(e)),
		Effect.withSpan('promptAndEdit'),
	)

export const recoverFromInvalidConfig = (db: unknown) =>
	Effect.gen(function* (_) {
		const validated = yield* _(decodeUserSettings(db), Effect.merge)

		return yield* _(
			validated,
			Match.value,
			Match.tag('ParseError', (e) =>
				Effect.gen(function* (_) {
					yield* _(Console.log(String(e)))
					return yield* _(promptAndEdit(db))
				}),
			),
			Match.orElse((valid) => Effect.succeed(valid)),
		)
	}).pipe(Effect.withSpan('recoverFromInvalidConfig'))

/**
 * Merge user config, overriding with any environment options, and finally any
 * inline root settings
 */
export const mergeConfigs = (
	rootOptions: RootOptions,
	envs: Envs,
	db: UserConfig,
): UserConfig => {
	return ConfigSchema.make({
		...db,
		cli: {
			hideBuiltinHelp: envs.hideBuiltin.pipe(
				Option.getOrElse(() => db.cli.hideBuiltinHelp),
			),
		},
		gitlab: Option.some({
			graphUrl: Option.none(),
			token: Option.firstSomeOf([
				rootOptions.gitlabToken,
				envs.gitlabToken,
				db.gitlab.pipe(Option.andThen((_) => _.token)),
			]),
		}),
	})
}
