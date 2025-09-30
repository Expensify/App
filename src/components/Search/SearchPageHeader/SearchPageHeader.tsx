import React from 'react';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {useSearchContext} from '@components/Search/SearchContext';
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
    headerButtonsOptions: Array<DropdownOption<SearchHeaderOptionValue>>;
    handleSearch: (value: string) => void;
    isMobileSelectionModeEnabled: boolean;
};

type SearchHeaderOptionValue = DeepValueOf<typeof CONST.SEARCH.BULK_ACTION_TYPES> | undefined;

function SearchPageHeader({
    queryJSON,
    searchRouterListVisible,
    hideSearchRouterList,
    onSearchRouterFocus,
    headerButtonsOptions,
    handleSearch,
    isMobileSelectionModeEnabled,
}: SearchPageHeaderProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {selectedTransactions} = useSearchContext();

    const selectedTransactionsKeys = Object.keys(selectedTransactions ?? {});

    if (shouldUseNarrowLayout && isMobileSelectionModeEnabled) {
        return (
            <SearchSelectedNarrow
                options={headerButtonsOptions}
                itemsLength={selectedTransactionsKeys.length}
            />
        );
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

SearchPageHeader.displayName = 'SearchPageHeader';

export type {SearchHeaderOptionValue};
export default SearchPageHeader;
