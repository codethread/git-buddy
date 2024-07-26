import { semver } from 'bun'

const [tag, filePath] = process.argv.slice(2)

if (!semver.satisfies(tag.replace('v', ''), 'x.x.x')) {
	throw new Error(`tag: "${tag}" does not look like semver`)
}

const [changelog, readme] = await Promise.all([
	Bun.file('CHANGELOG.md').text(),
	Bun.file('README.md').text(),
])

const lines = changelog.split('\n')
const start = lines.findIndex((l) => l.startsWith(`#### [${tag}]`))
const last = lines.findIndex((l, i) => l.startsWith(`#### [v`) && i !== start)
const versionChanges = lines.splice(start, last - start)

const readmeLines = readme.split('\n')
const start2 = readmeLines.findIndex((l) => l.startsWith('### Installation'))
const installation = readmeLines.splice(start2)

await Bun.write(
	filePath,
	['### Changelog', ''].concat(versionChanges).concat(installation).join('\n'),
)
