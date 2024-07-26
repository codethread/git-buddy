import { $ } from 'bun'
import pj from '../package.json'

const [bump] = process.argv.slice(2)

await validations()

const { name, version, ...pjFields } = pj

let [major, minor] = version.split('.').map((v) => parseInt(v))

if (bump === 'major') major++
if (bump === 'minor') minor++

const newVersion = [major, minor, 0].join('.')
const commitMsg = `${bump === 'major' ? '!' : ''}release v${newVersion}`

print('Updating', `package json with new version ${newVersion}`)
await Bun.write(
	'./package.json',
	JSON.stringify({ name, version: newVersion, ...pjFields }),
)
await $`prettier --write package.json`
await $`auto-changelog --ignore-commit-pattern "release v.*"`

print('Committing', `${commitMsg}`)
await $`git add package.json CHANGELOG.md`
await $`git commit -m "${commitMsg}"`

print('Pushing', `v${newVersion}`)
await $`git tag v${newVersion}`
await $`git push; git push --tags`

/***********************************************\
        PRIVATES
\***********************************************/

function fail(msg: string) {
	console.error(msg)
	process.exit(1)
}

function print(word: string, ...msg: string[]) {
	console.log(`\n\x1b[36m${word}\x1b[0m`, ...msg, '\n')
}

async function validations() {
	let [gitStatus, branch] = (
		await Promise.all([
			$`git status --porcelain`.text(),
			$`git rev-parse --abbrev-ref HEAD`.text(),
		])
	).map((t) => t.trim())

	if (gitStatus !== '') {
		fail('Unstaged work, commit it')
	}

	if (branch !== 'main') {
		fail(`need to be on main branch, current: ${branch}`)
	}

	if (!['minor', 'major'].includes(bump))
		fail('expected argument minor or major')
}
