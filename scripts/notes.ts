import { $ } from 'bun'
const lastTag = (
	await $`git tag -l | sort -V | tail -n 2 | head -n 1`.text()
).trim()

console.log(lastTag)

const commits = await $`git log --pretty=format:"%s" HEAD...${lastTag}`.text()

Bun.write(
	'release-notes',
	`
# here is a lovely release note

${commits
	.trim()
	.split('\n')
	.map((l) => '- ' + l)
	.join('\n')}

## good day sir
![](https://media.giphy.com/media/CAXFWvA45K48w/giphy.gif?cid=790b7611nf0d5tvqsf12nu16y5snvfl7pzcf4xdl9eyjw01h&ep=v1_gifs_search&rid=giphy.gif&ct=g)
`,
)
