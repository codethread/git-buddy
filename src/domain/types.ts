import type { Redacted } from 'effect/Redacted'
import * as O from 'effect/Option'

export interface RootOptions {
	gitlabRepo: O.Option<string>
	gitlabToken: O.Option<Redacted<string>>
}

export const defaultRootOptions: RootOptions = {
	gitlabRepo: O.none(),
	gitlabToken: O.none(),
}
