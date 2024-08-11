import { Option } from 'effect'
import { ConfigSchema, type UserConfig } from './schema.js'
import type { RootOptions } from '../../domain/types.js'
import type { Envs } from './getEnvs.js'

/**
 * Merge user config, overriding with any environment options, and finally any
 * inline root settings
 */
export const mergeConfigs = ({
	rootOptions,
	envs,
	db,
}: {
	rootOptions: Option.Option<RootOptions>
	envs: Envs
	db: UserConfig
}): UserConfig => {
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
				rootOptions.pipe(Option.andThen((_) => _.gitlabToken)),
				envs.gitlabToken,
				db.gitlab.pipe(Option.andThen((_) => _.token)),
			]),
		}),
	})
}
