import { semver } from 'bun'

const [tag, filePath] = process.argv.slice(2)

if (!semver.satisfies(tag.replace('v', ''), 'x.x.x')) {
	throw new Error(`tag: "${tag}" does not look like semver`)
}

const changelog = await Bun.file('CHANGELOG.md').text()

const lines = changelog.split('\n')
const start = lines.findIndex((l) => l.startsWith(`#### [${tag}]`))
const last = lines.findIndex((l, i) => l.startsWith(`#### [v`) && i !== start)
const versionChanges = lines.splice(start, last - start).join('\n')

await Bun.write(filePath, versionChanges)
