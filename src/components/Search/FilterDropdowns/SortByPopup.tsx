import React, {useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import type {SearchColumnType, SearchGroupBy, SearchQueryJSON} from '@components/Search/types';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {close} from '@libs/actions/Modal';
import Navigation from '@libs/Navigation/Navigation';
import {buildSearchQueryString} from '@libs/SearchQueryUtils';
import {getColumnsToShow, getSortByOptions} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {columnsSelector} from '@src/selectors/AdvancedSearchFiltersForm';
import type {SearchResults} from '@src/types/onyx';
import BasePopup from './BasePopup';
import type {SingleSelectItem} from './SingleSelectPopup';

const DIVIDER_HEIGHT = 25;

type SortByPopupProps = {
    searchResults: OnyxEntry<SearchResults>;
    queryJSON: SearchQueryJSON;
    groupBy: SingleSelectItem<SearchGroupBy> | null;
    onSort: () => void;
    onSortOrderPress: () => void;
    onBackButtonPress: () => void;
    closeOverlay: () => void;
};

function SortByPopup({searchResults, queryJSON, groupBy, onSort, onSortOrderPress, onBackButtonPress, closeOverlay}: SortByPopupProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {windowHeight} = useWindowDimensions();
    const isInLandscapeMode = useIsInLandscapeMode();
    const {accountID} = useCurrentUserPersonalDetails();
    const {shouldUseLiveData} = useSearchStateContext();
    const {clearSelectedTransactions} = useSearchActionsContext();

    const [visibleColumns] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: columnsSelector});

    const searchDataType = shouldUseLiveData ? CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT : searchResults?.search?.type;
    const currentColumns = !searchResults?.data
        ? []
        : getColumnsToShow({currentAccountID: accountID, data: searchResults.data, visibleColumns, type: searchDataType, groupBy: groupBy?.value});
    const sortableColumns = getSortByOptions(currentColumns, translate);
    const sortOrder = queryJSON.sortOrder;

    const [selectedItem, setSelectedItem] = useState(queryJSON.sortBy);

    const options = sortableColumns.map((item) => ({
        text: item.text,
        keyForList: item.value,
        isSelected: item.value === selectedItem,
    }));

    const onSortChange = (column: SearchColumnType) => {
        clearSelectedTransactions();
        const newQuery = buildSearchQueryString({...queryJSON, sortBy: column});
        onSort();
        // We want to explicitly clear stale rawQuery since it's only used for manually typed-in queries.
        close(() => {
            Navigation.setParams({q: newQuery, rawQuery: undefined});
        });
    };

    const updateSelectedItem = (item: ListItem) => {
        setSelectedItem(item.keyForList as SearchColumnType);
    };

    const applyChanges = () => {
        onSortChange(selectedItem);
        closeOverlay();
    };

    const resetChanges = () => {
        const defaultSortBy = sortableColumns.at(0)?.value;
        if (!defaultSortBy) {
            return;
        }
        onSortChange(defaultSortBy);
        closeOverlay();
    };

    return (
        <BasePopup
            label={translate('search.display.sortBy')}
            onReset={resetChanges}
            onApply={applyChanges}
            onBackButtonPress={onBackButtonPress}
            resetSentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_RESET_SINGLE_SELECT}
            applySentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_SINGLE_SELECT}
        >
            <View
                style={[
                    styles.getSelectionListPopoverHeight({
                        itemCount: sortableColumns.length,
                        windowHeight,
                        isInLandscapeMode,
                        hasHeader: true,
                        extraHeight: variables.optionRowHeight + DIVIDER_HEIGHT,
                    }),
                ]}
            >
                <MenuItemWithTopDescription
                    shouldShowRightIcon
                    description={translate('search.display.sortOrder')}
                    title={sortOrder ? translate(`search.filters.sortOrder.${sortOrder}`) : undefined}
                    onPress={onSortOrderPress}
                />
                <View style={styles.dividerLine} />
                <SelectionList
                    data={options}
                    shouldSingleExecuteRowSelect
                    ListItem={SingleSelectListItem}
                    onSelectRow={updateSelectedItem}
                    style={{contentContainerStyle: [styles.pb0]}}
                />
            </View>
        </BasePopup>
    );
}

export default SortByPopup;
