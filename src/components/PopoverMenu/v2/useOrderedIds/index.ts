import type {FocusableItem} from '@components/PopoverMenu/v2/ContentContext';

/** Web: sorts ids by DOM order via `compareDocumentPosition`. The `instanceof Element` guard makes it a no-op in `react-test-renderer`. */
function useOrderedIds(registry: Map<string, FocusableItem>): string[] {
    return [...registry.entries()].sort(([, a], [, b]) => compareNodes(a.ref.current, b.ref.current)).map(([id]) => id);
}

function compareNodes(a: unknown, b: unknown): number {
    if (!isElement(a) || !isElement(b)) {
        return 0;
    }
    // Items are always leaves — no CONTAINS/CONTAINED_BY flags — so strict equality covers every case.
    const position = a.compareDocumentPosition(b);
    if (position === Node.DOCUMENT_POSITION_FOLLOWING) {
        return -1;
    }
    if (position === Node.DOCUMENT_POSITION_PRECEDING) {
        return 1;
    }
    return 0;
}

function isElement(value: unknown): value is Element {
    return typeof Element !== 'undefined' && value instanceof Element;
}

export default useOrderedIds;
