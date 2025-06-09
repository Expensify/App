import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {useSearchContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import SearchSelectedNarrow from '@pages/Search/SearchSelectedNarrow';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import SearchPageHeaderInput from './SearchPageHeaderInput';

type SearchPageHeaderProps = {
    queryJSON: SearchQueryJSON;
    searchRouterListVisible?: boolean;
    hideSearchRouterList?: () => void;
    onSearchRouterFocus?: () => void;
    headerButtonsOptions: Array<DropdownOption<SearchHeaderOptionValue>>;
    handleSearch: (value: string) => void;
};

type SearchHeaderOptionValue = DeepValueOf<typeof CONST.SEARCH.BULK_ACTION_TYPES> | undefined;

function SearchPageHeader({queryJSON, searchRouterListVisible, hideSearchRouterList, onSearchRouterFocus, headerButtonsOptions, handleSearch}: SearchPageHeaderProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {selectedTransactions} = useSearchContext();
    const [selectionMode] = useOnyx(ONYXKEYS.MOBILE_SELECTION_MODE, {canBeMissing: true});

    const selectedTransactionsKeys = Object.keys(selectedTransactions ?? {});

    if (shouldUseNarrowLayout && selectionMode?.isEnabled) {
        return (
            <View>
                <SearchSelectedNarrow
                    options={headerButtonsOptions}
                    itemsLength={selectedTransactionsKeys.length}
                />
            </View>
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
