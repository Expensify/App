import type {FocusableItem} from '@components/PopoverMenu/v2/content/ContentContext';

function useOrderedIDs(registry: Map<string, FocusableItem>): string[] {
    return [...registry.keys()];
}

export default useOrderedIDs;
