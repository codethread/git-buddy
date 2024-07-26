const result = await Bun.build({
	entrypoints: ['./src/prod.ts'],
	minify: true,
	target: 'bun',
})

if (!result.success) {
	console.error('Build failed')
	for (const message of result.logs) {
		// Bun will pretty print the message object
		console.error(message)
	}
}

for (const output of result.outputs) {
	const txt = await output.text()
	await Bun.write('./build/git-buddy', ['#!/usr/bin/env bun\n\n', txt])
}
