import { $ } from 'bun'
import pj from '../package.json'

const [bump] = process.argv.slice(2)

if (!['minor', 'major'].includes(bump))
	throw new Error('expected argument minor or major')

const { name, version, ...pjFields } = pj

let [major, minor] = version.split('.').map((v) => parseInt(v))

if (bump === 'major') major++
if (bump === 'minor') minor++

const newVersion = [major, minor, 0].join('.')

await Bun.write(
	'./package.json',
	JSON.stringify({ name, version: newVersion, ...pjFields }),
)

await Promise.all([$`git tag v${newVersion}`, $`prettier --write package.json`])

await $`git push; git push --tags`
