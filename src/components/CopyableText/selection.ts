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

    const markMouseDownOnCopyableText = (target: EventTarget | null | undefined, shouldCheck = true): boolean => {
        const isCopyableTarget = shouldCheck && isCopyableTextTarget(target);
        wasMouseDownOnCopyableTextRef.current = isCopyableTarget;
        return isCopyableTarget;
    };

    const shouldSuppressCopyableTextRowPress = (shouldCheck = true): boolean => {
        const shouldSuppressPress = shouldCheck && shouldSuppressCopyableTextPress(wasMouseDownOnCopyableTextRef.current);
        wasMouseDownOnCopyableTextRef.current = false;
        return shouldSuppressPress;
    };

    // Pointer focus from copyable text should not make virtualized lists scroll the row into view.
    const shouldSuppressCopyableTextRowFocus = () => wasMouseDownOnCopyableTextRef.current;

    return {
        markMouseDownOnCopyableText,
        shouldSuppressCopyableTextRowFocus,
        shouldSuppressCopyableTextRowPress,
    };
}

export {COPYABLE_ROW_DATA_SET, COPYABLE_ROW_SELECTOR, COPYABLE_TEXT_DATA_SET, COPYABLE_TEXT_SELECTOR, useCopyableTextRowPress};
