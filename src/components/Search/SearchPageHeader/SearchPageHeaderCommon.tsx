import TopBar from '@components/Navigation/TopBar';
import {useSearchQueryContext} from '@components/Search/SearchContext';

import useActiveSavedSearch from '@hooks/useActiveSavedSearch';
import useLocalize from '@hooks/useLocalize';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';

import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

import getSearchPageHeaderTitle from './getSearchPageHeaderTitle';

type SearchPageHeaderCommonProps = {
    queryJSONType: SearchDataTypes;
    shouldShowLoadingBar?: boolean;
};

function SearchPageHeaderCommon({queryJSONType, shouldShowLoadingBar}: SearchPageHeaderCommonProps) {
    const {translate} = useLocalize();
    const typeMenuSections = useSearchTypeMenuSections();
    const {currentSearchKey} = useSearchQueryContext();
    const selectedItem = typeMenuSections.flatMap((section) => section.menuItems).find((item) => item.key === currentSearchKey);
    const activeSavedSearch = useActiveSavedSearch();
    const title = getSearchPageHeaderTitle({translate, type: queryJSONType, activeSavedSearch, selectedItem});

    return (
        <TopBar
            shouldShowLoadingBar={shouldShowLoadingBar}
            breadcrumbLabel={title}
            shouldDisplayHelpButton
        />
    );
}

export default SearchPageHeaderCommon;
