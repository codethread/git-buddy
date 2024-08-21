import { Command, Options } from '@effect/cli'
import { Schema as S } from '@effect/schema'
import { Console, Effect, Either, Option } from 'effect'

import { InvalidArgs } from '_/domain/errors.js'
import {
	Gitlab,
	type PipelineRef,
	PipelineRefs,
} from '_/services/gitlab/gitlab.service.js'

const branch = Options.text('branch').pipe(
	Options.withAlias('b'),
	Options.optional,
	Options.withDescription(
		'branch to run against, defaults to current. Can also be a pipeline url',
	),
)

export const pipelineCommand = Command.make('pipeline', { branch }, (args) =>
	Effect.gen(function* (_) {
		yield* _(Effect.logDebug(args))
		const { branch } = args

		const gitlab = yield* _(Gitlab)

		const res = yield* _(
			infoFromBranch(branch),
			Effect.andThen(
				PipelineRefs.$match({
					Url: (info) => gitlab.getPipelineForUrl(info),
				}),
			),
		)

		yield* Console.log(res)
	}).pipe(Effect.withSpan('pipelineCmd')),
)

const WIP = () => {
	return Effect.die('wip')
}

function infoFromBranch(
	optBranch: Option.Option<string>,
): Effect.Effect<PipelineRef, InvalidArgs> {
	return optBranch.pipe(
		Option.match({
			onNone: () => WIP(),
			onSome: (branch) =>
				branch.startsWith('https') ? infoFromUrl(branch) : WIP(),
		}),
	)
}

function infoFromUrl(branch: string): Effect.Effect<PipelineRef, InvalidArgs> {
	return regexPipelineGroups(branch).pipe(
		Either.match({
			onLeft: () =>
				Effect.fail(
					InvalidArgs.of(`Could not extract pipeline info from ${branch}`),
				),
			onRight: ({ pipeline, repo, url }) =>
				Effect.succeed(PipelineRefs.Url({ repo, id: pipeline, url })),
		}),
	)
}

/**
 * example: https://git.domain.io/path/to/app/-/pipelines/123
 */
const pipelineRegex =
	/https:\/\/(?<domain>[a-zA-Z.]*)\/(?<repo>[\w/-]+)\/-\/pipelines\/(?<pipeline>\d+)/

const PipelineSchema = S.Struct({
	domain: S.String,
	repo: S.String,
	pipeline: S.String,
})

export const regexPipelineGroups = (str: string) => {
	const match = str.match(pipelineRegex)
	return S.decodeUnknownEither(PipelineSchema)(match?.groups).pipe(
		Either.map(({ domain, repo, pipeline }) => ({
			repo,
			pipeline,
			url: gitlabFromDomain(domain),
		})),
	)
}

function gitlabFromDomain(d: string) {
	return `https://${d}/api/graphql`
}
