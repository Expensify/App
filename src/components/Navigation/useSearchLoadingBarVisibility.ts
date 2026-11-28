/**
 * Whether the loading bar above wide Search is showing: while the current search loads online, or while report
 * requests are in flight. TopBar hides it while a wide right pane covers the page, since that pane loads on its own.
 */
import {useSearchResultsContext} from '@components/Search/SearchContext';

import {useLoadingBarVisibility} from '@hooks/useInFlightRequests';
import useNetwork from '@hooks/useNetwork';

function useSearchLoadingBarVisibility(): boolean {
    const {isOffline} = useNetwork();
    const shouldShowLoadingBarForReports = useLoadingBarVisibility();
    const {currentSearchResults} = useSearchResultsContext();

    const isSearchLoading = !!currentSearchResults?.search?.isLoading;

    return (!isOffline && isSearchLoading) || shouldShowLoadingBarForReports;
}

export default useSearchLoadingBarVisibility;
