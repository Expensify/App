import CONST from '@src/CONST';

import isEnterWhileComposition from './KeyboardShortcut/isEnterWhileComposition';

/**
 * True when a keydown activates a Pressable — Enter/Space, no repeat, no IME. Modifiers pass through (RNW allows Cmd+Enter); text-editable targets are filtered downstream by `isActivatableTarget`.
 * `.key === 'Enter'` covers numpad too; `.code === 'Space'` matches SPACE.shortcutKey.
 */
function isActivationKeydown(e: KeyboardEvent): boolean {
    if (e.repeat || e.isComposing) {
        return false;
    }
    // Safari's IME-Enter reports `isComposing: false`; the helper catches it via `keyCode === 229`.
    if (isEnterWhileComposition(e)) {
        return false;
    }
    return e.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey || e.code === CONST.KEYBOARD_SHORTCUTS.SPACE.shortcutKey;
}

export default isActivationKeydown;
