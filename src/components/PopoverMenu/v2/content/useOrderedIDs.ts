import type {View} from 'react-native';
import type {FocusableItem} from './ContentContext';

// W3C DOM `compareDocumentPosition` bit flags.
const DOCUMENT_POSITION_PRECEDING = 0x02;
const DOCUMENT_POSITION_FOLLOWING = 0x04;

/** Keyboard navigation follows visual order regardless of registration order. */
function useOrderedIDs(registry: Map<string, FocusableItem>): string[] {
    return [...registry.entries()].sort(([, a], [, b]) => compareNodes(a.ref.current, b.ref.current)).map(([id]) => id);
}

function compareNodes(a: View | null, b: View | null): number {
    // Refs may not have attached on the first commit after registration; preserve insertion order via stable sort.
    if (a === null || b === null) {
        return 0;
    }
    // Bitmask: compareDocumentPosition returns a bitfield
    const position = a.compareDocumentPosition(b);
    // eslint-disable-next-line no-bitwise -- bit-test required to read DOM bitfield flags
    if ((position & DOCUMENT_POSITION_FOLLOWING) !== 0) {
        return -1;
    }
    // eslint-disable-next-line no-bitwise -- bit-test required to read DOM bitfield flags
    if ((position & DOCUMENT_POSITION_PRECEDING) !== 0) {
        return 1;
    }
    return 0;
}

export default useOrderedIDs;
