import React from 'react';
import type {ReactNode} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/DropdownButton';
import type {MultiSelectItem} from '@components/Search/FilterDropdowns/MultiSelectPopup';
import MultiSelectPopup from '@components/Search/FilterDropdowns/MultiSelectPopup';
import SingleSelectPopup from '@components/Search/FilterDropdowns/SingleSelectPopup';
import UserSelectPopup from '@components/Search/FilterDropdowns/UserSelectPopup';
import {useSearchStateContext} from '@components/Search/SearchContext';
import {filterFeedSelector, filterGroupCurrencySelector, filterPolicyIDSelector} from '@components/Search/selectors/Search';
import type {SearchDateFilterKeys, SearchQueryJSON, SingularSearchStatus} from '@components/Search/types';
import useAdvancedSearchFilters from '@hooks/useAdvancedSearchFilters';
import {useCurrencyListActions, useCurrencyListState} from '@hooks/useCurrencyList';
import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {close} from '@libs/actions/Modal';
import Navigation from '@libs/Navigation/Navigation';
import {buildFilterQueryWithSortDefaults} from '@libs/SearchQueryUtils';
import {filterValidHasValues, getFeedOptions, getGroupCurrencyOptions, getHasOptions, getStatusOptions, getWithdrawalTypeOptions, mapFiltersFormToLabelValueList} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';
import type {HasFilterValue, IsFilterValue} from '@src/types/form/SearchAdvancedFiltersForm';
import type {Policy} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import DatePickerFilterPopup from './DatePickerFilterPopup';
import MultiSelectFilterPopup from './MultiSelectFilterPopup';

type FilterItem = WithSentryLabel & {
    PopoverComponent: (props: PopoverComponentProps) => ReactNode;
};

type UseSearchActionsBarResult = {
    filters: Array<SearchFilter & FilterItem>;
    hasErrors: boolean;
    shouldShowActionsBarLoading: boolean;
    shouldShowSelectedDropdown: boolean;
    queryJSON: SearchQueryJSON;
    styles: ReturnType<typeof useThemeStyles>;
    translate: ReturnType<typeof useLocalize>['translate'];
};

type FilterBarPopupProps = PopoverComponentProps & {
    updateFilterForm: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

/**
 * Extracts only the fields needed by getTypeOptions (canSendInvoice check).
 * Strips heavyweight fields like customUnits, connections, taxRates, fieldList, rules, exportLayouts.
 */
function typeOptionsPoliciesSelector(policies: OnyxCollection<Policy>): OnyxCollection<Policy> {
    if (!policies) {
        return policies;
    }
    const result: OnyxCollection<Policy> = {};
    for (const [key, policy] of Object.entries(policies)) {
        if (!policy) {
            continue;
        }
        result[key] = {
            id: policy.id,
            name: policy.name,
            type: policy.type,
            role: policy.role,
            employeeList: policy.employeeList,
            pendingAction: policy.pendingAction,
            errors: policy.errors,
            areInvoicesEnabled: policy.areInvoicesEnabled,
            isJoinRequestPending: policy.isJoinRequestPending,
            owner: policy.owner,
        } as Policy;
    }
    return result;
}

function GroupCurrencyPopup({updateFilterForm, closeOverlay}: FilterBarPopupProps) {
    const {translate} = useLocalize();
    const {currencyList} = useCurrencyListState();
    const {getCurrencySymbol} = useCurrencyListActions();
    const groupCurrencyOptions = getGroupCurrencyOptions(currencyList, getCurrencySymbol);
    const [groupCurrency] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: filterGroupCurrencySelector});

    const groupCurrencyValue = groupCurrencyOptions.find((option) => option.value === groupCurrency) ?? null;

    return (
        <SingleSelectPopup
            label={translate('common.groupCurrency')}
            items={groupCurrencyOptions}
            value={groupCurrencyValue}
            closeOverlay={closeOverlay}
            onChange={(item) => updateFilterForm({groupCurrency: item?.value})}
            isSearchable
            searchPlaceholder={translate('common.groupCurrency')}
        />
    );
}

function FeedPopup({updateFilterForm, closeOverlay}: FilterBarPopupProps) {
    const {translate, localeCompare} = useLocalize();
    const feedKeysWithCards = useFeedKeysWithAssignedCards();
    const [feed] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: filterFeedSelector});
    const [personalAndWorkspaceCards] = useOnyx(ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST);
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);

    const updateFeedFilterForm = (items: Array<MultiSelectItem<string>>) => {
        updateFilterForm({feed: items.map((item) => item.value)});
    };
    const feedOptions = getFeedOptions(allFeeds, personalAndWorkspaceCards, translate, localeCompare, feedKeysWithCards);
    const feedValue = feed ? feedOptions.filter((option) => feed.includes(option.value)) : [];

    return (
        <MultiSelectFilterPopup
            closeOverlay={closeOverlay}
            translationKey="search.filters.feed"
            items={feedOptions}
            value={feedValue}
            onChangeCallback={updateFeedFilterForm}
        />
    );
}

function WorkspacePopup({policyIDQuery, updateFilterForm, closeOverlay}: FilterBarPopupProps & {policyIDQuery: string[] | undefined}) {
    const {translate} = useLocalize();
    const {workspaces, shouldShowWorkspaceSearchInput} = useAdvancedSearchFilters();
    const [policyID] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: filterPolicyIDSelector});
    const workspaceOptions: Array<MultiSelectItem<string>> = workspaces
        .flatMap((section) => section.data)
        .filter((workspace): workspace is typeof workspace & {policyID: string; icons: Icon[]} => !!workspace.policyID && !!workspace.icons)
        .map((workspace) => ({
            text: workspace.text,
            value: workspace.policyID,
            icons: workspace.icons,
        }));

    const policyIDs = policyID ?? policyIDQuery;
    const selectedWorkspaceOptions = policyIDs ? workspaceOptions.filter((option) => (Array.isArray(policyIDs) ? policyIDs : [policyIDs]).includes(option.value)) : [];

    const handleWorkspaceChange = (items: Array<MultiSelectItem<string>>) => {
        updateFilterForm({policyID: items.map((item) => item.value)});
    };

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
}

function makeDateFilterItem(
    filterKey: SearchDateFilterKeys,
    translationKey: TranslationPaths,
    sentryLabel: string,
    on: string | undefined,
    after: string | undefined,
    before: string | undefined,
    updateFilterForm: (v: Partial<SearchAdvancedFiltersForm>) => void,
): FilterItem {
    const value = {
        [CONST.SEARCH.DATE_MODIFIERS.ON]: on,
        [CONST.SEARCH.DATE_MODIFIERS.AFTER]: after,
        [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: before,
    };
    return {
        PopoverComponent: (props) => (
            <DatePickerFilterPopup
                closeOverlay={props.closeOverlay}
                filterKey={filterKey}
                value={value}
                translationKey={translationKey}
                updateFilterForm={updateFilterForm}
            />
        ),
        sentryLabel,
    };
}

function useSearchActionsBar(queryJSON: SearchQueryJSON, isMobileSelectionModeEnabled: boolean): UseSearchActionsBarResult {
    const [searchAdvancedFiltersForm = getEmptyObject<Partial<SearchAdvancedFiltersForm>>()] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const type = queryJSON.type;
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {selectedTransactions, shouldShowActionsBarLoading, currentSearchResults} = useSearchStateContext();

    const selectedTransactionsKeys = Object.keys(selectedTransactions ?? {});

    const hasErrors = Object.keys(currentSearchResults?.errors ?? {}).length > 0 && !isOffline;
    const hasSelectedItems = selectedTransactionsKeys.length > 0;
    const shouldShowSelectedDropdown = hasSelectedItems && (!shouldUseNarrowLayout || isMobileSelectionModeEnabled);

    const updateFilterForm = (values: Partial<SearchAdvancedFiltersForm>) => {
        const updatedFilterFormValues: Partial<SearchAdvancedFiltersForm> = {
            ...searchAdvancedFiltersForm,
            ...values,
        };

        if (updatedFilterFormValues.type !== searchAdvancedFiltersForm.type) {
            updatedFilterFormValues.columns = [];
            updatedFilterFormValues.status = CONST.SEARCH.STATUS.EXPENSE.ALL;
            updatedFilterFormValues.has = filterValidHasValues(updatedFilterFormValues.has, updatedFilterFormValues.type, translate);
        }

        if (updatedFilterFormValues.groupBy !== searchAdvancedFiltersForm.groupBy) {
            updatedFilterFormValues.columns = [];
        }

        const queryString =
            buildFilterQueryWithSortDefaults(
                updatedFilterFormValues,
                {view: searchAdvancedFiltersForm.view, groupBy: searchAdvancedFiltersForm.groupBy},
                {sortBy: queryJSON.sortBy, sortOrder: queryJSON.sortOrder, limit: queryJSON.limit},
            ) ?? '';
        if (!queryString) {
            return;
        }

        close(() => {
            Navigation.setParams({q: queryString, rawQuery: undefined});
        });
    };

    const filters = mapFiltersFormToLabelValueList<FilterItem>(searchAdvancedFiltersForm, queryJSON.policyID, translate, (filterKey) => {
        switch (filterKey) {
            case FILTER_KEYS.GROUP_CURRENCY:
                return {
                    PopoverComponent: ({closeOverlay}) => (
                        <GroupCurrencyPopup
                            updateFilterForm={updateFilterForm}
                            closeOverlay={closeOverlay}
                        />
                    ),
                    sentryLabel: CONST.SENTRY_LABEL.SEARCH.FILTER_GROUP_CURRENCY,
                };
            case FILTER_KEYS.HAS: {
                const hasFilterValues = searchAdvancedFiltersForm[filterKey];
                const hasOptions = getHasOptions(translate, type);
                const has = hasFilterValues ? hasOptions.filter((option) => hasFilterValues.includes(option.value)) : [];
                const updateHasFilterForm = (selectedItems: Array<MultiSelectItem<HasFilterValue>>) => {
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
                return {PopoverComponent: hasComponent, sentryLabel: CONST.SENTRY_LABEL.SEARCH.FILTER_HAS};
            }
            case FILTER_KEYS.IS: {
                const isFilterValues = searchAdvancedFiltersForm[filterKey];
                const isOptions = Object.values(CONST.SEARCH.IS_VALUES).map((value) => ({text: translate(`common.${value}`), value}));
                const is = isFilterValues ? isOptions.filter((option) => isFilterValues.includes(option.value)) : [];
                const updateIsFilterForm = (selectedItems: Array<MultiSelectItem<IsFilterValue>>) => {
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
                return {PopoverComponent: isComponent, sentryLabel: CONST.SENTRY_LABEL.SEARCH.FILTER_IS};
            }
            case FILTER_KEYS.FEED: {
                return {
                    PopoverComponent: ({closeOverlay}) => (
                        <FeedPopup
                            updateFilterForm={updateFilterForm}
                            closeOverlay={closeOverlay}
                        />
                    ),
                    sentryLabel: CONST.SENTRY_LABEL.SEARCH.FILTER_FEED,
                };
            }
            case FILTER_KEYS.POSTED_ON:
            case FILTER_KEYS.POSTED_AFTER:
            case FILTER_KEYS.POSTED_BEFORE:
                return makeDateFilterItem(
                    CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED,
                    'search.filters.posted',
                    CONST.SENTRY_LABEL.SEARCH.FILTER_POSTED,
                    searchAdvancedFiltersForm.postedOn,
                    searchAdvancedFiltersForm.postedAfter,
                    searchAdvancedFiltersForm.postedBefore,
                    updateFilterForm,
                );
            case FILTER_KEYS.WITHDRAWAL_TYPE: {
                const withdrawalType = searchAdvancedFiltersForm[filterKey];
                const withdrawalTypeOptions = getWithdrawalTypeOptions(translate);
                const withdrawalTypeValue = withdrawalTypeOptions.find((option) => option.value === withdrawalType) ?? null;
                const withdrawalTypeComponent = ({closeOverlay}: PopoverComponentProps) => (
                    <SingleSelectPopup
                        label={translate('search.withdrawalType')}
                        items={withdrawalTypeOptions}
                        value={withdrawalTypeValue}
                        closeOverlay={closeOverlay}
                        onChange={(item) => updateFilterForm({withdrawalType: item?.value})}
                    />
                );
                return {PopoverComponent: withdrawalTypeComponent, sentryLabel: CONST.SENTRY_LABEL.SEARCH.FILTER_WITHDRAWAL_TYPE};
            }
            case FILTER_KEYS.WITHDRAWN_ON:
            case FILTER_KEYS.WITHDRAWN_AFTER:
            case FILTER_KEYS.WITHDRAWN_BEFORE:
                return makeDateFilterItem(
                    CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN,
                    'search.filters.withdrawn',
                    CONST.SENTRY_LABEL.SEARCH.FILTER_WITHDRAWN,
                    searchAdvancedFiltersForm.withdrawnOn,
                    searchAdvancedFiltersForm.withdrawnAfter,
                    searchAdvancedFiltersForm.withdrawnBefore,
                    updateFilterForm,
                );
            case FILTER_KEYS.STATUS: {
                const status = searchAdvancedFiltersForm[filterKey];
                const statusOptions = type ? getStatusOptions(translate, type) : [];
                const statusValue = statusOptions.filter((option) => status?.includes(option.value));
                const updateStatusFilterForm = (selectedItems: Array<MultiSelectItem<SingularSearchStatus>>) => {
                    const newStatus = selectedItems.length ? selectedItems.map((i) => i.value) : CONST.SEARCH.STATUS.EXPENSE.ALL;
                    updateFilterForm({status: newStatus});
                };
                const statusComponent = (props: PopoverComponentProps) => (
                    <MultiSelectFilterPopup
                        closeOverlay={props.closeOverlay}
                        translationKey="common.status"
                        items={statusOptions}
                        value={statusValue}
                        onChangeCallback={updateStatusFilterForm}
                    />
                );
                return {PopoverComponent: statusComponent, sentryLabel: CONST.SENTRY_LABEL.SEARCH.FILTER_STATUS};
            }
            case FILTER_KEYS.DATE_ON:
            case FILTER_KEYS.DATE_AFTER:
            case FILTER_KEYS.DATE_BEFORE:
                return makeDateFilterItem(
                    CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
                    'common.date',
                    CONST.SENTRY_LABEL.SEARCH.FILTER_DATE,
                    searchAdvancedFiltersForm.dateOn,
                    searchAdvancedFiltersForm.dateAfter,
                    searchAdvancedFiltersForm.dateBefore,
                    updateFilterForm,
                );
            case FILTER_KEYS.FROM: {
                const from = searchAdvancedFiltersForm[filterKey];
                const userPickerComponent = ({closeOverlay}: PopoverComponentProps) => (
                    <UserSelectPopup
                        value={from ?? []}
                        closeOverlay={closeOverlay}
                        onChange={(selectedUsers) => updateFilterForm({from: selectedUsers})}
                    />
                );
                return {PopoverComponent: userPickerComponent, sentryLabel: CONST.SENTRY_LABEL.SEARCH.FILTER_FROM};
            }
            case FILTER_KEYS.POLICY_ID:
                return {
                    PopoverComponent: ({closeOverlay}) => (
                        <WorkspacePopup
                            policyIDQuery={queryJSON.policyID}
                            updateFilterForm={updateFilterForm}
                            closeOverlay={closeOverlay}
                        />
                    ),
                    sentryLabel: CONST.SENTRY_LABEL.SEARCH.FILTER_WORKSPACE,
                };
            default:
                // This should be unreachable
                return {PopoverComponent: () => null};
        }
    });

    return {
        filters,
        hasErrors,
        shouldShowActionsBarLoading,
        shouldShowSelectedDropdown,
        queryJSON,
        styles,
        translate,
    };
}

export default useSearchActionsBar;
export type {FilterItem};
export {typeOptionsPoliciesSelector};
