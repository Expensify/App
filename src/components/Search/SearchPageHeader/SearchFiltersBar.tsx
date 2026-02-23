import {isUserValidatedSelector} from '@selectors/Account';
import {emailSelector} from '@selectors/Session';
import React, {useContext, useRef} from 'react';
import type {ReactNode} from 'react';
import {FlatList, View} from 'react-native';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
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
import {useCurrencyListActions, useCurrencyListState} from '@hooks/useCurrencyList';
import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import useFilterFormValues from '@hooks/useFilterFormValues';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSortedActiveAdminPolicies from '@hooks/useSortedActiveAdminPolicies';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {close} from '@libs/actions/Modal';
import {handleBulkPayItemSelected, updateAdvancedFilters} from '@libs/actions/Search';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {isExpenseReport} from '@libs/ReportUtils';
import {buildQueryStringFromFilterFormValues, getQueryWithUpdatedValues, isFilterSupported, isSearchDatePreset} from '@libs/SearchQueryUtils';
import {
    filterValidHasValues,
    getDatePresets,
    getFeedOptions,
    getGroupByOptions,
    getGroupCurrencyOptions,
    getHasOptions,
    getStatusOptions,
    getTypeOptions,
    getViewOptions,
    getWithdrawalTypeOptions,
} from '@libs/SearchUIUtils';
import shouldAdjustScroll from '@libs/shouldAdjustScroll';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {hasMultipleOutputCurrenciesSelector} from '@src/selectors/Policy';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import FILTER_KEYS, {AMOUNT_FILTER_KEYS, DATE_FILTER_KEYS} from '@src/types/form/SearchAdvancedFiltersForm';
import type {SearchAdvancedFiltersKey} from '@src/types/form/SearchAdvancedFiltersForm';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import type {SearchHeaderOptionValue} from './SearchPageHeader';

type FilterItem = WithSentryLabel & {
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

type DatePickerFilterPopupProps = PopoverComponentProps & {
    filterKey: SearchDateFilterKeys;
    value: SearchDateValues;
    translationKey: TranslationPaths;
    updateFilterForm: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

function DatePickerFilterPopup({closeOverlay, filterKey, value, translationKey, updateFilterForm}: DatePickerFilterPopupProps) {
    const {translate} = useLocalize();
    const onChange = (selectedDates: SearchDateValues) => {
        const dateFormValues: Record<string, string | undefined> = {};
        dateFormValues[`${filterKey}On`] = selectedDates[CONST.SEARCH.DATE_MODIFIERS.ON];
        dateFormValues[`${filterKey}After`] = selectedDates[CONST.SEARCH.DATE_MODIFIERS.AFTER];
        dateFormValues[`${filterKey}Before`] = selectedDates[CONST.SEARCH.DATE_MODIFIERS.BEFORE];
        updateFilterForm(dateFormValues as Partial<SearchAdvancedFiltersForm>);
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
}

type MultiSelectFilterPopupProps<T extends string> = PopoverComponentProps & {
    translationKey: TranslationPaths;
    items: Array<MultiSelectItem<T>>;
    value: Array<MultiSelectItem<T>>;
    onChangeCallback: (selectedItems: Array<MultiSelectItem<T>>) => void;
    isSearchable?: boolean;
};

function MultiSelectFilterPopup<T extends string>({closeOverlay, translationKey, items, value, onChangeCallback, isSearchable}: MultiSelectFilterPopupProps<T>) {
    const {translate} = useLocalize();
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
}

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
    // type, groupBy, status, and view values are not guaranteed to respect the ts type as they come from user input
    const {type: unsafeType, groupBy: unsafeGroupBy, status: unsafeStatus, view: unsafeView, flatFilters} = queryJSON;
    const [selectedIOUReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${currentSelectedReportID}`, {canBeMissing: true});
    const isCurrentSelectedExpenseReport = isExpenseReport(currentSelectedReportID);
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const kycWallRef = useContext(KYCWallContext);

    const {isOffline} = useNetwork();
    const personalDetails = usePersonalDetails();
    const filterFormValues = useFilterFormValues(queryJSON);
    const {shouldUseNarrowLayout, isLargeScreenWidth} = useResponsiveLayout();
    const {selectedTransactions, selectAllMatchingItems, areAllMatchingItemsSelected, showSelectAllMatchingItems, shouldShowFiltersBarLoading, currentSearchResults} = useSearchContext();
    const {currencyList} = useCurrencyListState();
    const {getCurrencySymbol} = useCurrencyListActions();

    const [email] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true, selector: emailSelector});
    const [personalAndWorkspaceCards] = useOnyx(ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST, {canBeMissing: true});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [hasMultipleOutputCurrency] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: hasMultipleOutputCurrenciesSelector, canBeMissing: true});
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER, {canBeMissing: true});
    const feedKeysWithCards = useFeedKeysWithAssignedCards();
    const {isAccountLocked, showLockedAccountModal} = useContext(LockedAccountContext);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Filter', 'Columns']);
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();

    const {typeFiltersKeys, workspaces, shouldShowWorkspaceSearchInput} = useAdvancedSearchFilters();

    const shouldDisplayWorkspaceFilter = workspaces.some((section) => section.data.length > 1);

    const workspaceOptions: Array<MultiSelectItem<string>> = workspaces
        .flatMap((section) => section.data)
        .filter((workspace): workspace is typeof workspace & {policyID: string; icons: Icon[]} => !!workspace.policyID && !!workspace.icons)
        .map((workspace) => ({
            text: workspace.text,
            value: workspace.policyID,
            icons: workspace.icons,
        }));

    const selectedTransactionsKeys = Object.keys(selectedTransactions ?? {});

    // Get selected workspace options from filterFormValues or queryJSON
    const selectedWorkspaceOptions = (() => {
        const policyIDs = searchAdvancedFiltersForm.policyID ?? queryJSON.policyID;
        if (!policyIDs) {
            return [];
        }
        const normalizedIDs = Array.isArray(policyIDs) ? policyIDs : [policyIDs];
        return workspaceOptions.filter((option) => normalizedIDs.includes(option.value));
    })();

    const hasErrors = Object.keys(currentSearchResults?.errors ?? {}).length > 0 && !isOffline;
    const shouldShowSelectedDropdown = headerButtonsOptions.length > 0 && (!shouldUseNarrowLayout || isMobileSelectionModeEnabled);

    const typeOptions = getTypeOptions(translate, allPolicies, email);
    const type = typeOptions.find((option) => option.value === unsafeType) ?? null;

    const isExpenseReportType = type?.value === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;

    const selectedItemsCount = (() => {
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
    })();

    const groupByOptions = getGroupByOptions(translate);
    const groupBy = groupByOptions.find((option) => option.value === unsafeGroupBy) ?? null;

    const viewOptions = getViewOptions(translate);
    const viewValue = viewOptions.find((option) => option.value === unsafeView) ?? viewOptions.at(0) ?? null;

    const groupCurrencyOptions = getGroupCurrencyOptions(currencyList, getCurrencySymbol);
    const groupCurrency = groupCurrencyOptions.find((option) => option.value === searchAdvancedFiltersForm.groupCurrency) ?? null;

    const feedFilterValues = flatFilters.find((filter) => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED)?.filters?.map((filter) => filter.value);
    const feedOptions = getFeedOptions(allFeeds, personalAndWorkspaceCards, translate, feedKeysWithCards);
    const feed = feedFilterValues ? feedOptions.filter((option) => feedFilterValues.includes(option.value)) : [];

    const statusOptions = type ? getStatusOptions(translate, type.value) : [];
    const status = [
        Array.isArray(unsafeStatus) ? statusOptions.filter((option) => unsafeStatus.includes(option.value)) : (statusOptions.find((option) => option.value === unsafeStatus) ?? []),
    ].flat();

    const hasFilterValues = flatFilters.find((filter) => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS)?.filters?.map((filter) => filter.value);
    const hasOptions = getHasOptions(translate, type?.value ?? CONST.SEARCH.DATA_TYPES.EXPENSE);
    const has = hasFilterValues ? hasOptions.filter((option) => hasFilterValues.includes(option.value)) : [];

    const isFilterValues = flatFilters.find((filter) => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.IS)?.filters?.map((filter) => filter.value);
    const isOptions = Object.values(CONST.SEARCH.IS_VALUES).map((value) => ({text: translate(`common.${value}`), value}));
    const is = isFilterValues ? isOptions.filter((option) => isFilterValues.includes(option.value)) : [];

    const createDateDisplayValue = (filterValues: {on?: string; after?: string; before?: string}): [SearchDateValues, string[]] => {
        const value: SearchDateValues = {
            [CONST.SEARCH.DATE_MODIFIERS.ON]: filterValues.on,
            [CONST.SEARCH.DATE_MODIFIERS.AFTER]: filterValues.after,
            [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: filterValues.before,
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
    };

    const [date, displayDate] = createDateDisplayValue({
        on: searchAdvancedFiltersForm.dateOn,
        after: searchAdvancedFiltersForm.dateAfter,
        before: searchAdvancedFiltersForm.dateBefore,
    });

    const [posted, displayPosted] = createDateDisplayValue({
        on: searchAdvancedFiltersForm.postedOn,
        after: searchAdvancedFiltersForm.postedAfter,
        before: searchAdvancedFiltersForm.postedBefore,
    });

    const [withdrawn, displayWithdrawn] = createDateDisplayValue({
        on: searchAdvancedFiltersForm.withdrawnOn,
        after: searchAdvancedFiltersForm.withdrawnAfter,
        before: searchAdvancedFiltersForm.withdrawnBefore,
    });

    const withdrawalTypeOptions = getWithdrawalTypeOptions(translate);
    const withdrawalType = withdrawalTypeOptions.find((option) => option.value === searchAdvancedFiltersForm.withdrawalType) ?? null;
    const activeAdminPolicies = useSortedActiveAdminPolicies();

    const updateFilterForm = (values: Partial<SearchAdvancedFiltersForm>) => {
        const updatedFilterFormValues: Partial<SearchAdvancedFiltersForm> = {
            ...searchAdvancedFiltersForm,
            ...values,
        };

        // If the type has changed, reset the status so we dont have an invalid status selected
        if (updatedFilterFormValues.type !== searchAdvancedFiltersForm.type) {
            updatedFilterFormValues.columns = [];
            updatedFilterFormValues.status = CONST.SEARCH.STATUS.EXPENSE.ALL;
            // Filter out invalid "has" values for the new type
            updatedFilterFormValues.has = filterValidHasValues(updatedFilterFormValues.has, updatedFilterFormValues.type, translate);
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
    };

    const openAdvancedFilters = () => {
        updateAdvancedFilters(filterFormValues);
        Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    };

    const openSearchColumns = () => {
        Navigation.navigate(ROUTES.SEARCH_COLUMNS);
    };

    const typeComponent = ({closeOverlay}: PopoverComponentProps) => (
        <SingleSelectPopup
            label={translate('common.type')}
            value={type}
            items={typeOptions}
            closeOverlay={closeOverlay}
            onChange={(item) => updateFilterForm({type: item?.value ?? CONST.SEARCH.DATA_TYPES.EXPENSE})}
        />
    );

    const groupByComponent = ({closeOverlay}: PopoverComponentProps) => (
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

    const viewComponent = ({closeOverlay}: PopoverComponentProps) => (
        <SingleSelectPopup
            label={translate('search.view.label')}
            items={viewOptions}
            value={viewValue}
            closeOverlay={closeOverlay}
            onChange={(item) => updateFilterForm({view: item?.value ?? CONST.SEARCH.VIEW.TABLE})}
        />
    );

    const groupCurrencyComponent = ({closeOverlay}: PopoverComponentProps) => (
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

    const updateFeedFilterForm = (items: Array<MultiSelectItem<string>>) => {
        updateFilterForm({feed: items.map((item) => item.value)});
    };
    const feedComponent = (props: PopoverComponentProps) => (
        <MultiSelectFilterPopup
            closeOverlay={props.closeOverlay}
            translationKey="search.filters.feed"
            items={feedOptions}
            value={feed}
            onChangeCallback={updateFeedFilterForm}
        />
    );

    const datePickerComponent = (props: PopoverComponentProps) => (
        <DatePickerFilterPopup
            closeOverlay={props.closeOverlay}
            filterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE}
            value={date}
            translationKey="common.date"
            updateFilterForm={updateFilterForm}
        />
    );

    const postedPickerComponent = (props: PopoverComponentProps) => (
        <DatePickerFilterPopup
            closeOverlay={props.closeOverlay}
            filterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED}
            value={posted}
            translationKey="search.filters.posted"
            updateFilterForm={updateFilterForm}
        />
    );

    const withdrawnPickerComponent = (props: PopoverComponentProps) => (
        <DatePickerFilterPopup
            closeOverlay={props.closeOverlay}
            filterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN}
            value={withdrawn}
            translationKey="search.filters.withdrawn"
            updateFilterForm={updateFilterForm}
        />
    );

    const withdrawalTypeComponent = ({closeOverlay}: PopoverComponentProps) => (
        <SingleSelectPopup
            label={translate('search.withdrawalType')}
            items={withdrawalTypeOptions}
            value={withdrawalType}
            closeOverlay={closeOverlay}
            onChange={(item) => updateFilterForm({withdrawalType: item?.value})}
        />
    );

    const updateStatusFilterForm = (selectedItems: Array<MultiSelectItem<SingularSearchStatus>>) => {
        const newStatus = selectedItems.length ? selectedItems.map((i) => i.value) : CONST.SEARCH.STATUS.EXPENSE.ALL;
        updateFilterForm({status: newStatus});
    };
    const statusComponent = (props: PopoverComponentProps) => (
        <MultiSelectFilterPopup
            closeOverlay={props.closeOverlay}
            translationKey="common.status"
            items={statusOptions}
            value={status}
            onChangeCallback={updateStatusFilterForm}
        />
    );

    const updateHasFilterForm = (selectedItems: Array<MultiSelectItem<string>>) => {
        updateFilterForm({has: selectedItems.map((item) => item.value)});
    };
    const hasComponent = (props: PopoverComponentProps) => (
        <MultiSelectFilterPopup
            closeOverlay={props.closeOverlay}
            translationKey="search.has"
            items={hasOptions}
            value={has}
            onChangeCallback={updateHasFilterForm}
        />
    );

    const updateIsFilterForm = (selectedItems: Array<MultiSelectItem<string>>) => {
        updateFilterForm({is: selectedItems.map((item) => item.value)});
    };
    const isComponent = (props: PopoverComponentProps) => (
        <MultiSelectFilterPopup
            closeOverlay={props.closeOverlay}
            translationKey="search.filters.is"
            items={isOptions}
            value={is}
            onChangeCallback={updateIsFilterForm}
        />
    );

    const userPickerComponent = ({closeOverlay}: PopoverComponentProps) => {
        const value = searchAdvancedFiltersForm.from ?? [];

        return (
            <UserSelectPopup
                value={value}
                closeOverlay={closeOverlay}
                onChange={(selectedUsers) => updateFilterForm({from: selectedUsers})}
            />
        );
    };

    const handleWorkspaceChange = (items: Array<MultiSelectItem<string>>) => {
        updateFilterForm({policyID: items.map((item) => item.value)});
    };

    const workspaceComponent = ({closeOverlay}: PopoverComponentProps) => (
        <MultiSelectPopup
            label={translate('workspace.common.workspace')}
            items={workspaceOptions}
            value={selectedWorkspaceOptions}
            closeOverlay={closeOverlay}
            onChange={handleWorkspaceChange}
            isSearchable={shouldShowWorkspaceSearchInput}
        />
    );

    const workspaceValue = selectedWorkspaceOptions.map((option) => option.text);

    /**
     * Builds the list of all filter chips to be displayed in the
     * filter bar
     */
    const fromValue = searchAdvancedFiltersForm.from?.map((currentAccountID) => getDisplayNameOrDefault(personalDetails?.[currentAccountID], currentAccountID, false)) ?? [];

    const shouldDisplayGroupByFilter = !!groupBy?.value;
    const shouldDisplayGroupCurrencyFilter = shouldDisplayGroupByFilter && hasMultipleOutputCurrency;
    const shouldDisplayFeedFilter = feedOptions.length > 1 && !!searchAdvancedFiltersForm.feed;
    const shouldDisplayPostedFilter =
        !!searchAdvancedFiltersForm.feed && (!!searchAdvancedFiltersForm.postedOn || !!searchAdvancedFiltersForm.postedAfter || !!searchAdvancedFiltersForm.postedBefore);
    const shouldDisplayWithdrawalTypeFilter = !!searchAdvancedFiltersForm.withdrawalType;
    const shouldDisplayWithdrawnFilter = !!searchAdvancedFiltersForm.withdrawnOn || !!searchAdvancedFiltersForm.withdrawnAfter || !!searchAdvancedFiltersForm.withdrawnBefore;

    const filters = [
        {
            label: translate('common.type'),
            PopoverComponent: typeComponent,
            value: type?.text ?? null,
            filterKey: FILTER_KEYS.TYPE,
            sentryLabel: CONST.SENTRY_LABEL.SEARCH.FILTER_TYPE,
        },
        ...(shouldDisplayGroupByFilter
            ? [
                  {
                      label: translate('search.groupBy'),
                      PopoverComponent: groupByComponent,
                      value: groupBy?.text ?? null,
                      filterKey: FILTER_KEYS.GROUP_BY,
                      sentryLabel: CONST.SENTRY_LABEL.SEARCH.FILTER_GROUP_BY,
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
                      sentryLabel: CONST.SENTRY_LABEL.SEARCH.FILTER_GROUP_CURRENCY,
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
                      sentryLabel: CONST.SENTRY_LABEL.SEARCH.FILTER_FEED,
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
                      sentryLabel: CONST.SENTRY_LABEL.SEARCH.FILTER_POSTED,
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
                      sentryLabel: CONST.SENTRY_LABEL.SEARCH.FILTER_WITHDRAWAL_TYPE,
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
                      sentryLabel: CONST.SENTRY_LABEL.SEARCH.FILTER_WITHDRAWN,
                  },
              ]
            : []),
        {
            label: translate('common.status'),
            PopoverComponent: statusComponent,
            value: status.map((option) => option.text),
            filterKey: FILTER_KEYS.STATUS,
            sentryLabel: CONST.SENTRY_LABEL.SEARCH.FILTER_STATUS,
        },
        ...(type?.value === CONST.SEARCH.DATA_TYPES.CHAT
            ? [
                  {
                      label: translate('search.has'),
                      PopoverComponent: hasComponent,
                      value: has.map((option) => option.text),
                      filterKey: FILTER_KEYS.HAS,
                      sentryLabel: CONST.SENTRY_LABEL.SEARCH.FILTER_HAS,
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
                      sentryLabel: CONST.SENTRY_LABEL.SEARCH.FILTER_IS,
                  },
              ]
            : []),
        {
            label: translate('common.date'),
            PopoverComponent: datePickerComponent,
            value: displayDate,
            filterKey: FILTER_KEYS.DATE_ON,
            sentryLabel: CONST.SENTRY_LABEL.SEARCH.FILTER_DATE,
        },
        {
            label: translate('common.from'),
            PopoverComponent: userPickerComponent,
            value: fromValue,
            filterKey: FILTER_KEYS.FROM,
            sentryLabel: CONST.SENTRY_LABEL.SEARCH.FILTER_FROM,
        },
        ...(shouldDisplayWorkspaceFilter
            ? [
                  {
                      label: translate('workspace.common.workspace'),
                      PopoverComponent: workspaceComponent,
                      value: workspaceValue,
                      filterKey: FILTER_KEYS.POLICY_ID,
                      sentryLabel: CONST.SENTRY_LABEL.SEARCH.FILTER_WORKSPACE,
                  },
              ]
            : []),
        ...(shouldDisplayGroupByFilter
            ? [
                  {
                      label: translate('search.view.label'),
                      PopoverComponent: viewComponent,
                      value: viewValue?.text ?? null,
                      filterKey: FILTER_KEYS.VIEW,
                      sentryLabel: CONST.SENTRY_LABEL.SEARCH.FILTER_VIEW,
                  },
              ]
            : []),
    ].filter((filterItem) => isFilterSupported(filterItem.filterKey, type?.value ?? CONST.SEARCH.DATA_TYPES.EXPENSE));

    const hiddenSelectedFilters = (() => {
        const advancedSearchFiltersKeys = typeFiltersKeys.flat();
        const exposedFiltersKeys = new Set<string>(
            filters.flatMap((filter) => {
                const dateFilterKey = DATE_FILTER_KEYS.find((key) => filter.filterKey.startsWith(key));
                if (dateFilterKey) {
                    return dateFilterKey;
                }
                return filter.filterKey;
            }),
        );

        const hiddenFilters = advancedSearchFiltersKeys.filter((key) => !exposedFiltersKeys.has(key));
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
    })();

    const adjustScroll = (info: {distanceFromEnd: number}) => {
        // Workaround for a known React Native bug on Android (https://github.com/facebook/react-native/issues/27504):
        // When the FlatList is scrolled to the end and the last item is deleted, a blank space is left behind.
        // To fix this, we detect when onEndReached is triggered due to an item deletion,
        // and programmatically scroll to the end to fill the space.
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (!shouldAdjustScroll || info.distanceFromEnd > 0) {
            return;
        }
        scrollRef.current?.scrollToEnd();
    };

    const renderFilterItem = ({item}: {item: FilterItem}) => (
        <DropdownButton
            label={item.label}
            value={item.value}
            PopoverComponent={item.PopoverComponent}
            sentryLabel={item.sentryLabel}
        />
    );

    const shouldShowColumnsButton = isLargeScreenWidth && (queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE || queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT);

    const filterButtonText = translate('search.filtersHeader') + (hiddenSelectedFilters.length > 0 ? ` (${hiddenSelectedFilters.length})` : '');

    const renderListFooter = () => (
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
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.ADVANCED_FILTERS_BUTTON}
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
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.COLUMNS_BUTTON}
                />
            )}
        </View>
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
                        isCurrentSelectedExpenseReport ? ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({policyID: currentSelectedPolicyID, backTo: Navigation.getActiveRoute()}) : undefined
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
                                sentryLabel={CONST.SENTRY_LABEL.SEARCH.BULK_ACTIONS_DROPDOWN}
                            />
                            {!areAllMatchingItemsSelected && showSelectAllMatchingItems && (
                                <Button
                                    link
                                    small
                                    shouldUseDefaultHover={false}
                                    innerStyles={styles.p0}
                                    onPress={() => selectAllMatchingItems(true)}
                                    text={translate('search.exportAll.selectAllMatchingItems')}
                                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.SELECT_ALL_MATCHING_BUTTON}
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
