import type {View} from 'react-native';

import type {FocusableItem} from './ContentContext';

// W3C `compareDocumentPosition` bit flags.
const DOCUMENT_POSITION_PRECEDING = 0x02;
const DOCUMENT_POSITION_FOLLOWING = 0x04;

/** Keyboard navigation follows visual order, not registration order. */
function useOrderedIDs(registry: Map<string, FocusableItem>): string[] {
    return [...registry.entries()].sort(([, a], [, b]) => compareNodes(a.ref.current, b.ref.current)).map(([id]) => id);
}

function compareNodes(a: View | null, b: View | null): number {
    // Stable-sort fallback: refs may not have attached on the first commit after registration.
    if (a === null || b === null) {
        return 0;
    }
    const position = a.compareDocumentPosition(b);
    // eslint-disable-next-line no-bitwise -- bit-test required to read DOM bit-field flags
    if ((position & DOCUMENT_POSITION_FOLLOWING) !== 0) {
        return -1;
    }
    // eslint-disable-next-line no-bitwise -- bit-test required to read DOM bit-field flags
    if ((position & DOCUMENT_POSITION_PRECEDING) !== 0) {
        return 1;
    }
    return 0;
}

export default useOrderedIDs;
