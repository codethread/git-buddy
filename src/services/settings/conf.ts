import Conf from 'conf'
import { name, version } from '../../version.js'
import { Context } from 'effect'

export class Store extends Context.Tag('ct/store')<Store, {}>() {}

export function initialiseStore() {
	const store = new Conf({ projectName: name(), projectVersion: version() })
}
