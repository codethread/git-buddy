import { $ } from 'bun'

// works but colors are lost
try {
	const outs = await Promise.all([
		$`bun run test:format 2>&1`.text(),
		$`bun run test:ts 2>&1`.text(),
		$`bun run test:unit 2>&1`.text(),
	])

	for (const out of outs) {
		console.log(out)
	}
} catch (err: any) {
	console.log(err.stdout.toString())
	console.log(err.stderr.toString())
	throw new Error(`Failed with code ${err.exitCode}`)
}
