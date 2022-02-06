import { TController } from './TController';

export type TResolver = (controller: string) => Promise<TController<HTMLElement>>;