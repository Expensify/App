import React, {useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
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
    const {shouldUseNarrowLayout, isLargeScreenWidth} = useResponsiveLayout();
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
            <View style={[!shouldUseNarrowLayout && styles.pv4]}>
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
            </View>
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

    const subtitle = {
        [CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY]: translate('search.display.sortBy'),
        [CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_ORDER]: translate('search.display.sortOrder'),
        [CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY]: translate('search.display.groupBy'),
        [CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY]: translate('common.groupCurrency'),
        [CONST.SEARCH.SYNTAX_ROOT_KEYS.VIEW]: translate('search.view.label'),
        [CONST.SEARCH.SYNTAX_ROOT_KEYS.LIMIT]: translate('search.display.limitResults'),
    };

    let subPopup: React.JSX.Element | null = null;

    switch (selectedDisplayFilter) {
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY:
            subPopup = (
                <SortByPopup
                    searchResults={searchResults}
                    queryJSON={queryJSON}
                    groupBy={groupBy}
                    onSort={onSort}
                    onSortOrderPress={() => setSelectedDisplayFilter(CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_ORDER)}
                    closeOverlay={closeOverlay}
                />
            );
            break;
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_ORDER:
            subPopup = (
                <SortOrderPopup
                    queryJSON={queryJSON}
                    onSort={onSort}
                    closeOverlay={closeOverlay}
                />
            );
            break;
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY:
            subPopup = (
                <GroupByPopup
                    style={styles.p0}
                    sections={groupBySections}
                    value={groupBy}
                    closeOverlay={closeOverlay}
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
            break;
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY:
            subPopup = (
                <GroupCurrencyPopup
                    onChange={(item) => updateFilterForm({groupCurrency: item?.value})}
                    closeOverlay={closeOverlay}
                />
            );
            break;
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.VIEW:
            subPopup = (
                <SingleSelectPopup
                    style={styles.p0}
                    items={viewOptions}
                    value={view}
                    closeOverlay={closeOverlay}
                    onChange={(item) => updateFilterForm({view: item?.value ?? CONST.SEARCH.VIEW.TABLE})}
                />
            );
            break;
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.LIMIT:
            subPopup = (
                <TextInputPopup
                    style={styles.pv0}
                    placeholder={translate('search.filters.limit')}
                    defaultValue={limitValue}
                    closeOverlay={closeOverlay}
                    onChange={(value) => updateFilterForm({limit: value})}
                />
            );
            break;
        default:
            break;
    }

    return (
        <View style={[!shouldUseNarrowLayout && styles.pv4]}>
            <HeaderWithBackButton
                shouldDisplayHelpButton={false}
                style={[styles.h10, styles.pv1, styles.mb2]}
                subtitle={subtitle[selectedDisplayFilter]}
                onBackButtonPress={goBack}
            />
            {subPopup}
        </View>
    );
}

export default DisplayPopup;
