import { IDomController } from './IDomController';

declare global {
	interface Window {
		__DomControllers?: Array<Function>,
		DomController: IDomController,
	}
}