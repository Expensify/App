import CONST from '@src/CONST';

import {useRef} from 'react';

const COPYABLE_TEXT_SELECTOR = `[data-${CONST.COPYABLE_TEXT_ELEMENT}=true]`;

type MarkCopyableTextMouseDownOptions = {
    shouldSuppressNextPress?: boolean;
};

type HandleCopyableTextRowPressOptions = {
    shouldCheck?: boolean;
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

function getTouchPosition(touches: unknown): {clientX: number; clientY: number} | null {
    if (typeof touches !== 'object' || touches === null || !('0' in touches)) {
        return null;
    }

    const touch = touches[0];
    if (typeof touch !== 'object' || touch === null || !('clientX' in touch) || !('clientY' in touch) || typeof touch.clientX !== 'number' || typeof touch.clientY !== 'number') {
        return null;
    }

    return {clientX: touch.clientX, clientY: touch.clientY};
}

function getPressStartPosition(event: unknown): {clientX: number; clientY: number} | null {
    if (typeof event !== 'object' || event === null) {
        return null;
    }

    if ('clientX' in event && 'clientY' in event && typeof event.clientX === 'number' && typeof event.clientY === 'number') {
        return {clientX: event.clientX, clientY: event.clientY};
    }

    if ('touches' in event) {
        const touchPosition = getTouchPosition(event.touches);
        if (touchPosition) {
            return touchPosition;
        }
    }

    if (!('nativeEvent' in event) || typeof event.nativeEvent !== 'object' || event.nativeEvent === null) {
        return null;
    }

    const {nativeEvent} = event;
    if ('clientX' in nativeEvent && 'clientY' in nativeEvent && typeof nativeEvent.clientX === 'number' && typeof nativeEvent.clientY === 'number') {
        return {clientX: nativeEvent.clientX, clientY: nativeEvent.clientY};
    }

    if ('touches' in nativeEvent) {
        return getTouchPosition(nativeEvent.touches);
    }

    return null;
}

function getPressStartTarget(event: unknown): EventTarget | null {
    if (typeof EventTarget === 'undefined' || typeof event !== 'object' || event === null || !('target' in event) || !(event.target instanceof EventTarget)) {
        return null;
    }

    return event.target;
}

function isPressStartOnCopyableText(event: unknown): boolean {
    const position = getPressStartPosition(event);
    const copyableElement = getCopyableTextElement(getPressStartTarget(event));
    if (!position || !copyableElement || typeof document === 'undefined' || typeof NodeFilter === 'undefined') {
        return false;
    }

    const walker = document.createTreeWalker(copyableElement, NodeFilter.SHOW_TEXT);
    let textNode = walker.nextNode();

    while (textNode) {
        if (textNode.textContent?.trim()) {
            const range = document.createRange();
            range.selectNodeContents(textNode);

            const isInsideText = Array.from(range.getClientRects()).some(
                (rect) => position.clientX >= rect.left && position.clientX <= rect.right && position.clientY >= rect.top && position.clientY <= rect.bottom,
            );
            if (isInsideText) {
                return true;
            }
        }
        textNode = walker.nextNode();
    }

    return false;
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
    const wasTouchStartOnCopyableTextRef = useRef(false);
    const shouldSuppressNextPressRef = useRef(false);

    const markMouseDownOnCopyableText = (target: EventTarget | null | undefined, shouldCheck = true, {shouldSuppressNextPress = false}: MarkCopyableTextMouseDownOptions = {}): boolean => {
        const isCopyableTarget = shouldCheck && isCopyableTextTarget(target);
        wasMouseDownOnCopyableTextRef.current = isCopyableTarget;
        shouldSuppressNextPressRef.current = isCopyableTarget && shouldSuppressNextPress;
        return isCopyableTarget;
    };

    const markTouchStartOnCopyableText = (event: unknown, shouldCheck = true): boolean => {
        const isCopyableTarget = shouldCheck && isCopyableTextTarget(getPressStartTarget(event));
        wasMouseDownOnCopyableTextRef.current = false;
        wasTouchStartOnCopyableTextRef.current = isCopyableTarget;
        shouldSuppressNextPressRef.current = false;
        return isCopyableTarget;
    };

    const shouldSuppressCopyableTextRowPress = (shouldCheck = true): boolean => {
        const didPressStartOnCopyableText = wasMouseDownOnCopyableTextRef.current || wasTouchStartOnCopyableTextRef.current;
        const shouldSuppressPress = shouldCheck && (shouldSuppressNextPressRef.current || shouldSuppressCopyableTextPress(didPressStartOnCopyableText));
        wasMouseDownOnCopyableTextRef.current = false;
        wasTouchStartOnCopyableTextRef.current = false;
        shouldSuppressNextPressRef.current = false;
        return shouldSuppressPress;
    };

    const shouldSuppressCopyableTextRowLongPress = (shouldCheck = true): boolean => {
        const shouldSuppressLongPress = shouldCheck && wasTouchStartOnCopyableTextRef.current;
        shouldSuppressNextPressRef.current = shouldSuppressLongPress;
        return shouldSuppressLongPress;
    };

    const handleCopyableTextRowPress = (onPress: () => void, {shouldCheck = true}: HandleCopyableTextRowPressOptions = {}) => {
        if (shouldSuppressCopyableTextRowPress(shouldCheck)) {
            return;
        }

        onPress();
    };

    // Pointer focus from copyable text should not make virtualized lists scroll the row into view.
    const shouldSuppressCopyableTextRowFocus = () => wasMouseDownOnCopyableTextRef.current;

    return {
        handleCopyableTextRowPress,
        markMouseDownOnCopyableText,
        markTouchStartOnCopyableText,
        shouldSuppressCopyableTextRowFocus,
        shouldSuppressCopyableTextRowLongPress,
        shouldSuppressCopyableTextRowPress,
    };
}

export {isPressStartOnCopyableText};
export default useCopyableTextRowPress;
