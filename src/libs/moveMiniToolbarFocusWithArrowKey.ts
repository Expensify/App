/**
 * Arrow-key focus movement for the report-action context menu.
 * Only runs after Tab so a mouse click cannot start keyboard navigation,
 * which is the same split EmojiPickerMenu uses with isUsingKeyboardMovement.
 */
import CONST from '@src/CONST';

import DomUtils from './DomUtils';
import getHadTabNavigation from './hadTabNavigation';

type ToolbarKeyModifiers = {
    altKey?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
};

type ToolbarKeyDownEvent = ToolbarKeyModifiers & {
    key?: string;
    nativeEvent?: ToolbarKeyModifiers & {key?: string};
    currentTarget?: EventTarget | null;
    preventDefault: () => void;
};

const TOOLBAR_BUTTON_SELECTOR = `[role="${CONST.ROLE.BUTTON}"]`;

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

function canQueryToolbarButtons(node: EventTarget | null | undefined): node is Node & ParentNode {
    return !!node && 'querySelectorAll' in node && typeof node.querySelectorAll === 'function';
}

function hasModifierKey(event: ToolbarKeyDownEvent): boolean {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return true;
    }
    const nativeEvent = event.nativeEvent;
    if (!nativeEvent) {
        return false;
    }
    return !!nativeEvent.altKey || !!nativeEvent.ctrlKey || !!nativeEvent.metaKey || !!nativeEvent.shiftKey;
}

function isActiveToolbarButton(button: Element, activeElement: Element | null): boolean {
    if (!activeElement) {
        return false;
    }
    return button === activeElement || button.contains(activeElement);
}

function isHorizontalArrowKey(key: string): boolean {
    return key === CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey || key === CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT.shortcutKey;
}

function getReactionRow(root: EventTarget | null | undefined, activeElement: Element): (Node & ParentNode) | null {
    if (!canQueryToolbarButtons(root) || !root.contains(activeElement)) {
        return null;
    }

    let node: Element | null = activeElement.parentElement;
    while (node && node !== root) {
        if (node.querySelectorAll(TOOLBAR_BUTTON_SELECTOR).length > 1) {
            return node;
        }
        node = node.parentElement;
    }

    return null;
}

function moveToolbarFocusWithArrowKey(event: ToolbarKeyDownEvent, toolbar: EventTarget | null | undefined): void {
    // Mouse clicks clear this flag, so arrows must not steal focus after a pointer reaction.
    if (!getHadTabNavigation()) {
        return;
    }

    const key = getPressedKey(event);
    // Arrow shortcuts have empty modifier lists. Alt+Arrow is browser history, so do not steal it.
    if (!isArrowKey(key) || hasModifierKey(event)) {
        return;
    }

    if (!canQueryToolbarButtons(toolbar)) {
        return;
    }

    const buttons = toolbar.querySelectorAll(TOOLBAR_BUTTON_SELECTOR);
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

function moveMiniToolbarFocusWithArrowKey(event: ToolbarKeyDownEvent): void {
    moveToolbarFocusWithArrowKey(event, event.currentTarget);
}

function moveFullContextMenuFocusWithArrowKey(event: ToolbarKeyDownEvent): void {
    const key = getPressedKey(event);
    if (!isHorizontalArrowKey(key)) {
        return;
    }

    const activeElement = DomUtils.getActiveElement();
    if (!(activeElement instanceof Element)) {
        return;
    }

    // The long-press sheet has a reaction row above a vertical list. Left/Right must stay in that
    // row so they do not walk into the list.
    const reactionRow = getReactionRow(event.currentTarget, activeElement);
    if (!reactionRow) {
        return;
    }

    moveToolbarFocusWithArrowKey(event, reactionRow);
}

export default moveMiniToolbarFocusWithArrowKey;
export {getAdjacentHorizontalIndex, moveFullContextMenuFocusWithArrowKey, TOOLBAR_BUTTON_SELECTOR};
