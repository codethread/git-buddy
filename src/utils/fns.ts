export function prettyPrint(name: string, val: unknown): string {
	return name + ' ' + JSON.stringify(val, null, 2)
}
