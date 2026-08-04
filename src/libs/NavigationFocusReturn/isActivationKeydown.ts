import isEnterWhileComposition from '@libs/KeyboardShortcut/isEnterWhileComposition';

import CONST from '@src/CONST';

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
    // Space requires both `.code` (physical key) and `.key` (produced value) — OS-level remaps can turn Space into a printable char while keeping the `.code`.
    return e.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey || (e.code === CONST.KEYBOARD_SHORTCUTS.SPACE.shortcutKey && e.key === CONST.KEYBOARD_SHORTCUTS.SPACE.trigger.DEFAULT.input);
}

export default isActivationKeydown;
