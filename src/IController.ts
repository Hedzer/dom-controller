
type Maybe<T> = T | null | undefined;

export interface IController<T extends HTMLElement> {
	element: Maybe<T>;
	attach(element: HTMLElement): Promise<void>;
	detach(element: HTMLElement): Promise<void>;
}