import {useIsFocused} from '@react-navigation/native';
import {isUserValidatedSelector} from '@selectors/Account';
import {emailSelector} from '@selectors/Session';
import {searchResultsErrorSelector} from '@selectors/Snapshot';
import React, {useCallback, useContext, useEffect, useMemo, useRef} from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import KYCWall from '@components/KYCWall';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';
import type {PaymentMethodType} from '@components/KYCWall/types';
import {LockedAccountContext} from '@components/LockedAccountModalProvider';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScrollView from '@components/ScrollView';
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
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
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
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getActiveAdminWorkspaces, getAllTaxRates, isPaidGroupPolicy} from '@libs/PolicyUtils';
import {isExpenseReport} from '@libs/ReportUtils';
import {buildFilterFormValuesFromQuery, buildQueryStringFromFilterFormValues, isFilterSupported, isSearchDatePreset} from '@libs/SearchQueryUtils';
import {getDatePresets, getFeedOptions, getGroupByOptions, getGroupCurrencyOptions, getHasOptions, getStatusOptions, getTypeOptions, getWithdrawalTypeOptions} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import FILTER_KEYS, {AMOUNT_FILTER_KEYS, DATE_FILTER_KEYS} from '@src/types/form/SearchAdvancedFiltersForm';
import type {SearchAdvancedFiltersKey} from '@src/types/form/SearchAdvancedFiltersForm';
import type {CurrencyList, Policy} from '@src/types/onyx';
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
    const isFocused = useIsFocused();
    const scrollRef = useRef<RNScrollView>(null);
    const currentPolicy = usePolicy(currentSelectedPolicyID);
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector, canBeMissing: true});
    // type, groupBy and status values are not guaranteed to respect the ts type as they come from user input
    const {hash, type: unsafeType, groupBy: unsafeGroupBy, status: unsafeStatus, flatFilters} = queryJSON;
    const [selectedIOUReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${currentSelectedReportID}`, {canBeMissing: true});
    const isCurrentSelectedExpenseReport = isExpenseReport(currentSelectedReportID);
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const kycWallRef = useContext(KYCWallContext);

    const {isOffline} = useNetwork();
    const personalDetails = usePersonalDetails();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {selectedTransactions, selectAllMatchingItems, areAllMatchingItemsSelected, showSelectAllMatchingItems, shouldShowFiltersBarLoading} = useSearchContext();

    const [email] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true, selector: emailSelector});
    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [currencyList = getEmptyObject<CurrencyList>()] = useOnyx(ONYXKEYS.CURRENCY_LIST, {canBeMissing: true});
    const [policyTagsLists] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {canBeMissing: true});
    const [policyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, {canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER, {canBeMissing: true});
    const {isAccountLocked, showLockedAccountModal} = useContext(LockedAccountContext);
    const [searchResultsErrors] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`, {canBeMissing: true, selector: searchResultsErrorSelector});
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Filter'] as const);

    const taxRates = getAllTaxRates(allPolicies);

    // Get workspace data for the filter
    const {sections: workspaces} = useWorkspaceList({
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
            .filter((workspace): workspace is typeof workspace & {policyID: string} => !!workspace.policyID)
            .map((workspace) => ({
                text: workspace.text,
                value: workspace.policyID,
            }));
    }, [workspaces]);

    const allCards = useMemo(() => mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, userCardList), [userCardList, workspaceCardFeeds]);
    const selectedTransactionsKeys = useMemo(() => Object.keys(selectedTransactions ?? {}), [selectedTransactions]);
    const hasMultipleOutputCurrency = useMemo(() => {
        const policies = Object.values(allPolicies ?? {}).filter((policy): policy is Policy => isPaidGroupPolicy(policy));
        const outputCurrency = policies.at(0)?.outputCurrency;
        return policies.some((policy) => policy.outputCurrency !== outputCurrency);
    }, [allPolicies]);

    const filterFormValues = useMemo(() => {
        return buildFilterFormValuesFromQuery(queryJSON, policyCategories, policyTagsLists, currencyList, personalDetails, allCards, reports, taxRates);
    }, [allCards, currencyList, personalDetails, policyCategories, policyTagsLists, queryJSON, reports, taxRates]);

    // Get selected workspace options from filterFormValues or queryJSON
    const selectedWorkspaceOptions = useMemo(() => {
        const policyIDs = filterFormValues.policyID ?? queryJSON.policyID;
        if (!policyIDs) {
            return [];
        }
        const normalizedIDs = Array.isArray(policyIDs) ? policyIDs : [policyIDs];
        return workspaceOptions.filter((option) => normalizedIDs.includes(option.value));
    }, [filterFormValues.policyID, queryJSON.policyID, workspaceOptions]);

    const hasErrors = Object.keys(searchResultsErrors ?? {}).length > 0 && !isOffline;
    const shouldShowSelectedDropdown = headerButtonsOptions.length > 0 && (!shouldUseNarrowLayout || isMobileSelectionModeEnabled);

    const [typeOptions, type] = useMemo(() => {
        const options = getTypeOptions(allPolicies, email);
        const value = options.find((option) => option.value === unsafeType) ?? null;
        return [options, value];
    }, [allPolicies, email, unsafeType]);

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
        const options = getGroupByOptions();
        const value = options.find((option) => option.value === unsafeGroupBy) ?? null;
        return [options, value];
    }, [unsafeGroupBy]);

    const [groupCurrencyOptions, groupCurrency] = useMemo(() => {
        const options = getGroupCurrencyOptions(currencyList);
        const value = options.find((option) => option.value === filterFormValues.groupCurrency) ?? null;
        return [options, value];
    }, [filterFormValues.groupCurrency, currencyList]);

    const [feedOptions, feed] = useMemo(() => {
        const feedFilterValues = flatFilters.find((filter) => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED)?.filters?.map((filter) => filter.value);
        const options = getFeedOptions(allFeeds, allCards);
        const value = feedFilterValues ? options.filter((option) => feedFilterValues.includes(option.value)) : [];
        return [options, value];
    }, [flatFilters, allFeeds, allCards]);

    const [statusOptions, status] = useMemo(() => {
        const options = type ? getStatusOptions(translate, type.value) : [];
        const value = [
            Array.isArray(unsafeStatus) ? options.filter((option) => unsafeStatus.includes(option.value)) : (options.find((option) => option.value === unsafeStatus) ?? []),
        ].flat();
        return [options, value];
    }, [translate, unsafeStatus, type]);

    const [hasOptions, has] = useMemo(() => {
        const hasFilterValues = flatFilters.find((filter) => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS)?.filters?.map((filter) => filter.value);
        const options = getHasOptions(type?.value ?? CONST.SEARCH.DATA_TYPES.EXPENSE);
        const value = hasFilterValues ? options.filter((option) => hasFilterValues.includes(option.value)) : [];
        return [options, value];
    }, [flatFilters, type?.value]);

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
                on: filterFormValues.dateOn,
                after: filterFormValues.dateAfter,
                before: filterFormValues.dateBefore,
            }),
        [filterFormValues.dateOn, filterFormValues.dateAfter, filterFormValues.dateBefore, createDateDisplayValue],
    );

    const [posted, displayPosted] = useMemo(
        () =>
            createDateDisplayValue({
                on: filterFormValues.postedOn,
                after: filterFormValues.postedAfter,
                before: filterFormValues.postedBefore,
            }),
        [filterFormValues.postedOn, filterFormValues.postedAfter, filterFormValues.postedBefore, createDateDisplayValue],
    );

    const [withdrawn, displayWithdrawn] = useMemo(
        () =>
            createDateDisplayValue({
                on: filterFormValues.withdrawnOn,
                after: filterFormValues.withdrawnAfter,
                before: filterFormValues.withdrawnBefore,
            }),
        [filterFormValues.withdrawnOn, filterFormValues.withdrawnAfter, filterFormValues.withdrawnBefore, createDateDisplayValue],
    );

    const [withdrawalTypeOptions, withdrawalType] = useMemo(() => {
        const options = getWithdrawalTypeOptions(translate);
        const value = options.find((option) => option.value === filterFormValues.withdrawalType) ?? null;
        return [options, value];
    }, [translate, filterFormValues.withdrawalType]);
    const {accountID} = useCurrentUserPersonalDetails();
    const activeAdminPolicies = getActiveAdminWorkspaces(allPolicies, accountID.toString()).sort((a, b) => localeCompare(a.name || '', b.name || ''));

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

            const queryString = buildQueryStringFromFilterFormValues(updatedFilterFormValues);

            close(() => {
                Navigation.setParams({q: queryString});
            });
        },
        [filterFormValues],
    );

    const openAdvancedFilters = useCallback(() => {
        updateAdvancedFilters(filterFormValues, true);
        Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    }, [filterFormValues]);

    const isFormInitializedRef = useRef(false);

    useEffect(() => {
        if (isFormInitializedRef.current) {
            return;
        }
        if (filterFormValues && Object.keys(filterFormValues).length > 0) {
            if (isFocused) {
                updateAdvancedFilters(filterFormValues, true);
            }
            isFormInitializedRef.current = true;
        }
    }, [queryJSON, filterFormValues, isFocused]);

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
        ) => {
            return ({closeOverlay}: PopoverComponentProps) => {
                return (
                    <MultiSelectPopup
                        label={translate(translationKey)}
                        items={items}
                        value={value}
                        closeOverlay={closeOverlay}
                        onChange={onChangeCallback}
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

    const workspaceComponent = useMemo(() => {
        const updateWorkspaceFilterForm = (items: Array<MultiSelectItem<string>>) => {
            updateFilterForm({policyID: items.map((item) => item.value)});
        };
        return createMultiSelectComponent('workspace.common.workspace', workspaceOptions, selectedWorkspaceOptions, updateWorkspaceFilterForm);
    }, [createMultiSelectComponent, workspaceOptions, selectedWorkspaceOptions, updateFilterForm]);

    const workspaceValue = useMemo(() => selectedWorkspaceOptions.map((option) => option.text), [selectedWorkspaceOptions]);

    const {typeFiltersKeys} = useAdvancedSearchFilters();

    /**
     * Builds the list of all filter chips to be displayed in the
     * filter bar
     */
    const filters = useMemo<FilterItem[]>(() => {
        const fromValue = filterFormValues.from?.map((currentAccountID) => getDisplayNameOrDefault(personalDetails?.[currentAccountID], currentAccountID, false)) ?? [];

        const shouldDisplayGroupByFilter = !!groupBy?.value;
        const shouldDisplayGroupCurrencyFilter = shouldDisplayGroupByFilter && hasMultipleOutputCurrency;
        const shouldDisplayFeedFilter = feedOptions.length > 1 && !!filterFormValues.feed;
        const shouldDisplayPostedFilter = !!filterFormValues.feed && (!!filterFormValues.postedOn || !!filterFormValues.postedAfter || !!filterFormValues.postedBefore);
        const shouldDisplayWithdrawalTypeFilter = !!filterFormValues.withdrawalType;
        const shouldDisplayWithdrawnFilter = !!filterFormValues.withdrawnOn || !!filterFormValues.withdrawnAfter || !!filterFormValues.withdrawnBefore;

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
        filterFormValues.from,
        filterFormValues.feed,
        filterFormValues.postedOn,
        filterFormValues.postedAfter,
        filterFormValues.postedBefore,
        filterFormValues.withdrawalType,
        filterFormValues.withdrawnOn,
        filterFormValues.withdrawnAfter,
        filterFormValues.withdrawnBefore,
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
        const hasReportFields = Object.keys(filterFormValues).some((key) => key.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX) && !key.startsWith(CONST.SEARCH.REPORT_FIELD.NOT_PREFIX));

        return hiddenFilters.filter((key) => {
            const dateFilterKey = DATE_FILTER_KEYS.find((dateKey) => key === dateKey);
            if (dateFilterKey) {
                return filterFormValues[`${dateFilterKey}On`] ?? filterFormValues[`${dateFilterKey}After`] ?? filterFormValues[`${dateFilterKey}Before`];
            }

            if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_FIELD) {
                return hasReportFields;
            }

            const amountFilterKey = AMOUNT_FILTER_KEYS.find((amountKey) => key === amountKey);
            if (amountFilterKey) {
                return (
                    filterFormValues[`${amountFilterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO}`] ??
                    filterFormValues[`${amountFilterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}`] ??
                    filterFormValues[`${amountFilterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}`]
                );
            }

            return filterFormValues[key as SearchAdvancedFiltersKey];
        });
    }, [filterFormValues, filters, typeFiltersKeys]);

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
                                    handleBulkPayItemSelected(
                                        subItem,
                                        triggerKYCFlow,
                                        isAccountLocked,
                                        showLockedAccountModal,
                                        currentPolicy,
                                        latestBankItems,
                                        activeAdminPolicies,
                                        isUserValidated,
                                        confirmPayment,
                                    )
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
                        text={translate('search.filtersHeader') + (hiddenSelectedFilters.length > 0 ? ` (${hiddenSelectedFilters.length})` : '')}
                        iconFill={theme.link}
                        iconHoverFill={theme.linkHover}
                        icon={expensifyIcons.Filter}
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
