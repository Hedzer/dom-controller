import 'dom-controller/window';

import { IController } from 'dom-controller/IController';

class SomeLogic implements IController<HTMLDivElement> {
	element: HTMLDivElement;
	async attach(): Promise<void> {
		throw new Error('Method not implemented.');
	}
	async detach(): Promise<void> {
		throw new Error('Method not implemented.');
	}
}

window.DomController.registerController(SomeLogic);