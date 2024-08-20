/* eslint-disable @typescript-eslint/no-empty-object-type */
import { ParseError } from '@effect/schema/ParseResult'
import { Data, Effect } from 'effect'

import type { UserSettings } from './userSettings.js'

export class InvalidConfig extends Data.TaggedError('InvalidConfig')<{
	readonly error: ParseError
}> {
	static of(error: ParseError) {
		return new InvalidConfig({ error })
	}

	override toString(): string {
		return `Invalid config provided. See the docs for info.\n${String(this.error)}`
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
	readonly store: UserSettings
}> {
	override toString(): string {
		return `Accessing settings before Root Settings merged`
	}
}

export const UnexpectedError = (e: unknown, msg: string = '') =>
	Effect.die(msg + String(e))

export class InvalidTestSetup extends Error {}
