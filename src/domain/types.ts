import * as O from 'effect/Option'
import type { Redacted } from 'effect/Redacted'

export interface RootOptions {
	_set?: boolean
	readonly gitlabRepo: O.Option<string>
	readonly gitlabToken: O.Option<Redacted<string>>
}

export const defaultRootOptions: RootOptions = {
	_set: false,
	gitlabRepo: O.none(),
	gitlabToken: O.none(),
}
