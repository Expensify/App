import {useSearchSelectionContext} from '@components/Search/SearchContext';

import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';

/**
 * Whether the wide layout's floating bulk action bar is showing for the transactions selected in a report.
 *
 * Both the bar and the list underneath it depend on this: the list has to reserve the space the bar floats over, or its
 * last rows sit behind the bar once you scroll to the bottom. Keeping the rule here stops the two from drifting apart.
 *
 * A wide or super wide RHP counts as wide here, so the bar covers the list there too rather than sending the selection
 * back to the header.
 */
function useShouldShowReportBulkActionBar(): boolean {
    const {shouldUseNarrowLayout} = useResponsiveLayoutOnWideRHP();
    const {selectedTransactionIDs} = useSearchSelectionContext();

    if (shouldUseNarrowLayout) {
        return false;
    }

    return selectedTransactionIDs.length > 0;
}

export default useShouldShowReportBulkActionBar;
