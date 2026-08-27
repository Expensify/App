import CONST from '@src/CONST';

import {useRef} from 'react';

/**
 * Helpers for detecting explicitly copyable text inside pressable rows, so row handlers can allow
 * native text selection without triggering row navigation after drag-select.
 */
const COPYABLE_TEXT_SELECTOR = `[data-${CONST.COPYABLE_TEXT_ELEMENT}=true]`;
const COPYABLE_TEXT_DATA_SET = {[CONST.COPYABLE_TEXT_ELEMENT]: true} as const;
const COPYABLE_ROW_SELECTOR = `[data-${CONST.COPYABLE_ROW_ELEMENT}=true]`;
const COPYABLE_ROW_DATA_SET = {[CONST.COPYABLE_ROW_ELEMENT]: true} as const;

function getCopyableTextElement(target: EventTarget | Node | null | undefined): HTMLElement | null {
    if (typeof HTMLElement === 'undefined') {
        return null;
    }

    try {
        if (target instanceof HTMLElement) {
            return target.closest(COPYABLE_TEXT_SELECTOR);
        }

        if (typeof Node !== 'undefined' && target instanceof Node) {
            return target.parentElement?.closest(COPYABLE_TEXT_SELECTOR) ?? null;
        }
    } catch {
        return null;
    }

    return null;
}

function isCopyableTextTarget(target: EventTarget | null | undefined): boolean {
    return !!getCopyableTextElement(target);
}

function getMouseEventPosition(event: unknown): {clientX: number; clientY: number} | null {
    // React Native Web events may expose mouse coordinates directly or through nativeEvent.
    if (typeof event !== 'object' || event === null) {
        return null;
    }

    if ('clientX' in event && 'clientY' in event && typeof event.clientX === 'number' && typeof event.clientY === 'number') {
        return {clientX: event.clientX, clientY: event.clientY};
    }

    if (!('nativeEvent' in event) || typeof event.nativeEvent !== 'object' || event.nativeEvent === null) {
        return null;
    }

    const {nativeEvent} = event;
    if ('clientX' in nativeEvent && 'clientY' in nativeEvent && typeof nativeEvent.clientX === 'number' && typeof nativeEvent.clientY === 'number') {
        return {clientX: nativeEvent.clientX, clientY: nativeEvent.clientY};
    }

    return null;
}

function getMouseEventTarget(event: unknown): EventTarget | null {
    if (typeof EventTarget === 'undefined' || typeof event !== 'object' || event === null || !('target' in event) || !(event.target instanceof EventTarget)) {
        return null;
    }

    return event.target;
}

function getTextNodes(element: HTMLElement): Node[] {
    if (typeof document === 'undefined' || typeof NodeFilter === 'undefined' || typeof document.createTreeWalker !== 'function') {
        return [];
    }

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const textNodes: Node[] = [];
    let currentNode = walker.nextNode();

    while (currentNode) {
        if (currentNode.textContent?.trim()) {
            textNodes.push(currentNode);
        }
        currentNode = walker.nextNode();
    }

    return textNodes;
}

function isPointInsideRect(clientX: number, clientY: number, rect: DOMRect): boolean {
    return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
}

function isPointInsideTextNode(node: Node, clientX: number, clientY: number): boolean {
    const range = document.createRange();
    range.selectNodeContents(node);

    for (const rect of Array.from(range.getClientRects())) {
        if (isPointInsideRect(clientX, clientY, rect)) {
            return true;
        }
    }

    return false;
}

function isMouseDownOnCopyableText(event: unknown): boolean {
    const position = getMouseEventPosition(event);
    if (!position) {
        return false;
    }

    // Only treat direct text hits as copyable interactions, so blank space inside a copyable cell keeps normal row behavior.
    const copyableElement = getCopyableTextElement(getMouseEventTarget(event));
    if (!copyableElement) {
        return false;
    }

    return getTextNodes(copyableElement).some((textNode) => isPointInsideTextNode(textNode, position.clientX, position.clientY));
}

function shouldSuppressCopyableTextPressOnMouseDown(event: unknown): boolean {
    // MouseEvent.detail is greater than 1 for double/triple clicks, which should select text instead of pressing the row.
    if (typeof event !== 'object' || event === null || !('detail' in event)) {
        return false;
    }

    const {detail} = event;
    return typeof detail === 'number' && detail > 1;
}

// Row press handlers use this after mouseup/click to suppress navigation only for the drag-select gesture that started on copyable text.
function shouldSuppressCopyableTextPress(didMouseDownStartOnCopyableText: boolean): boolean {
    if (!didMouseDownStartOnCopyableText) {
        return false;
    }

    if (typeof window === 'undefined' || typeof window.getSelection !== 'function') {
        return false;
    }

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.toString().length === 0) {
        return false;
    }

    const anchorCopyableElement = getCopyableTextElement(selection.anchorNode);
    const focusCopyableElement = getCopyableTextElement(selection.focusNode);
    return !!anchorCopyableElement || !!focusCopyableElement;
}

function useCopyableTextRowPress() {
    const wasMouseDownOnCopyableTextRef = useRef(false);
    const shouldSuppressNextPressRef = useRef(false);

    const markMouseDownOnCopyableText = (target: EventTarget | null | undefined, shouldCheck = true, shouldSuppressNextPress = false): boolean => {
        const isCopyableTarget = shouldCheck && isCopyableTextTarget(target);
        wasMouseDownOnCopyableTextRef.current = isCopyableTarget;
        shouldSuppressNextPressRef.current = isCopyableTarget && shouldSuppressNextPress;
        return isCopyableTarget;
    };

    const shouldSuppressCopyableTextRowPress = (shouldCheck = true): boolean => {
        const didMouseDownStartOnCopyableText = wasMouseDownOnCopyableTextRef.current;
        const shouldSuppressNextPress = shouldSuppressNextPressRef.current;
        const shouldSuppressFromSelection = shouldCheck && shouldSuppressCopyableTextPress(didMouseDownStartOnCopyableText);
        // Some text-selection gestures, like double-click selection, can trigger press before selection text is observable.
        const shouldSuppressPress = shouldCheck && (shouldSuppressNextPress || shouldSuppressFromSelection);
        wasMouseDownOnCopyableTextRef.current = false;
        shouldSuppressNextPressRef.current = false;
        return shouldSuppressPress;
    };

    const handleCopyableTextRowPress = (onPress: () => void, shouldCheck = true) => {
        if (shouldSuppressCopyableTextRowPress(shouldCheck)) {
            return;
        }

        onPress();
    };

    return {
        markMouseDownOnCopyableText,
        shouldSuppressCopyableTextRowPress,
        handleCopyableTextRowPress,
    };
}

export {
    COPYABLE_ROW_DATA_SET,
    COPYABLE_ROW_SELECTOR,
    COPYABLE_TEXT_DATA_SET,
    COPYABLE_TEXT_SELECTOR,
    isMouseDownOnCopyableText,
    shouldSuppressCopyableTextPressOnMouseDown,
    useCopyableTextRowPress,
};
