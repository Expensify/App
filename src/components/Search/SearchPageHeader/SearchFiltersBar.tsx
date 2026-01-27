import {isUserValidatedSelector} from '@selectors/Account';
import {emailSelector} from '@selectors/Session';
import React, {useCallback, useContext, useMemo, useRef} from 'react';
import type {ReactNode} from 'react';
import {FlatList, View} from 'react-native';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import KYCWall from '@components/KYCWall';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';
import type {PaymentMethodType} from '@components/KYCWall/types';
import {LockedAccountContext} from '@components/LockedAccountModalProvider';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import type {SearchDateValues} from '@components/Search/FilterComponents/DatePresetFilterBase';
import DateSelectPopup from '@components/Search/FilterDropdowns/DateSelectPopup';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/DropdownButton';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {MultiSelectItem} from '@components/Search/FilterDropdowns/MultiSelectPopup';
import MultiSelectPopup from '@components/Search/FilterDropdowns/MultiSelectPopup';
import SingleSelectPopup from '@components/Search/FilterDropdowns/SingleSelectPopup';
import UserSelectPopup from '@components/Search/FilterDropdowns/UserSelectPopup';
import {useSearchContext} from '@components/Search/SearchContext';
import type {BankAccountMenuItem, SearchDateFilterKeys, SearchQueryJSON, SingularSearchStatus} from '@components/Search/types';
import SearchFiltersSkeleton from '@components/Skeletons/SearchFiltersSkeleton';
import useAdvancedSearchFilters from '@hooks/useAdvancedSearchFilters';
import useCurrencyList from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useFilterFormValues from '@hooks/useFilterFormValues';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceList from '@hooks/useWorkspaceList';
import {close} from '@libs/actions/Modal';
import {handleBulkPayItemSelected, updateAdvancedFilters} from '@libs/actions/Search';
import {filterPersonalCards, mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getActiveAdminWorkspaces, isPaidGroupPolicy} from '@libs/PolicyUtils';
import {isExpenseReport} from '@libs/ReportUtils';
import {buildQueryStringFromFilterFormValues, getQueryWithUpdatedValues, isFilterSupported, isSearchDatePreset} from '@libs/SearchQueryUtils';
import {getDatePresets, getFeedOptions, getGroupByOptions, getGroupCurrencyOptions, getHasOptions, getStatusOptions, getTypeOptions, getWithdrawalTypeOptions} from '@libs/SearchUIUtils';
import shouldAdjustScroll from '@libs/shouldAdjustScroll';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import FILTER_KEYS, {AMOUNT_FILTER_KEYS, DATE_FILTER_KEYS} from '@src/types/form/SearchAdvancedFiltersForm';
import type {SearchAdvancedFiltersKey} from '@src/types/form/SearchAdvancedFiltersForm';
import type {Policy} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import type {SearchHeaderOptionValue} from './SearchPageHeader';

type FilterItem = {
    label: string;
    PopoverComponent: (props: PopoverComponentProps) => ReactNode;
    value: string | string[] | null;
    filterKey: SearchAdvancedFiltersKey;
};

type SearchFiltersBarProps = {
    queryJSON: SearchQueryJSON;
    headerButtonsOptions: Array<DropdownOption<SearchHeaderOptionValue>>;
    isMobileSelectionModeEnabled: boolean;
    currentSelectedPolicyID?: string | undefined;
    currentSelectedReportID?: string | undefined;
    confirmPayment?: (paymentType: PaymentMethodType | undefined) => void;
    latestBankItems?: BankAccountMenuItem[] | undefined;
};

function SearchFiltersBar({
    queryJSON,
    headerButtonsOptions,
    isMobileSelectionModeEnabled,
    currentSelectedPolicyID,
    currentSelectedReportID,
    confirmPayment,
    latestBankItems,
}: SearchFiltersBarProps) {
    const scrollRef = useRef<FlatList<FilterItem>>(null);
    const currentPolicy = usePolicy(currentSelectedPolicyID);
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector, canBeMissing: true});
    const [searchAdvancedFiltersForm = getEmptyObject<Partial<SearchAdvancedFiltersForm>>()] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    // type, groupBy and status values are not guaranteed to respect the ts type as they come from user input
    const {type: unsafeType, groupBy: unsafeGroupBy, status: unsafeStatus, flatFilters} = queryJSON;
    const [selectedIOUReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${currentSelectedReportID}`, {canBeMissing: true});
    const isCurrentSelectedExpenseReport = isExpenseReport(currentSelectedReportID);
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const kycWallRef = useContext(KYCWallContext);

    const {isOffline} = useNetwork();
    const personalDetails = usePersonalDetails();
    const filterFormValues = useFilterFormValues(queryJSON);
    const {shouldUseNarrowLayout, isLargeScreenWidth} = useResponsiveLayout();
    const {selectedTransactions, selectAllMatchingItems, areAllMatchingItemsSelected, showSelectAllMatchingItems, shouldShowFiltersBarLoading, currentSearchResults} = useSearchContext();
    const {currencyList, getCurrencySymbol} = useCurrencyList();

    const [email] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true, selector: emailSelector});
    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST, {selector: filterPersonalCards, canBeMissing: true});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER, {canBeMissing: true});
    const {isAccountLocked, showLockedAccountModal} = useContext(LockedAccountContext);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Filter', 'Columns']);
    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);

    // Get workspace data for the filter
    const {sections: workspaces, shouldShowSearchInput: shouldShowWorkspaceSearchInput} = useWorkspaceList({
        policies: allPolicies,
        currentUserLogin: email,
        shouldShowPendingDeletePolicy: false,
        selectedPolicyIDs: undefined,
        searchTerm: '',
        localeCompare,
    });

    const shouldDisplayWorkspaceFilter = useMemo(() => workspaces.some((section) => section.data.length > 1), [workspaces]);

    const workspaceOptions = useMemo<Array<MultiSelectItem<string>>>(() => {
        return workspaces
            .flatMap((section) => section.data)
            .filter((workspace): workspace is typeof workspace & {policyID: string; icons: Icon[]} => !!workspace.policyID && !!workspace.icons)
            .map((workspace) => ({
                text: workspace.text,
                value: workspace.policyID,
                icons: workspace.icons,
            }));
    }, [workspaces]);

    const allCards = useMemo(() => mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, userCardList), [userCardList, workspaceCardFeeds]);
    const selectedTransactionsKeys = useMemo(() => Object.keys(selectedTransactions ?? {}), [selectedTransactions]);
    const hasMultipleOutputCurrency = useMemo(() => {
        const policies = Object.values(allPolicies ?? {}).filter((policy): policy is Policy => isPaidGroupPolicy(policy));
        const outputCurrency = policies.at(0)?.outputCurrency;
        return policies.some((policy) => policy.outputCurrency !== outputCurrency);
    }, [allPolicies]);

    // Get selected workspace options from filterFormValues or queryJSON
    const selectedWorkspaceOptions = useMemo(() => {
        const policyIDs = searchAdvancedFiltersForm.policyID ?? queryJSON.policyID;
        if (!policyIDs) {
            return [];
        }
        const normalizedIDs = Array.isArray(policyIDs) ? policyIDs : [policyIDs];
        return workspaceOptions.filter((option) => normalizedIDs.includes(option.value));
    }, [searchAdvancedFiltersForm.policyID, queryJSON.policyID, workspaceOptions]);

    const hasErrors = Object.keys(currentSearchResults?.errors ?? {}).length > 0 && !isOffline;
    const shouldShowSelectedDropdown = headerButtonsOptions.length > 0 && (!shouldUseNarrowLayout || isMobileSelectionModeEnabled);

    const [typeOptions, type] = useMemo(() => {
        const options = getTypeOptions(translate, allPolicies, email);
        const value = options.find((option) => option.value === unsafeType) ?? null;
        return [options, value];
    }, [translate, allPolicies, email, unsafeType]);

    const isExpenseReportType = useMemo(() => type?.value === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, [type?.value]);

    const selectedItemsCount = useMemo(() => {
        if (!selectedTransactions) {
            return 0;
        }

        if (isExpenseReportType) {
            // In expense report mode, count unique reports instead of individual transactions
            const reportIDs = new Set(
                Object.values(selectedTransactions)
                    .map((transaction) => transaction?.reportID)
                    .filter((reportID): reportID is string => !!reportID),
            );
            return reportIDs.size;
        }

        // Otherwise count transactions
        return selectedTransactionsKeys.length;
    }, [selectedTransactions, isExpenseReportType, selectedTransactionsKeys.length]);

    const [groupByOptions, groupBy] = useMemo(() => {
        const options = getGroupByOptions(translate);
        const value = options.find((option) => option.value === unsafeGroupBy) ?? null;
        return [options, value];
    }, [translate, unsafeGroupBy]);

    const [groupCurrencyOptions, groupCurrency] = useMemo(() => {
        const options = getGroupCurrencyOptions(currencyList, getCurrencySymbol);
        const value = options.find((option) => option.value === searchAdvancedFiltersForm.groupCurrency) ?? null;
        return [options, value];
    }, [searchAdvancedFiltersForm.groupCurrency, currencyList, getCurrencySymbol]);

    const [feedOptions, feed] = useMemo(() => {
        const feedFilterValues = flatFilters.find((filter) => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED)?.filters?.map((filter) => filter.value);
        const options = getFeedOptions(allFeeds, allCards, translate);
        const value = feedFilterValues ? options.filter((option) => feedFilterValues.includes(option.value)) : [];
        return [options, value];
    }, [flatFilters, allFeeds, allCards, translate]);

    const [statusOptions, status] = useMemo(() => {
        const options = type ? getStatusOptions(translate, type.value) : [];
        const value = [
            Array.isArray(unsafeStatus) ? options.filter((option) => unsafeStatus.includes(option.value)) : (options.find((option) => option.value === unsafeStatus) ?? []),
        ].flat();
        return [options, value];
    }, [translate, unsafeStatus, type]);

    const [hasOptions, has] = useMemo(() => {
        const hasFilterValues = flatFilters.find((filter) => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS)?.filters?.map((filter) => filter.value);
        const options = getHasOptions(translate, type?.value ?? CONST.SEARCH.DATA_TYPES.EXPENSE);
        const value = hasFilterValues ? options.filter((option) => hasFilterValues.includes(option.value)) : [];
        return [options, value];
    }, [translate, flatFilters, type?.value]);

    const [isOptions, is] = useMemo(() => {
        const isFilterValues = flatFilters.find((filter) => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.IS)?.filters?.map((filter) => filter.value);
        const options = Object.values(CONST.SEARCH.IS_VALUES).map((value) => ({text: translate(`common.${value}`), value}));
        const value = isFilterValues ? options.filter((option) => isFilterValues.includes(option.value)) : [];
        return [options, value];
    }, [flatFilters, translate]);

    const createDateDisplayValue = useCallback(
        (filterValues: {on?: string; after?: string; before?: string}): [SearchDateValues, string[]] => {
            const value: SearchDateValues = {
                [CONST.SEARCH.DATE_MODIFIERS.ON]: filterValues.on,
                [CONST.SEARCH.DATE_MODIFIERS.AFTER]: filterValues.after,
                [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: filterValues.before,
            };

            const displayText: string[] = [];
            if (value.On) {
                displayText.push(
                    isSearchDatePreset(value.On) ? translate(`search.filters.date.presets.${value.On}`) : `${translate('common.on')} ${DateUtils.formatToReadableString(value.On)}`,
                );
            }
            if (value.After) {
                displayText.push(`${translate('common.after')} ${DateUtils.formatToReadableString(value.After)}`);
            }
            if (value.Before) {
                displayText.push(`${translate('common.before')} ${DateUtils.formatToReadableString(value.Before)}`);
            }

            return [value, displayText];
        },
        [translate],
    );

    const [date, displayDate] = useMemo(
        () =>
            createDateDisplayValue({
                on: searchAdvancedFiltersForm.dateOn,
                after: searchAdvancedFiltersForm.dateAfter,
                before: searchAdvancedFiltersForm.dateBefore,
            }),
        [searchAdvancedFiltersForm.dateOn, searchAdvancedFiltersForm.dateAfter, searchAdvancedFiltersForm.dateBefore, createDateDisplayValue],
    );

    const [posted, displayPosted] = useMemo(
        () =>
            createDateDisplayValue({
                on: searchAdvancedFiltersForm.postedOn,
                after: searchAdvancedFiltersForm.postedAfter,
                before: searchAdvancedFiltersForm.postedBefore,
            }),
        [searchAdvancedFiltersForm.postedOn, searchAdvancedFiltersForm.postedAfter, searchAdvancedFiltersForm.postedBefore, createDateDisplayValue],
    );

    const [withdrawn, displayWithdrawn] = useMemo(
        () =>
            createDateDisplayValue({
                on: searchAdvancedFiltersForm.withdrawnOn,
                after: searchAdvancedFiltersForm.withdrawnAfter,
                before: searchAdvancedFiltersForm.withdrawnBefore,
            }),
        [searchAdvancedFiltersForm.withdrawnOn, searchAdvancedFiltersForm.withdrawnAfter, searchAdvancedFiltersForm.withdrawnBefore, createDateDisplayValue],
    );

    const [withdrawalTypeOptions, withdrawalType] = useMemo(() => {
        const options = getWithdrawalTypeOptions(translate);
        const value = options.find((option) => option.value === searchAdvancedFiltersForm.withdrawalType) ?? null;
        return [options, value];
    }, [translate, searchAdvancedFiltersForm.withdrawalType]);
    const {accountID} = useCurrentUserPersonalDetails();
    const activeAdminPolicies = getActiveAdminWorkspaces(allPolicies, accountID.toString()).sort((a, b) => localeCompare(a.name || '', b.name || ''));

    const updateFilterForm = useCallback(
        (values: Partial<SearchAdvancedFiltersForm>) => {
            const updatedFilterFormValues: Partial<SearchAdvancedFiltersForm> = {
                ...searchAdvancedFiltersForm,
                ...values,
            };

            // If the type has changed, reset the status so we dont have an invalid status selected
            if (updatedFilterFormValues.type !== searchAdvancedFiltersForm.type) {
                updatedFilterFormValues.status = CONST.SEARCH.STATUS.EXPENSE.ALL;
                updatedFilterFormValues.columns = [];
            }

            if (updatedFilterFormValues.groupBy !== searchAdvancedFiltersForm.groupBy) {
                updatedFilterFormValues.columns = [];
            }

            // Preserve the current sortBy, sortOrder, and limit from queryJSON when updating filters
            let queryString = buildQueryStringFromFilterFormValues(updatedFilterFormValues, {
                sortBy: queryJSON.sortBy,
                sortOrder: queryJSON.sortOrder,
                limit: queryJSON.limit,
            });

            if (updatedFilterFormValues.groupBy !== searchAdvancedFiltersForm.groupBy) {
                queryString = getQueryWithUpdatedValues(queryString, true) ?? '';
            }
            if (!queryString) {
                return;
            }

            close(() => {
                // We want to explicitly clear stale rawQuery since it's only used for manually typed-in queries.
                Navigation.setParams({q: queryString, rawQuery: undefined});
            });
        },
        [searchAdvancedFiltersForm, queryJSON.sortBy, queryJSON.sortOrder, queryJSON.limit],
    );

    const openAdvancedFilters = useCallback(() => {
        updateAdvancedFilters(filterFormValues);
        Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    }, [filterFormValues]);

    const openSearchColumns = () => {
        Navigation.navigate(ROUTES.SEARCH_COLUMNS);
    };

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
                    onChange={(item) => {
                        const newValue = item?.value;
                        if (!newValue) {
                            // groupCurrency depends on groupBy. Without groupBy groupCurrency makes no sense
                            updateFilterForm({groupBy: undefined, groupCurrency: undefined});
                        } else {
                            updateFilterForm({groupBy: newValue});
                        }
                    }}
                />
            );
        },
        [translate, groupByOptions, groupBy, updateFilterForm],
    );

    const groupCurrencyComponent = useCallback(
        ({closeOverlay}: PopoverComponentProps) => {
            return (
                <SingleSelectPopup
                    label={translate('common.groupCurrency')}
                    items={groupCurrencyOptions}
                    value={groupCurrency}
                    closeOverlay={closeOverlay}
                    onChange={(item) => updateFilterForm({groupCurrency: item?.value})}
                    isSearchable
                    searchPlaceholder={translate('common.groupCurrency')}
                />
            );
        },
        [translate, groupCurrencyOptions, groupCurrency, updateFilterForm],
    );

    const createDatePickerComponent = useCallback(
        (filterKey: SearchDateFilterKeys, value: SearchDateValues, translationKey: TranslationPaths) => {
            return ({closeOverlay}: PopoverComponentProps) => {
                const onChange = (selectedDates: SearchDateValues) => {
                    const dateFormValues = {
                        [`${filterKey}On`]: selectedDates[CONST.SEARCH.DATE_MODIFIERS.ON],
                        [`${filterKey}After`]: selectedDates[CONST.SEARCH.DATE_MODIFIERS.AFTER],
                        [`${filterKey}Before`]: selectedDates[CONST.SEARCH.DATE_MODIFIERS.BEFORE],
                    };

                    updateFilterForm(dateFormValues);
                };

                return (
                    <DateSelectPopup
                        label={translate(translationKey)}
                        value={value}
                        onChange={onChange}
                        closeOverlay={closeOverlay}
                        presets={getDatePresets(filterKey, true)}
                    />
                );
            };
        },
        [translate, updateFilterForm],
    );

    const createMultiSelectComponent = useCallback(
        <T extends string>(
            translationKey: TranslationPaths,
            items: Array<MultiSelectItem<T>>,
            value: Array<MultiSelectItem<T>>,
            onChangeCallback: (selectedItems: Array<MultiSelectItem<T>>) => void,
            isSearchable?: boolean,
        ) => {
            return ({closeOverlay}: PopoverComponentProps) => {
                return (
                    <MultiSelectPopup
                        label={translate(translationKey)}
                        items={items}
                        value={value}
                        closeOverlay={closeOverlay}
                        onChange={onChangeCallback}
                        isSearchable={isSearchable}
                    />
                );
            };
        },
        [translate],
    );

    const feedComponent = useMemo(() => {
        const updateFeedFilterForm = (items: Array<MultiSelectItem<string>>) => {
            updateFilterForm({feed: items.map((item) => item.value)});
        };
        return createMultiSelectComponent('search.filters.feed', feedOptions, feed, updateFeedFilterForm);
    }, [createMultiSelectComponent, feedOptions, feed, updateFilterForm]);

    const datePickerComponent = useMemo(() => createDatePickerComponent(CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE, date, 'common.date'), [createDatePickerComponent, date]);

    const postedPickerComponent = useMemo(() => createDatePickerComponent(CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED, posted, 'search.filters.posted'), [createDatePickerComponent, posted]);

    const withdrawnPickerComponent = useMemo(
        () => createDatePickerComponent(CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN, withdrawn, 'search.filters.withdrawn'),
        [createDatePickerComponent, withdrawn],
    );

    const withdrawalTypeComponent = useCallback(
        ({closeOverlay}: PopoverComponentProps) => {
            return (
                <SingleSelectPopup
                    label={translate('search.withdrawalType')}
                    items={withdrawalTypeOptions}
                    value={withdrawalType}
                    closeOverlay={closeOverlay}
                    onChange={(item) => updateFilterForm({withdrawalType: item?.value})}
                />
            );
        },
        [translate, withdrawalTypeOptions, withdrawalType, updateFilterForm],
    );

    const statusComponent = useMemo(() => {
        const updateStatusFilterForm = (selectedItems: Array<MultiSelectItem<SingularSearchStatus>>) => {
            const newStatus = selectedItems.length ? selectedItems.map((i) => i.value) : CONST.SEARCH.STATUS.EXPENSE.ALL;
            updateFilterForm({status: newStatus});
        };
        return createMultiSelectComponent('common.status', statusOptions, status, updateStatusFilterForm);
    }, [createMultiSelectComponent, statusOptions, status, updateFilterForm]);

    const hasComponent = useMemo(() => {
        const updateHasFilterForm = (selectedItems: Array<MultiSelectItem<string>>) => {
            updateFilterForm({has: selectedItems.map((item) => item.value)});
        };
        return createMultiSelectComponent('search.has', hasOptions, has, updateHasFilterForm);
    }, [createMultiSelectComponent, hasOptions, has, updateFilterForm]);

    const isComponent = useMemo(() => {
        const updateIsFilterForm = (selectedItems: Array<MultiSelectItem<string>>) => {
            updateFilterForm({is: selectedItems.map((item) => item.value)});
        };
        return createMultiSelectComponent('search.filters.is', isOptions, is, updateIsFilterForm);
    }, [createMultiSelectComponent, isOptions, is, updateFilterForm]);

    const userPickerComponent = useCallback(
        ({closeOverlay}: PopoverComponentProps) => {
            const value = searchAdvancedFiltersForm.from ?? [];

            return (
                <UserSelectPopup
                    value={value}
                    closeOverlay={closeOverlay}
                    onChange={(selectedUsers) => updateFilterForm({from: selectedUsers})}
                />
            );
        },
        [searchAdvancedFiltersForm.from, updateFilterForm],
    );

    const handleWorkspaceChange = useCallback(
        (items: Array<MultiSelectItem<string>>) => {
            updateFilterForm({policyID: items.map((item) => item.value)});
        },
        [updateFilterForm],
    );

    const workspaceComponent = useCallback(
        ({closeOverlay}: PopoverComponentProps) => {
            return (
                <MultiSelectPopup
                    label={translate('workspace.common.workspace')}
                    items={workspaceOptions}
                    value={selectedWorkspaceOptions}
                    closeOverlay={closeOverlay}
                    onChange={handleWorkspaceChange}
                    isSearchable={shouldShowWorkspaceSearchInput}
                />
            );
        },
        [workspaceOptions, selectedWorkspaceOptions, handleWorkspaceChange, shouldShowWorkspaceSearchInput, translate],
    );

    const workspaceValue = useMemo(() => selectedWorkspaceOptions.map((option) => option.text), [selectedWorkspaceOptions]);

    const {typeFiltersKeys} = useAdvancedSearchFilters();

    /**
     * Builds the list of all filter chips to be displayed in the
     * filter bar
     */
    const filters = useMemo<FilterItem[]>(() => {
        const fromValue = searchAdvancedFiltersForm.from?.map((currentAccountID) => getDisplayNameOrDefault(personalDetails?.[currentAccountID], currentAccountID, false)) ?? [];

        const shouldDisplayGroupByFilter = !!groupBy?.value;
        const shouldDisplayGroupCurrencyFilter = shouldDisplayGroupByFilter && hasMultipleOutputCurrency;
        const shouldDisplayFeedFilter = feedOptions.length > 1 && !!searchAdvancedFiltersForm.feed;
        const shouldDisplayPostedFilter =
            !!searchAdvancedFiltersForm.feed && (!!searchAdvancedFiltersForm.postedOn || !!searchAdvancedFiltersForm.postedAfter || !!searchAdvancedFiltersForm.postedBefore);
        const shouldDisplayWithdrawalTypeFilter = !!searchAdvancedFiltersForm.withdrawalType;
        const shouldDisplayWithdrawnFilter = !!searchAdvancedFiltersForm.withdrawnOn || !!searchAdvancedFiltersForm.withdrawnAfter || !!searchAdvancedFiltersForm.withdrawnBefore;

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
            ...(shouldDisplayGroupCurrencyFilter
                ? [
                      {
                          label: translate('common.groupCurrency'),
                          PopoverComponent: groupCurrencyComponent,
                          value: groupCurrency?.value ?? null,
                          filterKey: FILTER_KEYS.GROUP_CURRENCY,
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
            ...(shouldDisplayWithdrawalTypeFilter
                ? [
                      {
                          label: translate('search.withdrawalType'),
                          PopoverComponent: withdrawalTypeComponent,
                          value: withdrawalType?.text ?? null,
                          filterKey: FILTER_KEYS.WITHDRAWAL_TYPE,
                      },
                  ]
                : []),
            ...(shouldDisplayWithdrawnFilter
                ? [
                      {
                          label: translate('search.filters.withdrawn'),
                          PopoverComponent: withdrawnPickerComponent,
                          value: displayWithdrawn,
                          filterKey: FILTER_KEYS.WITHDRAWN_ON,
                      },
                  ]
                : []),
            {
                label: translate('common.status'),
                PopoverComponent: statusComponent,
                value: status.map((option) => option.text),
                filterKey: FILTER_KEYS.STATUS,
            },
            ...(type?.value === CONST.SEARCH.DATA_TYPES.CHAT
                ? [
                      {
                          label: translate('search.has'),
                          PopoverComponent: hasComponent,
                          value: has.map((option) => option.text),
                          filterKey: FILTER_KEYS.HAS,
                      },
                  ]
                : []),
            ...(type?.value === CONST.SEARCH.DATA_TYPES.CHAT
                ? [
                      {
                          label: translate('search.filters.is'),
                          PopoverComponent: isComponent,
                          value: is.map((option) => option.text),
                          filterKey: FILTER_KEYS.IS,
                      },
                  ]
                : []),
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
            ...(shouldDisplayWorkspaceFilter
                ? [
                      {
                          label: translate('workspace.common.workspace'),
                          PopoverComponent: workspaceComponent,
                          value: workspaceValue,
                          filterKey: FILTER_KEYS.POLICY_ID,
                      },
                  ]
                : []),
        ].filter((filterItem) => isFilterSupported(filterItem.filterKey, type?.value ?? CONST.SEARCH.DATA_TYPES.EXPENSE));

        return filterList;
    }, [
        type?.value,
        type?.text,
        groupBy?.value,
        groupBy?.text,
        groupCurrency?.value,
        withdrawalType?.text,
        displayDate,
        displayPosted,
        displayWithdrawn,
        searchAdvancedFiltersForm.from,
        searchAdvancedFiltersForm.feed,
        searchAdvancedFiltersForm.postedOn,
        searchAdvancedFiltersForm.postedAfter,
        searchAdvancedFiltersForm.postedBefore,
        searchAdvancedFiltersForm.withdrawalType,
        searchAdvancedFiltersForm.withdrawnOn,
        searchAdvancedFiltersForm.withdrawnAfter,
        searchAdvancedFiltersForm.withdrawnBefore,
        translate,
        hasComponent,
        isComponent,
        typeComponent,
        groupByComponent,
        groupCurrencyComponent,
        statusComponent,
        datePickerComponent,
        userPickerComponent,
        postedPickerComponent,
        withdrawalTypeComponent,
        withdrawnPickerComponent,
        status,
        personalDetails,
        feed,
        feedComponent,
        feedOptions.length,
        hasMultipleOutputCurrency,
        has,
        is,
        shouldDisplayWorkspaceFilter,
        workspaceComponent,
        workspaceValue,
    ]);

    const hiddenSelectedFilters = useMemo(() => {
        const advancedSearchFiltersKeys = typeFiltersKeys.flat();
        const exposedFiltersKeys = new Set(
            filters.flatMap((filter) => {
                const dateFilterKey = DATE_FILTER_KEYS.find((key) => filter.filterKey.startsWith(key));
                if (dateFilterKey) {
                    return dateFilterKey;
                }
                return filter.filterKey;
            }),
        );

        const hiddenFilters = advancedSearchFiltersKeys.filter((key) => !exposedFiltersKeys.has(key as SearchAdvancedFiltersKey));
        const hasReportFields = Object.keys(searchAdvancedFiltersForm).some(
            (key) => key.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX) && !key.startsWith(CONST.SEARCH.REPORT_FIELD.NOT_PREFIX),
        );

        return hiddenFilters.filter((key) => {
            const dateFilterKey = DATE_FILTER_KEYS.find((dateKey) => key === dateKey);
            if (dateFilterKey) {
                return searchAdvancedFiltersForm[`${dateFilterKey}On`] ?? searchAdvancedFiltersForm[`${dateFilterKey}After`] ?? searchAdvancedFiltersForm[`${dateFilterKey}Before`];
            }

            if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_FIELD) {
                return hasReportFields;
            }

            const amountFilterKey = AMOUNT_FILTER_KEYS.find((amountKey) => key === amountKey);
            if (amountFilterKey) {
                return (
                    searchAdvancedFiltersForm[`${amountFilterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO}`] ??
                    searchAdvancedFiltersForm[`${amountFilterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}`] ??
                    searchAdvancedFiltersForm[`${amountFilterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}`]
                );
            }

            return searchAdvancedFiltersForm[key as SearchAdvancedFiltersKey];
        });
    }, [searchAdvancedFiltersForm, filters, typeFiltersKeys]);

    const adjustScroll = useCallback((info: {distanceFromEnd: number}) => {
        // Workaround for a known React Native bug on Android (https://github.com/facebook/react-native/issues/27504):
        // When the FlatList is scrolled to the end and the last item is deleted, a blank space is left behind.
        // To fix this, we detect when onEndReached is triggered due to an item deletion,
        // and programmatically scroll to the end to fill the space.
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (!shouldAdjustScroll || info.distanceFromEnd > 0) {
            return;
        }
        scrollRef.current?.scrollToEnd();
    }, []);

    const renderFilterItem = useCallback(
        // eslint-disable-next-line react/no-unused-prop-types
        ({item}: {item: FilterItem}) => (
            <DropdownButton
                label={item.label}
                value={item.value}
                PopoverComponent={item.PopoverComponent}
            />
        ),
        [],
    );

    const shouldShowColumnsButton = isLargeScreenWidth && (queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE || queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT);

    const filterButtonText = useMemo(
        () => translate('search.filtersHeader') + (hiddenSelectedFilters.length > 0 ? ` (${hiddenSelectedFilters.length})` : ''),
        [translate, hiddenSelectedFilters.length],
    );

    const renderListFooter = useCallback(
        () => (
            <View style={[styles.flexRow, styles.gap2]}>
                <Button
                    link
                    small
                    shouldUseDefaultHover={false}
                    text={filterButtonText}
                    iconFill={theme.link}
                    iconHoverFill={theme.linkHover}
                    icon={expensifyIcons.Filter}
                    textStyles={[styles.textMicroBold]}
                    onPress={openAdvancedFilters}
                />
                {shouldShowColumnsButton && (
                    <Button
                        link
                        small
                        shouldUseDefaultHover={false}
                        text={translate('search.columns')}
                        iconFill={theme.link}
                        iconHoverFill={theme.linkHover}
                        icon={expensifyIcons.Columns}
                        textStyles={[styles.textMicroBold]}
                        onPress={openSearchColumns}
                    />
                )}
            </View>
        ),
        [
            styles.flexRow,
            styles.gap2,
            styles.textMicroBold,
            filterButtonText,
            theme.link,
            theme.linkHover,
            expensifyIcons.Filter,
            expensifyIcons.Columns,
            openAdvancedFilters,
            shouldShowColumnsButton,
            translate,
        ],
    );

    if (hasErrors) {
        return null;
    }

    if (shouldShowFiltersBarLoading) {
        return <SearchFiltersSkeleton shouldAnimate />;
    }

    const selectionButtonText = areAllMatchingItemsSelected ? translate('search.exportAll.allMatchingItemsSelected') : translate('workspace.common.selected', {count: selectedItemsCount});

    return (
        <View style={[shouldShowSelectedDropdown && styles.ph5, styles.mb2, styles.searchFiltersBarContainer]}>
            {shouldShowSelectedDropdown ? (
                <KYCWall
                    ref={kycWallRef}
                    chatReportID={currentSelectedReportID}
                    enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                    iouReport={selectedIOUReport}
                    addBankAccountRoute={
                        isCurrentSelectedExpenseReport ? ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(currentSelectedPolicyID, undefined, Navigation.getActiveRoute()) : undefined
                    }
                    onSuccessfulKYC={(paymentType) => confirmPayment?.(paymentType)}
                >
                    {(triggerKYCFlow, buttonRef) => (
                        <View style={[styles.flexRow, styles.gap3]}>
                            <ButtonWithDropdownMenu
                                onPress={() => null}
                                shouldAlwaysShowDropdownMenu
                                buttonSize={CONST.DROPDOWN_BUTTON_SIZE.SMALL}
                                customText={selectionButtonText}
                                options={headerButtonsOptions}
                                onSubItemSelected={(subItem) =>
                                    handleBulkPayItemSelected({
                                        item: subItem,
                                        triggerKYCFlow,
                                        isAccountLocked,
                                        showLockedAccountModal,
                                        policy: currentPolicy,
                                        latestBankItems,
                                        activeAdminPolicies,
                                        isUserValidated,
                                        isDelegateAccessRestricted,
                                        showDelegateNoAccessModal,
                                        confirmPayment,
                                    })
                                }
                                isSplitButton={false}
                                buttonRef={buttonRef}
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
                    )}
                </KYCWall>
            ) : (
                <FlatList
                    horizontal
                    keyboardShouldPersistTaps="always"
                    style={[styles.flexRow, styles.overflowScroll, styles.flexGrow0]}
                    contentContainerStyle={[styles.flexRow, styles.flexGrow0, styles.gap2, styles.ph5]}
                    ref={scrollRef}
                    showsHorizontalScrollIndicator={false}
                    data={filters}
                    keyExtractor={(item) => item.label}
                    renderItem={renderFilterItem}
                    ListFooterComponent={renderListFooter}
                    onEndReached={adjustScroll}
                    onEndReachedThreshold={0.75}
                />
            )}
        </View>
    );
}

export default SearchFiltersBar;
