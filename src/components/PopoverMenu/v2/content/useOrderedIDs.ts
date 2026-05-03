import type {FocusableItem} from './ContentContext';

// W3C-defined return-bitmask values from `Node.compareDocumentPosition`. Inlined because
// neither React Native nor the test renderer exposes a `Node` global to read them from.
const DOCUMENT_POSITION_PRECEDING = 0x02;
const DOCUMENT_POSITION_FOLLOWING = 0x04;

/**
 * Sorts ids by their tree position via `compareDocumentPosition` — supported by both the
 * DOM and React Native's New Architecture (`ReadOnlyNode`). Falls back to mount/insertion
 * order when no comparable node is attached yet (e.g. `react-test-renderer`, RN's Old
 * Architecture, or before refs flush).
 */
function useOrderedIDs(registry: Map<string, FocusableItem>): string[] {
    return [...registry.entries()].sort(([, a], [, b]) => compareNodes(a.ref.current, b.ref.current)).map(([id]) => id);
}

function compareNodes(a: unknown, b: unknown): number {
    if (!hasComparePosition(a) || !hasComparePosition(b)) {
        return 0;
    }
    // Items are always leaves — no CONTAINS/CONTAINED_BY flags — so strict equality covers every case.
    const position = a.compareDocumentPosition(b);
    if (position === DOCUMENT_POSITION_FOLLOWING) {
        return -1;
    }
    if (position === DOCUMENT_POSITION_PRECEDING) {
        return 1;
    }
    return 0;
}

type ComparablePositionNode = {compareDocumentPosition: (other: unknown) => number};

function hasComparePosition(value: unknown): value is ComparablePositionNode {
    return value !== null && typeof value === 'object' && typeof (value as Partial<ComparablePositionNode>).compareDocumentPosition === 'function';
}

export default useOrderedIDs;
