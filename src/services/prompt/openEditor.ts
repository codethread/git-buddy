import editor from '@inquirer/editor'
import { Effect, Redacted } from 'effect'

import { UnexpectedError, UserCancelled } from '_/domain/errors.js'

export function openEditor(options: Parameters<typeof editor>[0]) {
	return Effect.tryPromise({
		try: () => editor(options),
		catch: (e) => {
			if (typeof e === 'object' && e !== null && 'isTtyError' in e) {
				throw UnexpectedError(e, 'Not a terminal\n')
			}
			return UserCancelled.of()
		},
	}).pipe(
		Effect.andThen(Redacted.make),
		Effect.tapBoth({
			onFailure: Effect.logError,
			onSuccess: Effect.logDebug,
		}),
		Effect.catchTag('UserCancelled', (e) =>
			UnexpectedError(e, 'User cancelled during edit, please raise a bug\n'),
		),
		Effect.withSpan('openEditor'),
	)
}
