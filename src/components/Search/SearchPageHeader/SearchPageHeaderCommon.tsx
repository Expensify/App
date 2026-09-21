import TopBar from '@components/Navigation/TopBar';
import {useSearchQueryContext} from '@components/Search/SearchContext';

import useActiveSavedSearch from '@hooks/useActiveSavedSearch';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';

import {clearLastVisitedMoreDestination, setLastVisitedSearchKey} from '@libs/MoreDestinationHistory';
import Navigation from '@libs/Navigation/Navigation';
import {ACCOUNTING_GROUP_ID, getSpendGroupID, getSpendGroupTranslationPath, SAVED_SEARCHES_GROUP_ID} from '@libs/SpendNavigationGroups';

import ROUTES from '@src/ROUTES';
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
    const typeMenuSections = useSearchTypeMenuSections();
    const {currentSearchKey} = useSearchQueryContext();
    const selectedItem = typeMenuSections.flatMap((section) => section.menuItems).find((item) => item.key === currentSearchKey);
    const activeSavedSearch = useActiveSavedSearch();
    // Remember where the user is inside Accounting or Saved, so the More menu can return them here.
    const groupID = getSpendGroupID(currentSearchKey);
    useEffect(() => {
        if (!groupID || !currentSearchKey) {
            return;
        }
        setLastVisitedSearchKey(groupID, currentSearchKey);
    }, [groupID, currentSearchKey]);

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    // Accounting and Saved have no tab of their own on narrow layouts - they are reached through More.
    const shouldShowBackToMore = shouldUseNarrowLayout && (groupID === ACCOUNTING_GROUP_ID || groupID === SAVED_SEARCHES_GROUP_ID);
    const groupTranslationPath = shouldUseGroupTitle ? getSpendGroupTranslationPath(currentSearchKey) : undefined;
    const title = groupTranslationPath ? translate(groupTranslationPath) : getSearchPageHeaderTitle({translate, type: queryJSONType, activeSavedSearch, selectedItem});

    return (
        <TopBar
            shouldShowLoadingBar={shouldShowLoadingBar}
            breadcrumbLabel={title}
            onBackButtonPress={
                shouldShowBackToMore
                    ? () => {
                          clearLastVisitedMoreDestination();
                          Navigation.navigate(ROUTES.MORE);
                      }
                    : undefined
            }
            shouldDisplayHelpButton
        />
    );
}

export default SearchPageHeaderCommon;
