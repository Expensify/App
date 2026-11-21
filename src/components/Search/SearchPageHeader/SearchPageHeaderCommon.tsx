import useShouldUseFlatNavigationBar from '@components/Navigation/FlatNavigationBar/useShouldUseFlatNavigationBar';
import TopBar from '@components/Navigation/TopBar';
import useSearchLoadingBarVisibility from '@components/Navigation/useSearchLoadingBarVisibility';
import {useSearchQueryContext} from '@components/Search/SearchContext';

import useActiveSavedSearch from '@hooks/useActiveSavedSearch';
import useLocalize from '@hooks/useLocalize';

import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

import getSearchPageHeaderTitle from './getSearchPageHeaderTitle';

type SearchPageHeaderCommonProps = {
    queryJSONType: SearchDataTypes;
};

function SearchPageHeaderCommon({queryJSONType}: SearchPageHeaderCommonProps) {
    const {translate} = useLocalize();
    const {currentSearchKey, suggestedSearches} = useSearchQueryContext();
    const selectedItem = currentSearchKey ? suggestedSearches[currentSearchKey] : undefined;
    const activeSavedSearch = useActiveSavedSearch();
    const title = getSearchPageHeaderTitle({translate, type: queryJSONType, activeSavedSearch, selectedItem});
    const shouldUseFlatNavigationBar = useShouldUseFlatNavigationBar();
    const shouldShowSearchLoadingBar = useSearchLoadingBarVisibility();

    return (
        <TopBar
            breadcrumbLabel={title}
            shouldDisplayHelpButton
            // The Spend column draws this bar along its own top bar. The flat navigation bar has no such column, so the page header draws it in the same line instead.
            shouldShowLoadingBar={shouldUseFlatNavigationBar && shouldShowSearchLoadingBar}
        />
    );
}

export default SearchPageHeaderCommon;
