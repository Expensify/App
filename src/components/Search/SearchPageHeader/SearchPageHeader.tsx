import React from 'react';
import {useSearchStateContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import SearchSelectedNarrow from '@pages/Search/SearchSelectedNarrow';
import type CONST from '@src/CONST';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import SearchPageHeaderInput from './SearchPageHeaderInput';

type SearchPageHeaderProps = {
    queryJSON: SearchQueryJSON;
    searchRouterListVisible?: boolean;
    hideSearchRouterList?: () => void;
    onSearchRouterFocus?: () => void;
    handleSearch: (value: string) => void;
};

type SearchHeaderOptionValue = DeepValueOf<typeof CONST.SEARCH.BULK_ACTION_TYPES> | undefined;

function SearchPageHeader({queryJSON, searchRouterListVisible, hideSearchRouterList, onSearchRouterFocus, handleSearch}: SearchPageHeaderProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isMobileSelectionModeEnabled} = useSearchStateContext();

    if (shouldUseNarrowLayout && isMobileSelectionModeEnabled) {
        return <SearchSelectedNarrow queryJSON={queryJSON} />;
    }

    return (
        <SearchPageHeaderInput
            searchRouterListVisible={searchRouterListVisible}
            onSearchRouterFocus={onSearchRouterFocus}
            queryJSON={queryJSON}
            hideSearchRouterList={hideSearchRouterList}
            handleSearch={handleSearch}
        />
    );
}

export type {SearchHeaderOptionValue};
export default SearchPageHeader;
