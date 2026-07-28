const COPYABLE_TEXT_SELECTOR = '[data-copyable-text=true]';

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

export {isCopyableTextTarget, shouldSuppressCopyableTextPress};
