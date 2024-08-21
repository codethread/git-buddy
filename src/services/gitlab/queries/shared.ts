import { gql } from '_/utils/graphqlRequest.js'

export const KeyInfoFragment = gql`
	fragment KeyInfoFragment on Query {
		currentUser {
			name
		}
		queryComplexity {
			limit
			score
		}
	}
`
