import Button from '@components/Button';
import CompactMenuContext from '@components/CompactMenuContext';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import ScrollView from '@components/ScrollView';
import useUpdateFilterQuery from '@components/Search/hooks/useUpdateFilterQuery';
import {useSearchQueryContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldReturnTripRooms from '@hooks/useShouldReturnTripRooms';
import useThemeStyles from '@hooks/useThemeStyles';

import {close} from '@libs/actions/Modal';
import clearSelectedText from '@libs/clearSelectedText/clearSelectedText';
import Navigation from '@libs/Navigation/Navigation';
import {buildQueryStringWithResetDisplay, getChangedDisplayOptionsCount} from '@libs/SearchQueryUtils';
import {getGroupBySections, getSearchColumnTranslationKey, getValidGroupBy, getViewOptions} from '@libs/SearchUIUtils';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {SearchResults} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import {authTokenTypeSelector} from '@selectors/Session';
import React, {useState} from 'react';
import {View} from 'react-native';

import CurrencyPopup from './CurrencyPopup';
import GroupByPopup from './GroupByPopup';
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
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isLargeScreenWidth, isSmallScreenWidth} = useResponsiveLayout(); // eslint-disable-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Columns']);
    const {updateFilterQueryParams} = useUpdateFilterQuery(queryJSON);
    const {currentDefaultSearchQueryJSON} = useSearchQueryContext();
    const shouldReturnTripRooms = useShouldReturnTripRooms(queryJSON.type);
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
    const view = viewOptions.find((option) => option.value === queryJSON.view) ?? viewOptions.at(0);
    const shouldShowColumnsButton =
        isLargeScreenWidth && (queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE || queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT || shouldReturnTripRooms);

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
        const validGroupByValue = getValidGroupBy(groupByValue);
        const groupCurrencyValue = searchAdvancedFilters[CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY];
        const viewValue = searchAdvancedFilters[CONST.SEARCH.SYNTAX_ROOT_KEYS.VIEW];
        const canResetDisplay = getChangedDisplayOptionsCount(queryJSON, currentDefaultSearchQueryJSON) > 0;

        const resetDisplayOptions = () => {
            const queryString = buildQueryStringWithResetDisplay(queryJSON, currentDefaultSearchQueryJSON);
            close(() => {
                Navigation.setParams({q: queryString, rawQuery: undefined});
            });
        };

        return (
            <ScrollView contentContainerStyle={[styles.pv4]}>
                <MenuItemField
                    name={translate('search.display.sortBy')}
                    onPress={() => setSelectedDisplayFilter(CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY)}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_SORT_BY}
                    value={`${translate(getSearchColumnTranslationKey(sortByValue, queryJSON.type, shouldReturnTripRooms))} ${CONST.DOT_SEPARATOR} ${translate(`search.filters.sortOrder.${sortOrderValue}`)}`}
                />
                {(isExpenseType || isTripType) && (
                    <MenuItemField
                        name={translate('search.display.groupBy')}
                        onPress={() => setSelectedDisplayFilter(CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY)}
                        sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_GROUP_BY}
                        value={validGroupByValue ? translate(`search.filters.groupBy.${validGroupByValue}`) : undefined}
                    />
                )}
                {!!groupBy && (
                    <MenuItemField
                        name={translate('common.groupCurrency')}
                        onPress={() => setSelectedDisplayFilter(CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY)}
                        sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_GROUP_CURRENCY}
                        value={groupCurrencyValue}
                    />
                )}
                {isExpenseType && !!validGroupByValue && (
                    <MenuItemField
                        name={translate('search.view.label')}
                        onPress={() => setSelectedDisplayFilter(CONST.SEARCH.SYNTAX_ROOT_KEYS.VIEW)}
                        sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_VIEW}
                        value={viewValue ? translate(`search.view.${viewValue}`) : undefined}
                    />
                )}
                {isExpenseType && (
                    <MenuItemField
                        name={translate('search.display.limitResults')}
                        onPress={() => setSelectedDisplayFilter(CONST.SEARCH.SYNTAX_ROOT_KEYS.LIMIT)}
                        sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_LIMIT}
                        value={limitValue}
                    />
                )}
                {shouldShowColumnsButton && (
                    <CompactMenuContext.Provider value>
                        <MenuItem.Root
                            onPress={callFunctionIfActionIsAllowed(
                                () => {
                                    closeOverlay();
                                    openSearchColumns();
                                },
                                false,
                                session,
                            )}
                            accessibilityLabel={translate('search.editColumns')}
                            sentryLabel={CONST.SENTRY_LABEL.SEARCH.COLUMNS_BUTTON}
                        >
                            <MenuItem.Row>
                                <MenuItem.Leading>
                                    {isSmallScreenWidth ? <MenuItem.Icon src={expensifyIcons.Columns} /> : <MenuItem.IconNarrow src={expensifyIcons.Columns} />}
                                </MenuItem.Leading>
                                <MenuItem.Content>
                                    <MenuItem.Title>{translate('search.editColumns')}</MenuItem.Title>
                                </MenuItem.Content>
                            </MenuItem.Row>
                        </MenuItem.Root>
                    </CompactMenuContext.Provider>
                )}
                {canResetDisplay && (
                    <View style={[styles.ph5, styles.mt2]}>
                        <Button
                            size={CONST.BUTTON_SIZE.MEDIUM}
                            onPress={resetDisplayOptions}
                            sentryLabel={CONST.SENTRY_LABEL.SEARCH.RESET_DISPLAY_BUTTON}
                        >
                            <Button.Text>{translate('common.reset')}</Button.Text>
                        </Button>
                    </View>
                )}
            </ScrollView>
        );
    }

    const updateFilterForm = (values: Partial<SearchAdvancedFiltersForm>) => {
        close(() => updateFilterQueryParams(values));
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
                        if (newValue !== queryJSON.groupBy) {
                            clearSelectedText();
                        }
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
                <CurrencyPopup
                    value={searchAdvancedFilters[CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY]}
                    onChange={(item) => updateFilterForm({groupCurrency: item?.value})}
                    label={translate('common.groupCurrency')}
                    onBackButtonPress={goBack}
                    closeOverlay={closeOverlay}
                    searchPlaceholder={translate('common.groupCurrency')}
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
