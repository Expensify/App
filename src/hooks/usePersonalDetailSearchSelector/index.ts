import usePersonalDetailSearchSelectorBase from './base';
import type {ContactState, UseSearchSelectorConfig, UseSearchSelectorReturn} from './base';

/**
 * Hook that combines search functionality with selection logic for option lists.
 * Leverages heap optimization for performance with large datasets.
 * Web version without phone contacts integration.
 *
 * @param config - Configuration object for the hook
 * @returns Object with search and selection utilities
 */
function usePersonalDetailSearchSelector(config: UseSearchSelectorConfig): UseSearchSelectorReturn {
    return usePersonalDetailSearchSelectorBase(config);
}

export default usePersonalDetailSearchSelector;
export type {ContactState};
