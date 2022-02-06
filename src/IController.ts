
type Maybe<T> = T | null | undefined;

export interface IController<T extends HTMLElement> {
	element: Maybe<T>;
	attach(): Promise<void>;
	detach(): Promise<void>;
}