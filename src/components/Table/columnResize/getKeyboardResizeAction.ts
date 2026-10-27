/** Turns key presses on a focused column edge into what they do to the column. */
import CONST from '@src/CONST';

/** Arrows move the edge, Enter and Space stand in for click and double-click. */
type KeyboardResizeAction = {type: 'step'; step: number} | {type: 'toggleFit'};

/** `undefined` for keys a column edge leaves alone. */
function getKeyboardResizeAction({key, code}: Pick<KeyboardEvent, 'key' | 'code'>): KeyboardResizeAction | undefined {
    if (key === CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT.shortcutKey) {
        return {type: 'step', step: -CONST.TABLES.COLUMN_RESIZE.KEYBOARD_STEP};
    }

    if (key === CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey) {
        return {type: 'step', step: CONST.TABLES.COLUMN_RESIZE.KEYBOARD_STEP};
    }

    const isEnter = key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey;
    const isSpace = code === CONST.KEYBOARD_SHORTCUTS.SPACE.shortcutKey && key === CONST.KEYBOARD_SHORTCUTS.SPACE.trigger.DEFAULT.input;

    if (isEnter || isSpace) {
        return {type: 'toggleFit'};
    }

    return undefined;
}

export default getKeyboardResizeAction;
export type {KeyboardResizeAction};
