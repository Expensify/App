import {useSearchSelectionContext} from '@components/Search/SearchContext';
import {useSelectionCounts} from '@components/Search/SearchSelectionProvider';
import type {SearchQueryJSON} from '@components/Search/types';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import CONST from '@src/CONST';

/**
 * Whether the wide layout's floating bulk action bar is showing for the current selection.
 *
 * Both the bar and the list underneath it depend on this: the list has to reserve the space the bar floats over, or its
 * last rows sit behind the bar once you scroll to the bottom. Keeping the rule here stops the two from drifting apart.
 *
 * An expense search asks the selection whether anything is selected rather than counting rows, because selecting every
 * matching item is recorded as a flag instead of a row per item, which a count cannot see.
 */
function useShouldShowBulkActionBar(queryJSON: SearchQueryJSON): boolean {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {hasSelectedTransactions} = useSearchSelectionContext();
    const {selected} = useSelectionCounts();

    if (shouldUseNarrowLayout) {
        return false;
    }

    return queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE ? hasSelectedTransactions : selected > 0;
}

export default useShouldShowBulkActionBar;
