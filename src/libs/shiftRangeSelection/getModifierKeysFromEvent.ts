import type {ModifierEvent, Modifiers} from './types';

/** Reads shift + the additive modifier (Cmd on Mac, Ctrl elsewhere — metaKey||ctrlKey works on every OS since each OS only delivers its own modifier). */
function getModifierKeysFromEvent(event?: Partial<ModifierEvent> | null): Modifiers {
    const shiftKey = !!(event?.shiftKey ?? event?.nativeEvent?.shiftKey);
    const meta = !!(event?.metaKey ?? event?.nativeEvent?.metaKey);
    const ctrl = !!(event?.ctrlKey ?? event?.nativeEvent?.ctrlKey);
    return {shiftKey, additive: meta || ctrl};
}

export default getModifierKeysFromEvent;
