import { ParseError } from '@effect/schema/ParseResult'
import { Data, Effect } from 'effect'
import type { ConfigSchema } from '../services/settings/schema.js'

export class InvalidConfig extends Data.TaggedError('InvalidConfig')<{
	readonly error: ParseError
}> {
	static of(error: ParseError) {
		return new InvalidConfig({ error })
	}

	override toString(): string {
		return `Invalid config provided. See the docs for info.\n${this.error}`
	}
}

export class UserCancelled extends Data.TaggedError('UserCancelled')<{}> {
	static of() {
		return new UserCancelled()
	}
	override toString(): string {
		return `User cancelled.`
	}
}

export class UninitialisedCli extends Data.TaggedError('UninitialisedCli')<{
	readonly store: ConfigSchema
}> {
	override toString(): string {
		return `Accessing settings before Root Settings merged`
	}
}

export const UnexpectedError = (e: unknown) => Effect.die(String(e))

export class InvalidTestSetup extends Error {}
