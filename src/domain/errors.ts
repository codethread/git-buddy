import { ParseError } from '@effect/schema/ParseResult'
import { Data } from 'effect'

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

export class UnexpectedError extends Data.TaggedError('UnexpectedError')<{
	readonly error: unknown
}> {
	static of(error: unknown) {
		return new UnexpectedError({ error })
	}
	override toString(): string {
		return `Something went wrong. ${this.error}`
	}
}

export class InvalidTestSetup extends Error {}
