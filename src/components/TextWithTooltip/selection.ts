import CONST from '@src/CONST';

import {useEffect, useRef} from 'react';

/**
 * Helpers for detecting explicitly copyable text inside pressable rows, so row handlers can allow
 * native text selection without triggering row navigation after drag-select.
 */
const COPYABLE_TEXT_SELECTOR = `[data-${CONST.COPYABLE_TEXT_ELEMENT}=true]`;
const COPYABLE_TEXT_DATA_SET = {[CONST.COPYABLE_TEXT_ELEMENT]: true} as const;
// Keep the delay short while leaving enough time for the browser to report a second click.
const COPYABLE_TEXT_SINGLE_PRESS_DELAY_MS = 300;

type CaretPosition = {
    offsetNode: Node | null;
    offset: number;
};

type DocumentWithCaretHelpers = Document & {
    // Browsers expose different caret APIs for finding the text node under a pointer.
    caretPositionFromPoint?: (x: number, y: number) => CaretPosition | null;
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
};

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

function getTextNodeAtMousePosition(clientX: number, clientY: number): {node: Node; offset: number} | null {
    if (typeof document === 'undefined' || typeof Node === 'undefined') {
        return null;
    }

    const ownerDocument: DocumentWithCaretHelpers = document;

    if (typeof ownerDocument.caretPositionFromPoint === 'function') {
        const position = ownerDocument.caretPositionFromPoint(clientX, clientY);
        if (position?.offsetNode?.nodeType === Node.TEXT_NODE) {
            return {node: position.offsetNode, offset: position.offset};
        }
    }

    if (typeof ownerDocument.caretRangeFromPoint === 'function') {
        const range = ownerDocument.caretRangeFromPoint(clientX, clientY);
        if (range?.startContainer?.nodeType === Node.TEXT_NODE) {
            return {node: range.startContainer, offset: range.startOffset};
        }
    }

    return null;
}

function isPointInsideTextRect(node: Node, offset: number, clientX: number, clientY: number): boolean {
    const text = node.textContent ?? '';
    if (!text.trim()) {
        return false;
    }

    // Caret APIs can return a nearby text node from padding/empty space, so confirm the pointer is inside a glyph rect.
    const offsetsToCheck = [offset, offset - 1].filter((textOffset) => textOffset >= 0 && textOffset < text.length);

    for (const textOffset of offsetsToCheck) {
        const range = document.createRange();
        range.setStart(node, textOffset);
        range.setEnd(node, textOffset + 1);

        for (const rect of Array.from(range.getClientRects())) {
            if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
                return true;
            }
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
    const textPosition = getTextNodeAtMousePosition(position.clientX, position.clientY);
    if (!textPosition || !isCopyableTextTarget(textPosition.node)) {
        return false;
    }

    return isPointInsideTextRect(textPosition.node, textPosition.offset, position.clientX, position.clientY);
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
    // Single-click row actions from copyable text are delayed so a following double-click can cancel them.
    const pendingCopyableTextPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearPendingCopyableTextPress = () => {
        if (!pendingCopyableTextPressRef.current) {
            return;
        }

        clearTimeout(pendingCopyableTextPressRef.current);
        pendingCopyableTextPressRef.current = null;
    };

    useEffect(
        () => () => {
            if (!pendingCopyableTextPressRef.current) {
                return;
            }

            clearTimeout(pendingCopyableTextPressRef.current);
            pendingCopyableTextPressRef.current = null;
        },
        [],
    );

    const markMouseDownOnCopyableText = (target: EventTarget | null | undefined, shouldCheck = true, shouldSuppressNextPress = false): boolean => {
        // A second click on text cancels any pending single-click row action before it can expand/collapse the group.
        clearPendingCopyableTextPress();
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

    const handleCopyableTextRowPress = (onPress: () => void, shouldCheck = true, shouldDelayCopyableTextPress = false) => {
        // Delay only copyable-text single clicks so double-click text selection can cancel the row press; non-text clicks run immediately.
        const shouldDelayPress = shouldCheck && shouldDelayCopyableTextPress && wasMouseDownOnCopyableTextRef.current && !shouldSuppressNextPressRef.current;
        if (shouldSuppressCopyableTextRowPress(shouldCheck)) {
            return;
        }

        if (!shouldDelayPress) {
            onPress();
            return;
        }

        pendingCopyableTextPressRef.current = setTimeout(() => {
            pendingCopyableTextPressRef.current = null;
            onPress();
        }, COPYABLE_TEXT_SINGLE_PRESS_DELAY_MS);
    };

    return {
        markMouseDownOnCopyableText,
        shouldSuppressCopyableTextRowPress,
        handleCopyableTextRowPress,
    };
}

export {COPYABLE_TEXT_DATA_SET, COPYABLE_TEXT_SELECTOR, isMouseDownOnCopyableText, shouldSuppressCopyableTextPressOnMouseDown, useCopyableTextRowPress};
