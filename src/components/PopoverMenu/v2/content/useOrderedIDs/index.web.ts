import type {FocusableItem} from '@components/PopoverMenu/v2/content/ContentContext';

function useOrderedIDs(registry: Map<string, FocusableItem>): string[] {
    return [...registry.entries()].sort(([, a], [, b]) => compareNodes(a.ref.current, b.ref.current)).map(([id]) => id);
}

function compareNodes(a: unknown, b: unknown): number {
    if (!(a instanceof Element) || !(b instanceof Element)) {
        return 0;
    }
    const position = a.compareDocumentPosition(b);
    if (hasFlag(position, Node.DOCUMENT_POSITION_FOLLOWING)) {
        return -1;
    }
    if (hasFlag(position, Node.DOCUMENT_POSITION_PRECEDING)) {
        return 1;
    }
    return 0;
}

function hasFlag(value: number, flag: number): boolean {
    // eslint-disable-next-line no-bitwise -- bit-field test against DOM position flags
    return (value & flag) !== 0;
}

export default useOrderedIDs;
