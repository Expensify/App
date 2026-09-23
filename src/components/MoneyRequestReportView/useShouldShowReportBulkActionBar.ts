import {useSearchSelectionContext} from '@components/Search/SearchContext';

import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';

/**
 * Whether the wide layout's floating bulk action bar is showing for the transactions selected in a report.
 *
 * The list reads this as well as the bar, because it has to pad its content by the height the bar floats over. Were the
 * two conditions written out separately, a selection could reserve that padding without a bar to fill it.
 *
 * A wide or super wide RHP counts as wide, so the bar covers the list there too rather than sending the selection back
 * to the header.
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
