import { test, expect } from 'bun:test'
import { message } from './index.js'
import { version } from '../package.json'

test('tests run', () => {
	expect(message).toBe(`Hello Bun! ${version}`)
})
