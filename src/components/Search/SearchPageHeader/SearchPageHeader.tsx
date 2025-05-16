import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {useSearchContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';
import TextInputClearButton from '@components/TextInput/TextInputClearButton';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {clearAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import SearchSelectedNarrow from '@pages/Search/SearchSelectedNarrow';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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

    const clearFilters = useCallback(() => {
        clearAdvancedFilters();
        Navigation.navigate(
            ROUTES.SEARCH_ROOT.getRoute({
                query: buildCannedSearchQuery(),
            }),
        );
    }, []);

    const InputRightComponent = useMemo(() => {
        return <TextInputClearButton onPressButton={clearFilters} />;
    }, [clearFilters]);

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
            inputRightComponent={InputRightComponent}
            handleSearch={handleSearch}
        />
    );
}

SearchPageHeader.displayName = 'SearchPageHeader';

export type {SearchHeaderOptionValue};
export default SearchPageHeader;
