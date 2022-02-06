import { TController } from './types/TController';

export function register(controller: TController<HTMLElement>, alias: string | undefined): void {
	const w: any = window;
	if ('DomController' in w) {
		w.DomController.registerController(controller, alias);
		return;
	}

	const k = '__DomControllers';
	w[k] = w[k] || [];
	w[k].push(()=> w.DomController.registerController(controller, alias));
}
