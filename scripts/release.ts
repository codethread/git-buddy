import { $ } from 'bun'
import pj from '../package.json'

const [bump] = process.argv.slice(2)

// Validations
{
	let [gitStatus, branch] = await Promise.all([
		$`git status --porcelain`.text(),
		$`git rev-parse --abbrev-ref HEAD`.text(),
	])

	if (gitStatus !== '') {
		fail('Unstaged work, commit it')
	}

	if (branch != 'main') {
		fail('need to be on main branch')
	}

	if (!['minor', 'major'].includes(bump))
		fail('expected argument minor or major')

	function fail(msg: string) {
		console.error(msg)
		process.exit(1)
	}
}

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
