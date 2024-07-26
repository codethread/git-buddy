import { test, expect } from 'bun:test'
import { message } from './main.js'
import { version } from '../package.json'

test('tests run', () => {
	expect(message).toBe(`Hllo Bun! ${version} env: test`)
})
