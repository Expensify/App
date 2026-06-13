import type {ModifierEvent, Modifiers} from './types';

function getModifierKeysFromEvent(event?: Partial<ModifierEvent> | null): Modifiers {
    return {shiftKey: !!(event?.shiftKey ?? event?.nativeEvent?.shiftKey)};
}

export default getModifierKeysFromEvent;
