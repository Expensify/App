import type {View} from 'react-native';
import type {FocusableItem} from './ContentContext';

// Inlined from `Node.compareDocumentPosition` — neither RN nor the test renderer exposes `Node`.
const DOCUMENT_POSITION_PRECEDING = 0x02;
const DOCUMENT_POSITION_FOLLOWING = 0x04;

// `compareDocumentPosition` exists at runtime on Fabric `ReadOnlyNode` and on the DOM but isn't in RN's TS types.
type ComparablePositionNode = View & {compareDocumentPosition: (other: ComparablePositionNode) => number};

/** Falls back to insertion order when refs haven't flushed (e.g. `react-test-renderer`, RN Old Arch). */
function useOrderedIDs(registry: Map<string, FocusableItem>): string[] {
    return [...registry.entries()].sort(([, a], [, b]) => compareNodes(a.ref.current, b.ref.current)).map(([id]) => id);
}

function compareNodes(a: View | null, b: View | null): number {
    if (!hasComparePosition(a) || !hasComparePosition(b)) {
        return 0;
    }
    // Leaves only — strict equality covers every case (no CONTAINS/CONTAINED_BY).
    const position = a.compareDocumentPosition(b);
    if (position === DOCUMENT_POSITION_FOLLOWING) {
        return -1;
    }
    if (position === DOCUMENT_POSITION_PRECEDING) {
        return 1;
    }
    return 0;
}

function hasComparePosition(value: View | null): value is ComparablePositionNode {
    return value !== null && 'compareDocumentPosition' in value && typeof value.compareDocumentPosition === 'function';
}

export default useOrderedIDs;
