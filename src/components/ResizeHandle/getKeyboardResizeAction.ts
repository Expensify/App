/** Turns key presses on a focused resize handle into what they do to the pane or column it sizes. */
import CONST from '@src/CONST';

/** Arrows move the edge, Enter and Space stand in for a click. */
type KeyboardResizeAction = {type: 'step'; step: number} | {type: 'activate'};

/** `undefined` for keys a handle leaves alone. */
function getKeyboardResizeAction({key, altKey, ctrlKey, metaKey, shiftKey}: Pick<KeyboardEvent, 'key' | 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey'>): KeyboardResizeAction | undefined {
    // Modified keys belong to the browser, the OS and global shortcuts.
    if (altKey || ctrlKey || metaKey || shiftKey) {
        return undefined;
    }

    if (key === CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT.shortcutKey) {
        return {type: 'step', step: -CONST.RESIZE_HANDLE.KEYBOARD_STEP};
    }

    if (key === CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey) {
        return {type: 'step', step: CONST.RESIZE_HANDLE.KEYBOARD_STEP};
    }

    if (key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey || key === CONST.KEYBOARD_SHORTCUTS.SPACE.trigger.DEFAULT.input) {
        return {type: 'activate'};
    }

    return undefined;
}

export default getKeyboardResizeAction;
