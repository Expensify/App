import type {FocusableItem} from '@components/PopoverMenu/v2/ContentContext';

/** Native: returns mount order; no DOM API for tree-position. Late-mounting items may diverge from JSX order. */
function useOrderedIds(registry: Map<string, FocusableItem>): string[] {
    return [...registry.keys()];
}

export default useOrderedIds;
