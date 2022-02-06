import { IController } from '../IController';
export type TController<T extends HTMLElement> = new() => IController<T>;