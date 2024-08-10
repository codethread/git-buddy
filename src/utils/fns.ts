export function prettyPrint(name: string, val: any): string {
	return name + ' ' + JSON.stringify(val, null, 2)
}
