import { pjName, pjVersion } from './macros.js' with {type: 'macro'};

export function version() {
	return pjVersion()
}

export function name() {
	return pjName()
}
