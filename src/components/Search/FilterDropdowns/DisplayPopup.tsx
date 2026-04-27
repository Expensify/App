import React, {useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScrollView from '@components/ScrollView';
import type {SearchQueryJSON} from '@components/Search/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {close} from '@libs/actions/Modal';
import Navigation from '@libs/Navigation/Navigation';
import {buildFilterQueryWithSortDefaults} from '@libs/SearchQueryUtils';
import {getGroupBySections, getSearchColumnTranslationKey, getViewOptions} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {SearchResults} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import GroupByPopup from './GroupByPopup';
import GroupCurrencyPopup from './GroupCurrencyPopup';
import SingleSelectPopup from './SingleSelectPopup';
import SortByPopup from './SortByPopup';
import SortOrderPopup from './SortOrderPopup';
import TextInputPopup from './TextInputPopup';

type DisplayPopupProps = {
    queryJSON: SearchQueryJSON;
    searchResults: OnyxEntry<SearchResults>;
    closeOverlay: () => void;
    onSort: () => void;
};

function DisplayPopup({queryJSON, searchResults, closeOverlay, onSort}: DisplayPopupProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Columns']);
    const [searchAdvancedFilters = getEmptyObject<SearchAdvancedFiltersForm>()] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const [selectedDisplayFilter, setSelectedDisplayFilter] = useState<
        | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.LIMIT
        | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY
        | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.VIEW
        | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY
        | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_ORDER
        | null
    >(null);

    const groupBySections = getGroupBySections(translate);
    const groupBy = groupBySections.flatMap((section) => section.options).find((option) => option.value === queryJSON.groupBy) ?? null;
    const viewOptions = getViewOptions(translate);
    const view = viewOptions.find((option) => option.value === queryJSON.view) ?? viewOptions.at(0) ?? null;
    const shouldShowColumnsButton = isLargeScreenWidth && (queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE || queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT);

    const limitValue = searchAdvancedFilters[CONST.SEARCH.SYNTAX_ROOT_KEYS.LIMIT];

    if (!selectedDisplayFilter) {
        const openSearchColumns = () => {
            Navigation.navigate(ROUTES.SEARCH_COLUMNS);
        };

        const isExpenseType = queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE;
        const isTripType = queryJSON.type === CONST.SEARCH.DATA_TYPES.TRIP;
        const sortByValue = queryJSON.sortBy;
        const sortOrderValue = queryJSON.sortOrder;
        const groupByValue = searchAdvancedFilters[CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY];
        const groupCurrencyValue = searchAdvancedFilters[CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY];
        const viewValue = searchAdvancedFilters[CONST.SEARCH.SYNTAX_ROOT_KEYS.VIEW];

        return (
            <ScrollView contentContainerStyle={[styles.pv4]}>
                <MenuItemWithTopDescription
                    shouldShowRightIcon
                    description={translate('search.display.sortBy')}
                    title={`${translate(getSearchColumnTranslationKey(sortByValue))} ${CONST.DOT_SEPARATOR} ${translate(`search.filters.sortOrder.${sortOrderValue}`)}`}
                    onPress={() => setSelectedDisplayFilter(CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY)}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_SORT_BY}
                />
                {(isExpenseType || isTripType) && (
                    <MenuItemWithTopDescription
                        shouldShowRightIcon
                        description={translate('search.display.groupBy')}
                        title={groupByValue ? translate(`search.filters.groupBy.${groupByValue}`) : undefined}
                        onPress={() => setSelectedDisplayFilter(CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY)}
                        sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_GROUP_BY}
                    />
                )}
                {!!groupBy && (
                    <MenuItemWithTopDescription
                        shouldShowRightIcon
                        description={translate('common.groupCurrency')}
                        title={groupCurrencyValue}
                        onPress={() => setSelectedDisplayFilter(CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY)}
                        sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_GROUP_CURRENCY}
                    />
                )}
                {isExpenseType && !!groupByValue && (
                    <MenuItemWithTopDescription
                        shouldShowRightIcon
                        description={translate('search.view.label')}
                        title={viewValue ? translate(`search.view.${viewValue}`) : undefined}
                        onPress={() => setSelectedDisplayFilter(CONST.SEARCH.SYNTAX_ROOT_KEYS.VIEW)}
                        sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_VIEW}
                    />
                )}
                {isExpenseType && (
                    <MenuItemWithTopDescription
                        shouldShowRightIcon
                        description={translate('search.display.limitResults')}
                        title={limitValue}
                        onPress={() => setSelectedDisplayFilter(CONST.SEARCH.SYNTAX_ROOT_KEYS.LIMIT)}
                        sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_LIMIT}
                    />
                )}
                {shouldShowColumnsButton && (
                    <MenuItem
                        icon={expensifyIcons.Columns}
                        title={translate('search.editColumns')}
                        onPress={() => {
                            closeOverlay();
                            openSearchColumns();
                        }}
                        sentryLabel={CONST.SENTRY_LABEL.SEARCH.COLUMNS_BUTTON}
                    />
                )}
            </ScrollView>
        );
    }

    const updateFilterForm = (values: Partial<SearchAdvancedFiltersForm>) => {
        const updatedFilterFormValues: Partial<SearchAdvancedFiltersForm> = {
            ...searchAdvancedFilters,
            ...values,
        };

        if (updatedFilterFormValues.groupBy !== searchAdvancedFilters.groupBy) {
            updatedFilterFormValues.columns = [];
        }

        const queryString =
            buildFilterQueryWithSortDefaults(
                updatedFilterFormValues,
                {view: searchAdvancedFilters.view, groupBy: searchAdvancedFilters.groupBy},
                {sortBy: queryJSON.sortBy, sortOrder: queryJSON.sortOrder},
            ) ?? '';
        if (!queryString) {
            return;
        }

        close(() => Navigation.setParams({q: queryString, rawQuery: undefined}));
    };

    const goBack = () => {
        if (selectedDisplayFilter === CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_ORDER) {
            setSelectedDisplayFilter(CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY);
            return;
        }
        setSelectedDisplayFilter(null);
    };

    switch (selectedDisplayFilter) {
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY:
            return (
                <SortByPopup
                    searchResults={searchResults}
                    queryJSON={queryJSON}
                    groupBy={groupBy}
                    onSort={onSort}
                    onSortOrderPress={() => setSelectedDisplayFilter(CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_ORDER)}
                    onBackButtonPress={goBack}
                    closeOverlay={closeOverlay}
                />
            );
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_ORDER:
            return (
                <SortOrderPopup
                    queryJSON={queryJSON}
                    onSort={onSort}
                    onBackButtonPress={goBack}
                    closeOverlay={closeOverlay}
                />
            );
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY:
            return (
                <GroupByPopup
                    sections={groupBySections}
                    value={groupBy}
                    closeOverlay={closeOverlay}
                    onBackButtonPress={goBack}
                    onChange={(item) => {
                        const newValue = item?.value;
                        if (!newValue) {
                            updateFilterForm({groupBy: undefined, groupCurrency: undefined});
                        } else {
                            updateFilterForm({groupBy: newValue});
                        }
                    }}
                />
            );
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY:
            return (
                <GroupCurrencyPopup
                    onChange={(item) => updateFilterForm({groupCurrency: item?.value})}
                    onBackButtonPress={goBack}
                    closeOverlay={closeOverlay}
                />
            );
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.VIEW:
            return (
                <SingleSelectPopup
                    items={viewOptions}
                    value={view}
                    label={translate('search.view.label')}
                    onBackButtonPress={goBack}
                    closeOverlay={closeOverlay}
                    onChange={(item) => updateFilterForm({view: item?.value ?? CONST.SEARCH.VIEW.TABLE})}
                />
            );
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.LIMIT:
            return (
                <TextInputPopup
                    placeholder={translate('search.filters.limit')}
                    defaultValue={limitValue}
                    label={translate('search.display.limitResults')}
                    onBackButtonPress={goBack}
                    closeOverlay={closeOverlay}
                    onChange={(value) => updateFilterForm({limit: value})}
                />
            );
        default:
            return null;
    }
}

export default DisplayPopup;
