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
            // Without the Spend column, which normally draws this bar, the page header draws it.
            shouldShowLoadingBar={shouldUseFlatNavigationBar && shouldShowSearchLoadingBar}
        />
    );
}

export default SearchPageHeaderCommon;
