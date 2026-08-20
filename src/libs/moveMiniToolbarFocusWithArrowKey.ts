/**
 * Arrow-key focus movement for the mini report-action toolbar.
 * Only runs after Tab so a mouse click cannot start keyboard navigation,
 * which is the same split EmojiPickerMenu uses with isUsingKeyboardMovement.
 */
import CONST from '@src/CONST';

import DomUtils from './DomUtils';
import getHadTabNavigation from './hadTabNavigation';

type ToolbarKeyDownEvent = {
    key?: string;
    nativeEvent?: {key?: string};
    currentTarget?: EventTarget | null;
    preventDefault: () => void;
};

function getPressedKey(event: ToolbarKeyDownEvent): string {
    if (typeof event.key === 'string') {
        return event.key;
    }
    if (typeof event.nativeEvent?.key === 'string') {
        return event.nativeEvent.key;
    }
    return '';
}

function isArrowKey(key: string): boolean {
    return (
        key === CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey ||
        key === CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT.shortcutKey ||
        key === CONST.KEYBOARD_SHORTCUTS.ARROW_UP.shortcutKey ||
        key === CONST.KEYBOARD_SHORTCUTS.ARROW_DOWN.shortcutKey
    );
}

/**
 * Returns the next index in a horizontal toolbar for an arrow key.
 * Non-arrow keys and moves past either end keep the current index.
 */
function getAdjacentHorizontalIndex(currentIndex: number, key: string, lastIndex: number): number {
    const isNext = key === CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey || key === CONST.KEYBOARD_SHORTCUTS.ARROW_DOWN.shortcutKey;
    const isPrevious = key === CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT.shortcutKey || key === CONST.KEYBOARD_SHORTCUTS.ARROW_UP.shortcutKey;

    if (isNext) {
        return Math.min(currentIndex + 1, lastIndex);
    }
    if (isPrevious) {
        return Math.max(currentIndex - 1, 0);
    }
    return currentIndex;
}

function canQueryToolbarButtons(node: EventTarget | null | undefined): node is ParentNode {
    return !!node && 'querySelectorAll' in node && typeof node.querySelectorAll === 'function';
}

function isActiveToolbarButton(button: Element, activeElement: Element | null): boolean {
    if (!activeElement) {
        return false;
    }
    return button === activeElement || button.contains(activeElement);
}

function moveMiniToolbarFocusWithArrowKey(event: ToolbarKeyDownEvent): void {
    // Mouse clicks clear this flag, so arrows must not steal focus after a pointer reaction.
    if (!getHadTabNavigation()) {
        return;
    }

    const key = getPressedKey(event);
    if (!isArrowKey(key)) {
        return;
    }

    const toolbar = event.currentTarget;
    if (!canQueryToolbarButtons(toolbar)) {
        return;
    }

    const buttons = toolbar.querySelectorAll(`[role="${CONST.ROLE.BUTTON}"]`);
    const lastIndex = buttons.length - 1;
    if (lastIndex < 0) {
        return;
    }

    const activeElement = DomUtils.getActiveElement();
    const currentIndex = Array.from(buttons).findIndex((button) => isActiveToolbarButton(button, activeElement));
    if (currentIndex < 0) {
        return;
    }

    event.preventDefault();
    const nextIndex = getAdjacentHorizontalIndex(currentIndex, key, lastIndex);
    if (nextIndex === currentIndex) {
        return;
    }

    const target = buttons.item(nextIndex);
    if (target instanceof HTMLElement) {
        target.focus();
    }
}

export default moveMiniToolbarFocusWithArrowKey;
export {getAdjacentHorizontalIndex};
export type {ToolbarKeyDownEvent};
