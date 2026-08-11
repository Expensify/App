import TopBar from '@components/Navigation/TopBar';
import type {SearchQueryJSON} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';

import SearchSelectedNarrow from '@pages/Search/SearchSelectedNarrow';

import React from 'react';

import getSearchPageHeaderTitle from './getSearchPageHeaderTitle';

type SearchPageHeaderNarrowProps = {
    queryJSON: SearchQueryJSON;
    shouldShowLoadingBar: boolean;
    isMobileSelectionModeEnabled: boolean;
};

function SearchPageHeaderNarrow({queryJSON, shouldShowLoadingBar = false, isMobileSelectionModeEnabled}: SearchPageHeaderNarrowProps) {
    const {translate} = useLocalize();
    const {typeMenuSections, activeItemIndex, activeSavedSearch} = useSearchTypeMenuSections(queryJSON);
    const selectedItem = activeItemIndex >= 0 ? typeMenuSections.flatMap((section) => section.menuItems).at(activeItemIndex) : undefined;

    const title = getSearchPageHeaderTitle({translate, type: queryJSON.type, activeSavedSearch, selectedItem});

    if (isMobileSelectionModeEnabled) {
        return <SearchSelectedNarrow queryJSON={queryJSON} />;
    }

    return (
        <TopBar
            shouldShowLoadingBar={shouldShowLoadingBar}
            breadcrumbLabel={title}
            shouldDisplayHelpButton
        />
    );
}

export default SearchPageHeaderNarrow;
