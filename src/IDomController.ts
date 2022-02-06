import { TController } from './types/TController';
import { TResolver } from './types/TResolver';

export interface IDomController {
	EVENT_ATTACHED: string,
	EVENT_DETACHED: string,
	setResolver(resolver: TResolver): void;
	registerController<T extends HTMLElement>(controller: TController<T>, alias?: string | undefined): void;
}
