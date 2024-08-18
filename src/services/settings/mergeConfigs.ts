import { Option } from 'effect'

import type { RootOptions } from '_/domain/types.js'
import { UserSettings } from '_/domain/userSettings.js'

import type { Envs } from '../envs/envs.service.js'

/**
 * Merge user config, overriding with any environment options, and finally any
 * inline root settings
 */
export const mergeSettings = ({
	rootOptions,
	envs,
	db,
}: {
	rootOptions: Option.Option<RootOptions>
	envs: Envs
	db: UserSettings
}): UserSettings => {
	return UserSettings.make({
		...db,
		cli: {
			hideBuiltinHelp: envs.hideBuiltin.pipe(
				Option.getOrElse(() => db.cli.hideBuiltinHelp),
			),
		},
		gitlab: Option.some({
			graphUrl: Option.none(),
			token: Option.firstSomeOf([
				rootOptions.pipe(Option.andThen((_) => _.gitlabToken)),
				envs.gitlabToken,
				db.gitlab.pipe(Option.andThen((_) => _.token)),
			]),
		}),
	})
}
