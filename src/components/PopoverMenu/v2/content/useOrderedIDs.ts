import type {View} from 'react-native';
import type {FocusableItem} from './ContentContext';

// W3C DOM `compareDocumentPosition` bit flags.
const DOCUMENT_POSITION_PRECEDING = 0x02;
const DOCUMENT_POSITION_FOLLOWING = 0x04;

/** Sorts the registry by DOM order so keyboard navigation matches visual order regardless of registration order. */
function useOrderedIDs(registry: Map<string, FocusableItem>): string[] {
    return [...registry.entries()].sort(([, a], [, b]) => compareNodes(a.ref.current, b.ref.current)).map(([id]) => id);
}

function compareNodes(a: View | null, b: View | null): number {
    // Refs may not have attached on the first commit after registration; preserve insertion order via stable sort.
    if (a === null || b === null) {
        return 0;
    }
    const position = a.compareDocumentPosition(b);
    if (position === DOCUMENT_POSITION_FOLLOWING) {
        return -1;
    }
    if (position === DOCUMENT_POSITION_PRECEDING) {
        return 1;
    }
    return 0;
}

export default useOrderedIDs;
