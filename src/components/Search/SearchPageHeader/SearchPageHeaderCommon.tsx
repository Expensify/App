import TopBar from '@components/Navigation/TopBar';
import {useSearchQueryContext} from '@components/Search/SearchContext';

import useActiveSavedSearch from '@hooks/useActiveSavedSearch';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {setLastVisitedSearch} from '@libs/MoreDestinationHistory';
import navigateBackToMore from '@libs/Navigation/helpers/navigateBackToMore';
import {getSpendGroupID, getSpendGroupTranslationPath, isSearchBehindMore} from '@libs/SpendNavigationGroups';

import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

import React, {useEffect} from 'react';

import getSearchPageHeaderTitle from './getSearchPageHeaderTitle';

type SearchPageHeaderCommonProps = {
    queryJSONType: SearchDataTypes;
    shouldShowLoadingBar?: boolean;

    /** Title the page after the search's group rather than the search itself, so it holds still while tabbing within a group */
    shouldUseGroupTitle?: boolean;
};

function SearchPageHeaderCommon({queryJSONType, shouldShowLoadingBar, shouldUseGroupTitle = false}: SearchPageHeaderCommonProps) {
    const {translate} = useLocalize();
    const {currentSearchKey, currentSearchQueryJSON, suggestedSearches} = useSearchQueryContext();
    const selectedItem = currentSearchKey ? suggestedSearches[currentSearchKey] : undefined;
    const activeSavedSearch = useActiveSavedSearch();
    // Remembers where the user is inside each group, so the More menu can return them there.
    const groupID = getSpendGroupID(currentSearchKey);
    const currentQuery = currentSearchQueryJSON?.inputQuery;
    const savedSearchName = activeSavedSearch?.name;
    useEffect(() => {
        if (!groupID || !currentSearchKey || !currentQuery) {
            return;
        }
        setLastVisitedSearch(groupID, {searchKey: currentSearchKey, query: currentQuery, name: savedSearchName});
    }, [groupID, currentSearchKey, currentQuery, savedSearchName]);

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const shouldShowBackToMore = shouldUseNarrowLayout && isSearchBehindMore(currentSearchKey);
    const groupTranslationPath = shouldUseGroupTitle ? getSpendGroupTranslationPath(currentSearchKey) : undefined;
    const title = groupTranslationPath ? translate(groupTranslationPath) : getSearchPageHeaderTitle({translate, type: queryJSONType, activeSavedSearch, selectedItem});

    return (
        <TopBar
            shouldShowLoadingBar={shouldShowLoadingBar}
            breadcrumbLabel={title}
            onBackButtonPress={shouldShowBackToMore ? navigateBackToMore : undefined}
            shouldDisplayHelpButton
        />
    );
}

export default SearchPageHeaderCommon;
