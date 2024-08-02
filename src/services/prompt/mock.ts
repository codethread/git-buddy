import { Layer, Effect } from 'effect'
import merge from 'lodash.merge'
import type { PartialDeep } from 'type-fest'
import { InvalidTestSetup, InvalidConfig } from '../../domain/errors.js'
import type { StoredSettings } from '../settings/schema.js'
import { decodeJson } from '../../utils/schemas.js'
import { Prompt } from '../prompt.js'

interface PromptMocks {
	editor: {
		responses: Array<{ invalid: any } | PartialDeep<StoredSettings>>
	}
}
export const PromptMock = (stubs?: PromptMocks) =>
	Layer.effect(
		Prompt,
		Effect.gen(function* (_) {
			let editorCalls = -1
			return {
				editor: (content, _opts) =>
					Effect.gen(function* () {
						if (!stubs) throw new InvalidTestSetup('missing stubs')

						editorCalls++
						const { responses } = stubs.editor
						const output = responses[editorCalls]

						if (!output)
							throw new InvalidTestSetup(
								`not enough stub responses, need ${editorCalls} have ${responses.length}`,
							)
						if ('invalid' in output) {
							yield* _(decodeJson(output.invalid))
						}

						return merge({}, content, responses[editorCalls])
					}).pipe(Effect.mapError(InvalidConfig.of)),
			}
		}),
	)
