import type {EventHandler} from '..';

type KeyCommandEvent = {input: string; modifierFlags?: string};

type GetDisplayName = (key: string, modifiers: string | string[]) => string;

type BindHandlerToKeydownEvent = (getDisplayName: GetDisplayName, eventHandlers: Record<string, EventHandler[]>, keyCommandEvent: KeyCommandEvent, event: KeyboardEvent) => void;

export default BindHandlerToKeydownEvent;

export type {KeyCommandEvent};
