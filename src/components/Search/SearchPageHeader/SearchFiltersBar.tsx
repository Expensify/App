import React, {useCallback, useMemo, useRef} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import * as Expensicons from '@components/Icon/Expensicons';
import {usePersonalDetails} from '@components/OnyxProvider';
import ScrollView from '@components/ScrollView';
import type {DateSelectPopupValue} from '@components/Search/FilterDropdowns/DateSelectPopup';
import DateSelectPopup from '@components/Search/FilterDropdowns/DateSelectPopup';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/DropdownButton';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {MultiSelectItem} from '@components/Search/FilterDropdowns/MultiSelectPopup';
import MultiSelectPopup from '@components/Search/FilterDropdowns/MultiSelectPopup';
import SingleSelectPopup from '@components/Search/FilterDropdowns/SingleSelectPopup';
import UserSelectPopup from '@components/Search/FilterDropdowns/UserSelectPopup';
import {useSearchContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON, SingularSearchStatus} from '@components/Search/types';
import SearchFiltersSkeleton from '@components/Skeletons/SearchFiltersSkeleton';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {close} from '@libs/actions/Modal';
import {updateAdvancedFilters} from '@libs/actions/Search';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {buildFilterFormValuesFromQuery, buildQueryStringFromFilterFormValues, buildSearchQueryJSON, buildSearchQueryString, isFilterSupported} from '@libs/SearchQueryUtils';
import {getGroupByOptions, getStatusOptions, getTypeOptions} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {SearchHeaderOptionValue} from './SearchPageHeader';

type SearchFiltersBarProps = {
    queryJSON: SearchQueryJSON;
    headerButtonsOptions: Array<DropdownOption<SearchHeaderOptionValue>>;
};

function SearchFiltersBar({queryJSON, headerButtonsOptions}: SearchFiltersBarProps) {
    const {hash, type, groupBy, status} = queryJSON;
    const scrollRef = useRef<RNScrollView>(null);

    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isDevelopment} = useEnvironment();

    const {isOffline} = useNetwork();
    const personalDetails = usePersonalDetails();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {selectedTransactions, setExportMode, isExportMode, shouldShowExportModeOption, shouldShowFiltersBarLoading} = useSearchContext();

    const [email] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true, selector: (onyxSession) => onyxSession?.email});
    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [currencyList = {}] = useOnyx(ONYXKEYS.CURRENCY_LIST, {canBeMissing: true});
    const [policyTagsLists] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {canBeMissing: true});
    const [policyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, {canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});
    const [selectionMode] = useOnyx(ONYXKEYS.MOBILE_SELECTION_MODE, {canBeMissing: true});
    const [searchResultsErrors] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`, {canBeMissing: true, selector: (data) => data?.errors});

    const taxRates = getAllTaxRates();
    const allCards = useMemo(() => mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, userCardList), [userCardList, workspaceCardFeeds]);
    const selectedTransactionsKeys = useMemo(() => Object.keys(selectedTransactions ?? {}), [selectedTransactions]);

    const hasErrors = Object.keys(searchResultsErrors ?? {}).length > 0 && !isOffline;
    const shouldShowSelectedDropdown = headerButtonsOptions.length > 0 && (!shouldUseNarrowLayout || (!!selectionMode && selectionMode.isEnabled));

    const typeOptions = useMemo(() => getTypeOptions(allPolicies, email), [allPolicies, email]);

    const filterFormValues = useMemo(() => {
        return buildFilterFormValuesFromQuery(queryJSON, policyCategories, policyTagsLists, currencyList, personalDetails, allCards, reports, taxRates);
    }, [allCards, currencyList, personalDetails, policyCategories, policyTagsLists, queryJSON, reports, taxRates]);

    const updateFilterForm = useCallback(
        (values: Partial<SearchAdvancedFiltersForm>) => {
            const updatedFilterFormValues: Partial<SearchAdvancedFiltersForm> = {
                ...filterFormValues,
                ...values,
            };

            // If the type has changed, reset the status so we dont have an invalid status selected
            if (updatedFilterFormValues.type !== filterFormValues.type) {
                updatedFilterFormValues.status = CONST.SEARCH.STATUS.EXPENSE.ALL;
            }

            const filterString = buildQueryStringFromFilterFormValues(updatedFilterFormValues);
            const searchQueryJSON = buildSearchQueryJSON(filterString);
            const queryString = buildSearchQueryString(searchQueryJSON);

            close(() => {
                Navigation.setParams({q: queryString});
            });
        },
        [filterFormValues],
    );

    const openAdvancedFilters = useCallback(() => {
        updateAdvancedFilters(filterFormValues);
        Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS);
    }, [filterFormValues]);

    const typeComponent = useCallback(
        ({closeOverlay}: PopoverComponentProps) => {
            const value = typeOptions.find((option) => option.value === type) ?? null;

            return (
                <SingleSelectPopup
                    label={translate('common.type')}
                    value={value}
                    items={typeOptions}
                    closeOverlay={closeOverlay}
                    onChange={(item) => updateFilterForm({type: item?.value ?? CONST.SEARCH.DATA_TYPES.EXPENSE})}
                />
            );
        },
        [translate, type, typeOptions, updateFilterForm],
    );

    const groupByComponent = useCallback(
        ({closeOverlay}: PopoverComponentProps) => {
            const items = getGroupByOptions();
            const value = items.find((option) => option.value === groupBy) ?? null;

            return (
                <SingleSelectPopup
                    label={translate('search.groupBy')}
                    items={items}
                    value={value}
                    closeOverlay={closeOverlay}
                    onChange={(item) => updateFilterForm({groupBy: item?.value})}
                />
            );
        },
        [translate, groupBy, updateFilterForm],
    );

    const statusComponent = useCallback(
        ({closeOverlay}: PopoverComponentProps) => {
            const items = getStatusOptions(type, groupBy);
            const selected = Array.isArray(status) ? items.filter((option) => status.includes(option.value)) : (items.find((option) => option.value === status) ?? []);
            const value = [selected].flat();

            const onChange = (selectedItems: Array<MultiSelectItem<SingularSearchStatus>>) => {
                const newStatus = selectedItems.length ? selectedItems.map((i) => i.value) : CONST.SEARCH.STATUS.EXPENSE.ALL;
                updateFilterForm({status: newStatus});
            };

            return (
                <MultiSelectPopup
                    label={translate('common.status')}
                    items={items}
                    value={value}
                    closeOverlay={closeOverlay}
                    onChange={onChange}
                />
            );
        },
        [groupBy, status, translate, type, updateFilterForm],
    );

    const datePickerComponent = useCallback(
        ({closeOverlay}: PopoverComponentProps) => {
            const value: DateSelectPopupValue = {
                [CONST.SEARCH.DATE_MODIFIERS.AFTER]: filterFormValues.dateAfter ?? null,
                [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: filterFormValues.dateBefore ?? null,
                [CONST.SEARCH.DATE_MODIFIERS.ON]: filterFormValues.dateOn ?? null,
            };

            const onChange = (selectedDates: DateSelectPopupValue) => {
                const dateFormValues = {
                    dateAfter: selectedDates[CONST.SEARCH.DATE_MODIFIERS.AFTER] ?? undefined,
                    dateBefore: selectedDates[CONST.SEARCH.DATE_MODIFIERS.BEFORE] ?? undefined,
                    dateOn: selectedDates[CONST.SEARCH.DATE_MODIFIERS.ON] ?? undefined,
                };

                updateFilterForm(dateFormValues);
            };

            return (
                <DateSelectPopup
                    closeOverlay={closeOverlay}
                    value={value}
                    onChange={onChange}
                />
            );
        },
        [filterFormValues.dateAfter, filterFormValues.dateBefore, filterFormValues.dateOn, updateFilterForm],
    );

    const userPickerComponent = useCallback(
        ({closeOverlay}: PopoverComponentProps) => {
            const value = filterFormValues.from ?? [];

            return (
                <UserSelectPopup
                    value={value}
                    closeOverlay={closeOverlay}
                    onChange={(selectedUsers) => updateFilterForm({from: selectedUsers})}
                />
            );
        },
        [filterFormValues.from, updateFilterForm],
    );

    /**
     * Builds the list of all filter chips to be displayed in the
     * filter bar
     */
    const filters = useMemo(() => {
        const statusValue = getStatusOptions(type, groupBy).filter((option) => status.includes(option.value));
        const dateValue = [
            filterFormValues.dateAfter ? `${translate('common.after')} ${DateUtils.formatToReadableString(filterFormValues.dateAfter)}` : null,
            filterFormValues.dateBefore ? `${translate('common.before')} ${DateUtils.formatToReadableString(filterFormValues.dateBefore)}` : null,
            filterFormValues.dateOn ? `${translate('common.on')} ${DateUtils.formatToReadableString(filterFormValues.dateOn)}` : null,
        ].filter(Boolean) as string[];
        const fromValue = filterFormValues.from?.map((accountID) => personalDetails?.[accountID]?.displayName ?? accountID) ?? [];

        const filterList = [
            {
                label: translate('common.type'),
                PopoverComponent: typeComponent,
                value: translate(`common.${type}`),
                keyForList: CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE,
            },
            // s77rt remove DEV lock
            ...(isDevelopment
                ? [
                      {
                          label: translate('search.groupBy'),
                          PopoverComponent: groupByComponent,
                          value: groupBy ? translate(`search.filters.groupBy.${groupBy}`) : null,
                          keyForList: CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY,
                      },
                  ]
                : []),
            {
                label: translate('common.status'),
                PopoverComponent: statusComponent,
                value: statusValue.map((option) => translate(option.translation)),
                keyForList: CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS,
            },
            {
                label: translate('common.date'),
                PopoverComponent: datePickerComponent,
                value: dateValue,
                keyForList: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            },
            {
                label: translate('common.from'),
                PopoverComponent: userPickerComponent,
                value: fromValue,
                keyForList: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
            },
        ].filter((filterItem) => isFilterSupported(filterItem.keyForList, type));

        return filterList;
    }, [
        type,
        groupBy,
        filterFormValues.dateAfter,
        filterFormValues.dateBefore,
        filterFormValues.dateOn,
        filterFormValues.from,
        translate,
        typeComponent,
        groupByComponent,
        statusComponent,
        datePickerComponent,
        userPickerComponent,
        status,
        personalDetails,
        isDevelopment,
    ]);

    if (hasErrors) {
        return null;
    }

    if (shouldShowFiltersBarLoading) {
        return <SearchFiltersSkeleton shouldAnimate />;
    }

    const selectionButtonText = isExportMode ? translate('search.exportAll.allMatchingItemsSelected') : translate('workspace.common.selected', {count: selectedTransactionsKeys.length});

    return (
        <View style={[shouldShowSelectedDropdown && styles.ph5, styles.mb2, styles.searchFiltersBarContainer]}>
            {shouldShowSelectedDropdown ? (
                <View style={[styles.flexRow, styles.gap3]}>
                    <ButtonWithDropdownMenu
                        onPress={() => null}
                        shouldAlwaysShowDropdownMenu
                        buttonSize={CONST.DROPDOWN_BUTTON_SIZE.SMALL}
                        customText={selectionButtonText}
                        options={headerButtonsOptions}
                        isSplitButton={false}
                        anchorAlignment={{
                            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                        }}
                        popoverHorizontalOffsetType={CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT}
                    />
                    {!isExportMode && shouldShowExportModeOption && (
                        <Button
                            link
                            small
                            shouldUseDefaultHover={false}
                            innerStyles={styles.p0}
                            onPress={() => setExportMode(true)}
                            text={translate('search.exportAll.selectAllMatchingItems')}
                        />
                    )}
                </View>
            ) : (
                <ScrollView
                    horizontal
                    keyboardShouldPersistTaps="always"
                    style={[styles.flexRow, styles.overflowScroll, styles.flexGrow0]}
                    contentContainerStyle={[styles.flexRow, styles.flexGrow0, styles.gap2, styles.ph5]}
                    ref={scrollRef}
                    showsHorizontalScrollIndicator={false}
                >
                    {filters.map((filter) => (
                        <DropdownButton
                            key={filter.label}
                            label={filter.label}
                            value={filter.value}
                            PopoverComponent={filter.PopoverComponent}
                        />
                    ))}

                    <Button
                        link
                        small
                        shouldUseDefaultHover={false}
                        text={translate('search.filtersHeader')}
                        iconFill={theme.link}
                        iconHoverFill={theme.linkHover}
                        icon={Expensicons.Filter}
                        textStyles={[styles.textMicroBold]}
                        onPress={openAdvancedFilters}
                    />
                </ScrollView>
            )}
        </View>
    );
}

SearchFiltersBar.displayName = 'SearchFiltersBar';

export default SearchFiltersBar;
