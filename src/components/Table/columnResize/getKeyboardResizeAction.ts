/** Turns key presses on a focused column edge into what they do to the column. */
import CONST from '@src/CONST';

/** Arrows move the edge, Enter and Space stand in for click and double-click. */
type KeyboardResizeAction = {type: 'step'; step: number} | {type: 'toggleFit'};

/** `undefined` for keys a column edge leaves alone. */
function getKeyboardResizeAction({key, altKey, ctrlKey, metaKey, shiftKey}: Pick<KeyboardEvent, 'key' | 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey'>): KeyboardResizeAction | undefined {
    // Modified keys belong to the browser, the OS and global shortcuts.
    if (altKey || ctrlKey || metaKey || shiftKey) {
        return undefined;
    }

    if (key === CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT.shortcutKey) {
        return {type: 'step', step: -CONST.TABLES.COLUMN_RESIZE.KEYBOARD_STEP};
    }

    if (key === CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey) {
        return {type: 'step', step: CONST.TABLES.COLUMN_RESIZE.KEYBOARD_STEP};
    }

    if (key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey || key === CONST.KEYBOARD_SHORTCUTS.SPACE.trigger.DEFAULT.input) {
        return {type: 'toggleFit'};
    }

    return undefined;
}

export default getKeyboardResizeAction;
