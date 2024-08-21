import { Schema as S } from '@effect/schema'

import {
	GraphRequest,
	type GraphResponse,
	GraphqlDataSchema,
	gql,
} from '_/utils/graphqlRequest.js'

import { KeyInfoFragment } from './shared.js'

/**
 * IN the case someone pastes a url of the pipeline, there's no apparent api to
 * get it, but we can get all running within a reasonable timeframe (today) and
 * then just filter by id
 *
 * id will be in the format gid://gitlab/Ci::Pipeline/432290
 * where last param is in the url
 */
export const queryForPipelinesById = (variables: {
	app: string
	id: string
}) => {
	return GraphRequest({
		body: {
			query: gql`
				query PipelineById($app: ID!, $id: CiPipelineID!) {
					...KeyInfoFragment

					project(fullPath: $app) {
						pipeline(id: $id) {
							active
							status
						}
					}
				}

				${KeyInfoFragment}
			`,
			variables,
		},
		schema: GraphqlDataSchema(
			S.Struct({
				project: S.Struct({
					pipeline: S.Struct({
						active: S.Boolean,
						status: S.Literal(
							'CREATED',
							'WAITING_FOR_RESOURCE',
							'PREPARING',
							'WAITING_FOR_CALLBACK',
							'PENDING',
							'RUNNING',
							'FAILED',
							'SUCCESS',
							'CANCELED',
							'CANCELING',
							'SKIPPED',
							'MANUAL',
							'SCHEDULED',
						),
					}),
				}),
			}),
		),
	})
}

export type PipelineById = GraphResponse<
	ReturnType<typeof queryForPipelinesById>
>
