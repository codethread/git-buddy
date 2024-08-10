import type { Redacted } from 'effect/Redacted'
import * as O from 'effect/Option'

export interface RootOptions {
	_set?: boolean
	gitlabRepo: O.Option<string>
	gitlabToken: O.Option<Redacted<string>>
}

export const defaultRootOptions: RootOptions = {
	_set: false,
	gitlabRepo: O.none(),
	gitlabToken: O.none(),
}
