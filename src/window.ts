import { IDomController } from './IDomController';

declare global {
	interface Window {
		__DomControllers?: Array<Function>,
		DomController: IDomController,
	}
}

const _window: Window & {
	__DomControllers?: Array<Function>,
	DomController: IDomController,
} = window;

export { _window as window }