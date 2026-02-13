import useSearchSelectorBase from './useSearchSelector.base';
import type {ContactState, UseSearchSelectorConfig, UseSearchSelectorReturn} from './useSearchSelector.base';

/**
 * Hook that combines search functionality with selection logic for option lists.
 * Leverages heap optimization for performance with large datasets.
 * Web version without phone contacts integration.
 *
 * @param config - Configuration object for the hook
 * @returns Object with search and selection utilities
 */
function useSearchSelector(config: UseSearchSelectorConfig): UseSearchSelectorReturn {
    return useSearchSelectorBase(config);
}

export default useSearchSelector;
export type {ContactState};
