import React, {useCallback, useMemo, useRef} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import * as Expensicons from '@components/Icon/Expensicons';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScrollView from '@components/ScrollView';
import DateSelectPopup from '@components/Search/FilterDropdowns/DateSelectPopup';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/DropdownButton';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {MultiSelectItem} from '@components/Search/FilterDropdowns/MultiSelectPopup';
import MultiSelectPopup from '@components/Search/FilterDropdowns/MultiSelectPopup';
import SingleSelectPopup from '@components/Search/FilterDropdowns/SingleSelectPopup';
import UserSelectPopup from '@components/Search/FilterDropdowns/UserSelectPopup';
import {useSearchContext} from '@components/Search/SearchContext';
import type {SearchDateValues} from '@components/Search/SearchDatePresetFilterBase';
import type {SearchQueryJSON, SingularSearchStatus} from '@components/Search/types';
import SearchFiltersSkeleton from '@components/Skeletons/SearchFiltersSkeleton';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {close} from '@libs/actions/Modal';
import {updateAdvancedFilters} from '@libs/actions/Search';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {
    buildFilterFormValuesFromQuery,
    buildQueryStringFromFilterFormValues,
    buildSearchQueryJSON,
    buildSearchQueryString,
    isFilterSupported,
    isSearchDatePreset,
} from '@libs/SearchQueryUtils';
import {getDatePresets, getFeedOptions, getGroupByOptions, getStatusOptions, getTypeOptions} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';
import type {CurrencyList} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import type {SearchHeaderOptionValue} from './SearchPageHeader';

type SearchFiltersBarProps = {
    queryJSON: SearchQueryJSON;
    headerButtonsOptions: Array<DropdownOption<SearchHeaderOptionValue>>;
    isMobileSelectionModeEnabled: boolean;
};

function SearchFiltersBar({queryJSON, headerButtonsOptions, isMobileSelectionModeEnabled}: SearchFiltersBarProps) {
    const scrollRef = useRef<RNScrollView>(null);

    // type, groupBy and status values are not guaranteed to respect the ts type as they come from user input
    const {hash, type: unsafeType, groupBy: unsafeGroupBy, status: unsafeStatus, flatFilters} = queryJSON;

    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isDevelopment} = useEnvironment();

    const {isOffline} = useNetwork();
    const personalDetails = usePersonalDetails();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {selectedTransactions, selectAllMatchingItems, areAllMatchingItemsSelected, showSelectAllMatchingItems, shouldShowFiltersBarLoading} = useSearchContext();

    const [email] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true, selector: (onyxSession) => onyxSession?.email});
    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [currencyList = getEmptyObject<CurrencyList>()] = useOnyx(ONYXKEYS.CURRENCY_LIST, {canBeMissing: true});
    const [policyTagsLists] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {canBeMissing: true});
    const [policyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, {canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER, {canBeMissing: true});
    const [searchResultsErrors] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`, {canBeMissing: true, selector: (data) => data?.errors});

    const taxRates = getAllTaxRates();
    const allCards = useMemo(() => mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, userCardList), [userCardList, workspaceCardFeeds]);
    const selectedTransactionsKeys = useMemo(() => Object.keys(selectedTransactions ?? {}), [selectedTransactions]);

    const hasErrors = Object.keys(searchResultsErrors ?? {}).length > 0 && !isOffline;
    const shouldShowSelectedDropdown = headerButtonsOptions.length > 0 && (!shouldUseNarrowLayout || isMobileSelectionModeEnabled);

    const [typeOptions, type] = useMemo(() => {
        const options = getTypeOptions(allPolicies, email);
        const value = options.find((option) => option.value === unsafeType) ?? null;
        return [options, value];
    }, [allPolicies, email, unsafeType]);

    const [groupByOptions, groupBy] = useMemo(() => {
        const options = getGroupByOptions();
        const value = options.find((option) => option.value === unsafeGroupBy) ?? null;
        return [options, value];
    }, [unsafeGroupBy]);

    const [feedOptions, feed] = useMemo(() => {
        const feedFilterValues = flatFilters.find((filter) => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED)?.filters?.map((filter) => filter.value);
        const options = getFeedOptions(allFeeds, allCards);
        const value = feedFilterValues ? options.filter((option) => feedFilterValues.includes(option.value)) : [];
        return [options, value];
    }, [flatFilters, allFeeds, allCards]);

    const [statusOptions, status] = useMemo(() => {
        const options = type ? getStatusOptions(type.value, groupBy?.value) : [];
        const value = [
            Array.isArray(unsafeStatus) ? options.filter((option) => unsafeStatus.includes(option.value)) : (options.find((option) => option.value === unsafeStatus) ?? []),
        ].flat();
        return [options, value];
    }, [unsafeStatus, type, groupBy]);

    const filterFormValues = useMemo(() => {
        return buildFilterFormValuesFromQuery(queryJSON, policyCategories, policyTagsLists, currencyList, personalDetails, allCards, reports, taxRates);
    }, [allCards, currencyList, personalDetails, policyCategories, policyTagsLists, queryJSON, reports, taxRates]);

    const [date, displayDate] = useMemo(() => {
        const value: SearchDateValues = {
            [CONST.SEARCH.DATE_MODIFIERS.ON]: filterFormValues.dateOn,
            [CONST.SEARCH.DATE_MODIFIERS.AFTER]: filterFormValues.dateAfter,
            [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: filterFormValues.dateBefore,
        };

        const displayText: string[] = [];
        if (value.On) {
            displayText.push(isSearchDatePreset(value.On) ? translate(`search.filters.date.presets.${value.On}`) : `${translate('common.on')} ${DateUtils.formatToReadableString(value.On)}`);
        }
        if (value.After) {
            displayText.push(`${translate('common.after')} ${DateUtils.formatToReadableString(value.After)}`);
        }
        if (value.Before) {
            displayText.push(`${translate('common.before')} ${DateUtils.formatToReadableString(value.Before)}`);
        }

        return [value, displayText];
    }, [filterFormValues.dateOn, filterFormValues.dateAfter, filterFormValues.dateBefore, translate]);

    const [posted, displayPosted] = useMemo(() => {
        const value: SearchDateValues = {
            [CONST.SEARCH.DATE_MODIFIERS.ON]: filterFormValues.postedOn,
            [CONST.SEARCH.DATE_MODIFIERS.AFTER]: filterFormValues.postedAfter,
            [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: filterFormValues.postedBefore,
        };

        const displayText: string[] = [];
        if (value.On) {
            displayText.push(isSearchDatePreset(value.On) ? translate(`search.filters.date.presets.${value.On}`) : `${translate('common.on')} ${DateUtils.formatToReadableString(value.On)}`);
        }
        if (value.After) {
            displayText.push(`${translate('common.after')} ${DateUtils.formatToReadableString(value.After)}`);
        }
        if (value.Before) {
            displayText.push(`${translate('common.before')} ${DateUtils.formatToReadableString(value.Before)}`);
        }

        return [value, displayText];
    }, [filterFormValues.postedOn, filterFormValues.postedAfter, filterFormValues.postedBefore, translate]);

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
            return (
                <SingleSelectPopup
                    label={translate('common.type')}
                    value={type}
                    items={typeOptions}
                    closeOverlay={closeOverlay}
                    onChange={(item) => updateFilterForm({type: item?.value ?? CONST.SEARCH.DATA_TYPES.EXPENSE})}
                />
            );
        },
        [translate, typeOptions, type, updateFilterForm],
    );

    const groupByComponent = useCallback(
        ({closeOverlay}: PopoverComponentProps) => {
            return (
                <SingleSelectPopup
                    label={translate('search.groupBy')}
                    items={groupByOptions}
                    value={groupBy}
                    closeOverlay={closeOverlay}
                    onChange={(item) => updateFilterForm({groupBy: item?.value})}
                />
            );
        },
        [translate, groupByOptions, groupBy, updateFilterForm],
    );

    const feedComponent = useCallback(
        ({closeOverlay}: PopoverComponentProps) => {
            return (
                <MultiSelectPopup
                    label={translate('search.filters.feed')}
                    items={feedOptions}
                    value={feed}
                    closeOverlay={closeOverlay}
                    onChange={(items) => updateFilterForm({feed: items.map((item) => item.value)})}
                />
            );
        },
        [translate, feedOptions, feed, updateFilterForm],
    );

    const postedPickerComponent = useCallback(
        ({closeOverlay}: PopoverComponentProps) => {
            const onChange = (selectedDates: SearchDateValues) => {
                const dateFormValues = {
                    postedOn: selectedDates[CONST.SEARCH.DATE_MODIFIERS.ON],
                    postedAfter: selectedDates[CONST.SEARCH.DATE_MODIFIERS.AFTER],
                    postedBefore: selectedDates[CONST.SEARCH.DATE_MODIFIERS.BEFORE],
                };

                updateFilterForm(dateFormValues);
            };

            return (
                <DateSelectPopup
                    label={translate('search.filters.posted')}
                    value={posted}
                    onChange={onChange}
                    closeOverlay={closeOverlay}
                    presets={getDatePresets(CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED, true)}
                />
            );
        },
        [posted, translate, updateFilterForm],
    );

    const statusComponent = useCallback(
        ({closeOverlay}: PopoverComponentProps) => {
            const onChange = (selectedItems: Array<MultiSelectItem<SingularSearchStatus>>) => {
                const newStatus = selectedItems.length ? selectedItems.map((i) => i.value) : CONST.SEARCH.STATUS.EXPENSE.ALL;
                updateFilterForm({status: newStatus});
            };

            return (
                <MultiSelectPopup
                    label={translate('common.status')}
                    items={statusOptions}
                    value={status}
                    closeOverlay={closeOverlay}
                    onChange={onChange}
                />
            );
        },
        [statusOptions, status, translate, updateFilterForm],
    );

    const datePickerComponent = useCallback(
        ({closeOverlay}: PopoverComponentProps) => {
            const onChange = (selectedDates: SearchDateValues) => {
                const dateFormValues = {
                    dateOn: selectedDates[CONST.SEARCH.DATE_MODIFIERS.ON],
                    dateAfter: selectedDates[CONST.SEARCH.DATE_MODIFIERS.AFTER],
                    dateBefore: selectedDates[CONST.SEARCH.DATE_MODIFIERS.BEFORE],
                };

                updateFilterForm(dateFormValues);
            };

            return (
                <DateSelectPopup
                    label={translate('common.date')}
                    value={date}
                    onChange={onChange}
                    closeOverlay={closeOverlay}
                />
            );
        },
        [date, translate, updateFilterForm],
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
        const fromValue = filterFormValues.from?.map((accountID) => personalDetails?.[accountID]?.displayName ?? accountID) ?? [];

        // s77rt remove DEV lock
        const shouldDisplayGroupByFilter = isDevelopment;
        const shouldDisplayFeedFilter = feedOptions.length > 1 && !!filterFormValues.feed;
        const shouldDisplayPostedFilter = !!filterFormValues.feed && (!!filterFormValues.postedOn || !!filterFormValues.postedAfter || !!filterFormValues.postedBefore);

        const filterList = [
            {
                label: translate('common.type'),
                PopoverComponent: typeComponent,
                value: type?.text ?? null,
                filterKey: FILTER_KEYS.TYPE,
            },
            ...(shouldDisplayGroupByFilter
                ? [
                      {
                          label: translate('search.groupBy'),
                          PopoverComponent: groupByComponent,
                          value: groupBy?.text ?? null,
                          filterKey: FILTER_KEYS.GROUP_BY,
                      },
                  ]
                : []),
            ...(shouldDisplayFeedFilter
                ? [
                      {
                          label: translate('search.filters.feed'),
                          PopoverComponent: feedComponent,
                          value: feed.map((option) => option.text),
                          filterKey: FILTER_KEYS.FEED,
                      },
                  ]
                : []),
            ...(shouldDisplayPostedFilter
                ? [
                      {
                          label: translate('search.filters.posted'),
                          PopoverComponent: postedPickerComponent,
                          value: displayPosted,
                          filterKey: FILTER_KEYS.POSTED_ON,
                      },
                  ]
                : []),
            {
                label: translate('common.status'),
                PopoverComponent: statusComponent,
                value: status.map((option) => option.text),
                filterKey: FILTER_KEYS.STATUS,
            },
            {
                label: translate('common.date'),
                PopoverComponent: datePickerComponent,
                value: displayDate,
                filterKey: FILTER_KEYS.DATE_ON,
            },
            {
                label: translate('common.from'),
                PopoverComponent: userPickerComponent,
                value: fromValue,
                filterKey: FILTER_KEYS.FROM,
            },
        ].filter((filterItem) => isFilterSupported(filterItem.filterKey, type?.value ?? CONST.SEARCH.DATA_TYPES.EXPENSE));

        return filterList;
    }, [
        type,
        groupBy,
        displayDate,
        displayPosted,
        filterFormValues.from,
        filterFormValues.feed,
        filterFormValues.postedOn,
        filterFormValues.postedAfter,
        filterFormValues.postedBefore,
        translate,
        typeComponent,
        groupByComponent,
        statusComponent,
        datePickerComponent,
        userPickerComponent,
        postedPickerComponent,
        status,
        personalDetails,
        isDevelopment,
        feed,
        feedComponent,
        feedOptions.length,
    ]);

    if (hasErrors) {
        return null;
    }

    if (shouldShowFiltersBarLoading) {
        return <SearchFiltersSkeleton shouldAnimate />;
    }

    const selectionButtonText = areAllMatchingItemsSelected
        ? translate('search.exportAll.allMatchingItemsSelected')
        : translate('workspace.common.selected', {count: selectedTransactionsKeys.length});

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
                    />
                    {!areAllMatchingItemsSelected && showSelectAllMatchingItems && (
                        <Button
                            link
                            small
                            shouldUseDefaultHover={false}
                            innerStyles={styles.p0}
                            onPress={() => selectAllMatchingItems(true)}
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
