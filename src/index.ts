import {
	ALIAS_KEY,
	CONTROLLER_KEY,
	CONTROLLER_NAME_KEY,
	ERROR_REPORTED,
	EVENT_ATTACHED,
	EVENT_DETACHED,
	TARGET_ATTRIBUTE,
} from './Constants';

import { IController } from './IController';
import { IDomController } from './IDomController';
import { TController } from './types/TController';
import { TResolver } from './types/TResolver';

class DomController implements IDomController {
	private resolver: TResolver = this.defaultResolver;

	public readonly EVENT_ATTACHED: string = EVENT_ATTACHED;
	public readonly EVENT_DETACHED: string = EVENT_DETACHED;
	
	public readonly observer: MutationObserver;
	public readonly resolved: { [key: string]: Promise<TController<HTMLElement>> } = {};
	public readonly resolvedHrefs: { [key: string]: Promise<TController<HTMLElement>> } = {};

	constructor() {
		// init the observer over the entire html doc
		this.observer = new MutationObserver((mutations) => this.mutationHandler(mutations));
		const htmlNode = document.querySelector('html') as HTMLElement;
		this.observer.observe(htmlNode, {
			attributes: true,
			subtree: true,
			childList: true,
			attributeFilter: [TARGET_ATTRIBUTE],
			attributeOldValue: true,
		});
		document.addEventListener('DOMContentLoaded', () => {
			const nodes = document.querySelectorAll(`[${TARGET_ATTRIBUTE}]`);
			for (let i = 0; i < nodes.length; i++) {
				const element = nodes[i];
				this.applyController(null, element);
			}
		}, false);
	}

	
	/**
	 * Sets the controller resolver.
	 * When an element includes the controller attribute, 
	 * this method resolves the attribute value into a promise that resolves to a controller class.
	 * 
	 * @param  {Resolver} resolver - The resolver that turns a controller name to a promise that resolves to a class.
	 * @returns void
	 */
	public setResolver(resolver: TResolver): void { this.resolver = resolver; }
	
	
	/**
	 * Registers a controller.
	 * A controller can be registered with an alias by either passing an alias in, 
	 * or adding the attribute "controller-name=some-controller" to the script element.
	 * e.g. <script src="controller.js" controller-name="hello-world"></script>
	 * An alias spcified via attribute will override a hardcoded value.
	 * @param  {Controller} controller - A controller class that implements IController.
	 * @param  {string|undefined} alias - Optional. A hard-coded alias.
	 * @returns void
	 */
	public registerController<T extends HTMLElement>(controller: TController<T>, alias: string | undefined): void {
		alias = document.currentScript?.getAttribute(ALIAS_KEY) || alias;
		if (alias) {
			this.resolved[alias] = Promise.resolve(controller);
			return;
		}

		console.error(`Controller registered without a name`, {
			script: document.currentScript,
			source: document.currentScript?.getAttribute('src'),
		});
	}

	private mutationHandler(mutations: MutationRecord[]): void {
		for (const mutation of mutations) {
			const target = mutation.target as any;
			const isElementChange = mutation.type == 'childList';
			const isAttrChange = mutation.type == 'attributes';
			if (!isElementChange && !isAttrChange) { continue; }
			
			// process addition or removal of elements
			if (isElementChange) {
				if (hasControllerAttr(mutation.target)) { this.applyController(null, mutation.target); }

				// detach for removed nodes
				for (let i = 0; i < mutation.removedNodes.length; i++) {
					const node = mutation.removedNodes[i] as HTMLElement;
					if (hasControllerAttr(node)) {
						this.detachController(node);
					}
				}
				
				// attach for added nodes
				for (let i = 0; i < mutation.addedNodes.length; i++) {
					const node = mutation.addedNodes[i] as HTMLElement;
					if ('querySelectorAll' in node) {
						if (hasControllerAttr(node)) {
							this.applyController(null, node);
						}

						node
							.querySelectorAll(`[${TARGET_ATTRIBUTE}]`)
							.forEach(element => this.applyController(null, element));
					}
				}
				
				continue;
			}
			this.applyController(mutation.oldValue, target);
		}
	}
	
	private applyController(oldController: string | null, node: Node): void {
		const element = node as any;
		const currentValue = element.getAttribute(TARGET_ATTRIBUTE) as string;

		// make sure there's actual change
		if (oldController == currentValue || element[CONTROLLER_NAME_KEY] == currentValue) { return; }

		// if we don't have the controller, go get it
		if (!(currentValue in this.resolved)) {
			this.resolved[currentValue] = this.resolver(currentValue);
		}
		// remove the old controller
		const resolved = this.resolved[currentValue];
		this.detachController(element);

		// if the new value is false, meaning null, just remove nd exit here
		if (!currentValue) { return; }

		resolved.catch(err => console.error(`Error resolving controller "${currentValue}"`, err));

		resolved
			.then(res => {
				let controller: IController<HTMLElement>;
				try {
					controller = new res();
					controller.element = element;
				}
				catch (error) {
					console.error(`Error instantiating controller "${currentValue}"`);
					return;
				}

				try {
					controller.attach(element);
					element[CONTROLLER_KEY] = controller;
					element[CONTROLLER_NAME_KEY] = currentValue;
					element.dispatchEvent(new CustomEvent(this.EVENT_ATTACHED, { detail: { alias: currentValue, controller } }));
				} catch (error) {
					console.error(`Error attaching controller "${currentValue}"`, error);
				}
			})
			.catch(err => {
				// report only once
				if ((resolved as any)[ERROR_REPORTED]) { return err; }
				(resolved as any)[ERROR_REPORTED] = true;
				console.error(err);
				return err;
			});
	}

	private detachController(element: HTMLElement): void {
		const el = element as any;
		if (CONTROLLER_KEY in element) {
			const controller = el[CONTROLLER_KEY] as IController<HTMLElement>;
			if (controller && controller.detach) {
				const alias = el[CONTROLLER_NAME_KEY];
				controller.detach(controller.element!);
				controller.element = null;
				delete el[CONTROLLER_KEY];
				delete el[CONTROLLER_NAME_KEY];
				element.dispatchEvent(new CustomEvent(this.EVENT_DETACHED, { detail: { alias, controller } }));
			}
		}
	}

	private defaultResolver(controller: string): Promise<TController<HTMLElement>> {
		const link = document.querySelector(`link[${ALIAS_KEY}="${controller}"]`);
		if (!link) { return Promise.reject(new Error(`No link alias found for controller "${controller}"`)); }

		const href = link?.getAttribute('href');
		if (!href) { return Promise.reject(new Error(`No href for controller "${controller}"`)); }

		if (href in this.resolvedHrefs) { return this.resolvedHrefs[href]; }

		// try to infer the way we need to load if none is specified
		let type = link?.getAttribute('type-is');
		if (!type) {
			const rel = link?.getAttribute('rel')?.toLowerCase();
			const fileName = fileNameFromUrl(href);
			const ext = fileName.split('.').pop();
			if (!rel) { return Promise.reject(new Error(`Unkown controller type for ${controller}`)); }
			if (rel == 'modulepreload' || ext == 'mjs') { type = 'module'; }

			// fall back to 'script'
			if (!type) { type = 'script'; }
		}

		switch (type?.toLocaleLowerCase()) {
			case 'script':
				/* Following happens in here:
					1. Create a <script>
					2. Set it's controller-name attribute
					3. Listen to onload to resolve this method's promise
					4. Set the src to the aliased href
				*/
				const script = document.createElement('script');
				script.setAttribute(ALIAS_KEY, controller);
				let resolve: (c: TController<HTMLElement>) => void;
				let reject: (r: any) => void;
				let result = new Promise<TController<HTMLElement>>((res, rej) => {
					resolve = res;
					reject = rej;
				});
				this.resolvedHrefs[href] = result;
				this.resolved[controller] = result;
				script.onload = () => {
					if (!(controller in this.resolved)) { return reject(new Error(`No controller registered for "${controller}"`)); }
					this
						.resolved[controller]
						.then(resolved => resolve(resolved))
						.catch(err => reject(err));
				};
				script.src = href;
				document.head.appendChild(script);
				return result;
			case 'module':
				/* @ts-ignore */	
				const url = (new URL(href, window.location.href)).href;
				/* @ts-ignore */
				const imported = import(url)
					.then(module => module.default)
					.catch(err => err);
				this.resolvedHrefs[href] = imported;
				this.resolved[controller] = imported;
				return imported;
			default:
				
		}
	
		return Promise.reject(new Error(`Unable to determine how to load ${controller}`));
	}
}

function hasControllerAttr(node: Node): boolean {
	if ('getAttribute' in node) {
		return !!((node as HTMLElement).getAttribute(TARGET_ATTRIBUTE));
	}
	return false;
}

function fileNameFromUrl(url: string) {
	var matches = url.match(/\/([^\/?#]+)[^\/]*$/);
	if (!matches) { return ''; }
	if (matches.length > 1) {
		return matches[1];
	}
	return '';
}

const instance = new DomController();

setTimeout(() => {
	// @ts-ignore
	if (!('DomController' in window)) { window.DomController = instance; }
	if ('__DomControllers' in window) {
		window
			.__DomControllers
			?.forEach((register: Function) => register());
		delete window.__DomControllers;
	}
}, 0);

export default instance;