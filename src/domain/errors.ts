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

export class InvalidArgs extends Data.TaggedError('InvalidArgs')<{
	readonly message: string
}> {
	static of(message: string) {
		return new InvalidArgs({ message })
	}
	override toString(): string {
		return `Invalid argument provided. ${this.message}`
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

export class RemoteError extends Data.TaggedError('RemoteError')<{
	readonly url: string
	readonly message: string
}> {
	override toString(): string {
		return `There was a problem making a request to ${this.url}\n${this.message}`
	}
}

export class RemoteInvalidData extends Data.TaggedError('RemoteInvalidData')<{
	readonly parseError: ParseError
	readonly res: unknown
}> {
	override toString(): string {
		return `${JSON.stringify(this.res)}\n${String(this.parseError)}`
	}
}

export class NoInternet extends Data.TaggedError('NoInternet') {
	override toString(): string {
		return `no internet`
	}
}

export class MissingAuth extends Data.TaggedError('MissingAuth')<{
	readonly service: string
}> {
	override toString(): string {
		return `missing auth for service ${this.service}`
	}
}

export const UnexpectedError = (e: unknown, msg: string = '') =>
	Effect.die(msg + String(e))

export class InvalidTestSetup extends Error {}
