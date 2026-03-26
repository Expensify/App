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
import SingleSelectPopup from './SingleSelectPopup';
import SortByPopup from './SortByPopup';
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
        | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.VIEW
        | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY
        | null
    >(null);

    const groupBySections = getGroupBySections(translate);
    const groupBy = groupBySections.flatMap((section) => section.options).find((option) => option.value === queryJSON.groupBy) ?? null;
    const viewOptions = getViewOptions(translate);
    const view = viewOptions.find((option) => option.value === queryJSON.view) ?? viewOptions.at(0) ?? null;
    const shouldShowColumnsButton = isLargeScreenWidth && (queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE || queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT);

    const sortByValue = queryJSON.sortBy;
    const groupByValue = searchAdvancedFilters[CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY];
    const viewValue = searchAdvancedFilters[CONST.SEARCH.SYNTAX_ROOT_KEYS.VIEW];
    const limitValue = searchAdvancedFilters[CONST.SEARCH.SYNTAX_ROOT_KEYS.LIMIT];

    if (!selectedDisplayFilter) {
        const openSearchColumns = () => {
            Navigation.navigate(ROUTES.SEARCH_COLUMNS);
        };

        const isExpenseType = queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE;
        const isTripType = queryJSON.type === CONST.SEARCH.DATA_TYPES.TRIP;
        return (
            <View style={[!shouldUseNarrowLayout && styles.pv4]}>
                <MenuItemWithTopDescription
                    shouldShowRightIcon
                    description={translate('search.display.sortBy')}
                    title={translate(getSearchColumnTranslationKey(sortByValue))}
                    onPress={() => setSelectedDisplayFilter(CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY)}
                />
                {(isExpenseType || isTripType) && (
                    <MenuItemWithTopDescription
                        shouldShowRightIcon
                        description={translate('search.display.groupBy')}
                        title={groupByValue ? translate(`search.filters.groupBy.${groupByValue}`) : undefined}
                        onPress={() => setSelectedDisplayFilter(CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY)}
                    />
                )}
                {isExpenseType && !!groupByValue && (
                    <MenuItemWithTopDescription
                        shouldShowRightIcon
                        description={translate('search.view.label')}
                        title={viewValue ? translate(`search.view.${viewValue}`) : undefined}
                        onPress={() => setSelectedDisplayFilter(CONST.SEARCH.SYNTAX_ROOT_KEYS.VIEW)}
                    />
                )}
                {isExpenseType && (
                    <MenuItemWithTopDescription
                        shouldShowRightIcon
                        description={translate('search.display.limitResults')}
                        title={limitValue}
                        onPress={() => setSelectedDisplayFilter(CONST.SEARCH.SYNTAX_ROOT_KEYS.LIMIT)}
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
                {sortBy: queryJSON.sortBy, sortOrder: queryJSON.sortOrder, limit: queryJSON.limit},
            ) ?? '';
        if (!queryString) {
            return;
        }

        close(() => Navigation.setParams({q: queryString, rawQuery: undefined}));
    };

    const subtitle = {
        [CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY]: translate('search.display.sortBy'),
        [CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY]: translate('search.display.groupBy'),
        [CONST.SEARCH.SYNTAX_ROOT_KEYS.VIEW]: translate('search.view.label'),
        [CONST.SEARCH.SYNTAX_ROOT_KEYS.LIMIT]: translate('search.display.limitResults'),
    };

    const subPopup = {
        [CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY]: (
            <SortByPopup
                searchResults={searchResults}
                queryJSON={queryJSON}
                groupBy={groupBy}
                onSort={onSort}
                closeOverlay={() => setSelectedDisplayFilter(null)}
            />
        ),
        [CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY]: (
            <GroupByPopup
                style={styles.p0}
                label={shouldUseNarrowLayout ? undefined : translate('search.display.groupBy')}
                sections={groupBySections}
                value={groupBy}
                closeOverlay={() => setSelectedDisplayFilter(null)}
                onChange={(item) => {
                    const newValue = item?.value;
                    if (!newValue) {
                        updateFilterForm({groupBy: undefined, groupCurrency: undefined});
                    } else {
                        updateFilterForm({groupBy: newValue});
                    }
                }}
            />
        ),
        [CONST.SEARCH.SYNTAX_ROOT_KEYS.VIEW]: (
            <SingleSelectPopup
                style={styles.p0}
                label={shouldUseNarrowLayout ? undefined : translate('search.view.label')}
                items={viewOptions}
                value={view}
                closeOverlay={() => setSelectedDisplayFilter(null)}
                onChange={(item) => updateFilterForm({view: item?.value ?? CONST.SEARCH.VIEW.TABLE})}
            />
        ),
        [CONST.SEARCH.SYNTAX_ROOT_KEYS.LIMIT]: (
            <TextInputPopup
                style={styles.pv0}
                placeholder={translate('search.filters.limit')}
                defaultValue={limitValue}
                closeOverlay={() => setSelectedDisplayFilter(null)}
                onChange={(value) => updateFilterForm({limit: value})}
            />
        ),
    };

    return (
        <View style={[!shouldUseNarrowLayout && styles.pv4]}>
            <HeaderWithBackButton
                shouldDisplayHelpButton={false}
                style={[styles.h10]}
                subtitle={subtitle[selectedDisplayFilter]}
                onBackButtonPress={() => setSelectedDisplayFilter(null)}
            />
            {subPopup[selectedDisplayFilter]}
        </View>
    );
}

export default DisplayPopup;
