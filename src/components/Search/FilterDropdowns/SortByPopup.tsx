import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import type {SearchColumnType, SearchGroupBy, SearchQueryJSON} from '@components/Search/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {close} from '@libs/actions/Modal';
import Navigation from '@libs/Navigation/Navigation';
import {buildSearchQueryString} from '@libs/SearchQueryUtils';
import {getColumnsToShow, getSearchColumnTranslationKey, getSortByOptions} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {columnsSelector} from '@src/selectors/AdvancedSearchFiltersForm';
import type {SearchResults} from '@src/types/onyx';
import SingleSelectPopup from './SingleSelectPopup';
import type {SingleSelectItem} from './SingleSelectPopup';

type SortByPopupProps = {
    searchResults: OnyxEntry<SearchResults>;
    queryJSON: SearchQueryJSON;
    groupBy: SingleSelectItem<SearchGroupBy> | null;
    onSort: () => void;
    onSortOrderPress: () => void;
    closeOverlay: () => void;
};

function SortByPopup({searchResults, queryJSON, groupBy, onSort, onSortOrderPress, closeOverlay}: SortByPopupProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {accountID} = useCurrentUserPersonalDetails();
    const {shouldUseLiveData} = useSearchStateContext();
    const {clearSelectedTransactions} = useSearchActionsContext();
    const [visibleColumns] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: columnsSelector});
    const searchDataType = shouldUseLiveData ? CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT : searchResults?.search?.type;
    const currentColumns = !searchResults?.data
        ? []
        : getColumnsToShow({currentAccountID: accountID, data: searchResults.data, visibleColumns, type: searchDataType, groupBy: groupBy?.value});
    const sortableColumns = getSortByOptions(currentColumns, translate);
    const sortBy = {text: translate(getSearchColumnTranslationKey(queryJSON.sortBy)), value: queryJSON.sortBy};
    const sortOrder = queryJSON.sortOrder;

    const onSortChange = (column: SearchColumnType) => {
        clearSelectedTransactions();
        const newQuery = buildSearchQueryString({...queryJSON, sortBy: column});
        onSort();
        // We want to explicitly clear stale rawQuery since it's only used for manually typed-in queries.
        close(() => {
            Navigation.setParams({q: newQuery, rawQuery: undefined});
        });
    };

    return (
        <>
            <MenuItemWithTopDescription
                shouldShowRightIcon
                description={translate('search.display.sortOrder')}
                title={sortOrder ? translate(`search.filters.sortOrder.${sortOrder}`) : undefined}
                onPress={onSortOrderPress}
            />
            <View style={styles.dividerLine} />
            <SingleSelectPopup
                style={styles.p0}
                items={sortableColumns}
                value={sortBy}
                closeOverlay={closeOverlay}
                defaultValue={sortableColumns.at(0)?.value}
                onChange={(item) => {
                    if (!item) {
                        return;
                    }
                    onSortChange(item.value);
                }}
            />
        </>
    );
}

export default SortByPopup;
