import React from 'react';
import type {ReactNode} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import AmountPopup from '@components/Search/FilterDropdowns/AmountPopup';
import CardSelectPopup from '@components/Search/FilterDropdowns/CardSelectPopup';
import CategorySelectPopup from '@components/Search/FilterDropdowns/CategorySelectPopup';
import CurrencySelectPopup from '@components/Search/FilterDropdowns/CurrencySelectPopup';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/DropdownButton';
import ExportedToSelectPopup from '@components/Search/FilterDropdowns/ExportedToSelectPopup';
import FeedFilterPopup from '@components/Search/FilterDropdowns/FeedSelectPopup';
import InSelectPopup from '@components/Search/FilterDropdowns/InSelectPopup';
import ReportFieldPopup from '@components/Search/FilterDropdowns/ReportFieldPopup';
import SingleSelectPopup from '@components/Search/FilterDropdowns/SingleSelectPopup';
import TagSelectPopup from '@components/Search/FilterDropdowns/TagSelectPopup';
import TaxRateSelectPopup from '@components/Search/FilterDropdowns/TaxRateSelectPopup';
import TextInputPopup from '@components/Search/FilterDropdowns/TextInputPopup';
import UserSelectPopup from '@components/Search/FilterDropdowns/UserSelectPopup';
import WorkspaceSelectPopup from '@components/Search/FilterDropdowns/WorkspaceSelectPopup';
import {useSearchStateContext} from '@components/Search/SearchContext';
import type {ReportFieldKey, SearchAmountFilterKeys, SearchDateFilterKeys, SearchFilterKey, SearchQueryJSON} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {close} from '@libs/actions/Modal';
import Navigation from '@libs/Navigation/Navigation';
import {buildFilterQueryWithSortDefaults, isAmountFilterKey} from '@libs/SearchQueryUtils';
import {FILTER_GROUP_MAP, FILTER_LABEL_MAP, filterValidHasValues, getMultiSelectFilterOptions, getSingleSelectFilterOptions, mapFiltersFormToLabelValueList} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';
import type {ExpenseTypeValues, HasFilterValues, IsFilterValues, SearchAdvancedFiltersKey} from '@src/types/form/SearchAdvancedFiltersForm';
import type {Policy} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import DatePickerFilterPopup from './DatePickerFilterPopup';
import MultiSelectFilterPopup from './MultiSelectFilterPopup';

type FilterItem = WithSentryLabel & {
    PopoverComponent: (props: PopoverComponentProps) => ReactNode;
};

type UseSearchFiltersBarResult = {
    filters: Array<SearchFilter & FilterItem>;
    hasErrors: boolean;
    shouldShowFiltersBarLoading: boolean;
    queryJSON: SearchQueryJSON;
    styles: ReturnType<typeof useThemeStyles>;
    translate: ReturnType<typeof useLocalize>['translate'];
};

const SKIPPED_FILTERS = new Set<SearchAdvancedFiltersKey>([
    FILTER_KEYS.GROUP_BY,
    FILTER_KEYS.GROUP_CURRENCY,
    FILTER_KEYS.LIMIT,
    FILTER_KEYS.TYPE,
    FILTER_KEYS.VIEW,
    FILTER_KEYS.PAYER,
    FILTER_KEYS.ACTION,
]);

function getFilterSentryLabel(filterKey: SearchAdvancedFiltersKey | SearchFilterKey | ReportFieldKey) {
    return `Search-Filter-${filterKey}`;
}

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

function makeDateFilterItem(
    filterKey: SearchDateFilterKeys,
    translationKey: TranslationPaths,
    searchAdvancedFiltersForm: Partial<SearchAdvancedFiltersForm>,
    updateFilterForm: (v: Partial<SearchAdvancedFiltersForm>) => void,
): FilterItem {
    const value = {
        [CONST.SEARCH.DATE_MODIFIERS.ON]: searchAdvancedFiltersForm[`${filterKey}${CONST.SEARCH.DATE_MODIFIERS.ON}`],
        [CONST.SEARCH.DATE_MODIFIERS.AFTER]: searchAdvancedFiltersForm[`${filterKey}${CONST.SEARCH.DATE_MODIFIERS.AFTER}`],
        [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: searchAdvancedFiltersForm[`${filterKey}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}`],
        [CONST.SEARCH.DATE_MODIFIERS.RANGE]: searchAdvancedFiltersForm[`${filterKey}${CONST.SEARCH.DATE_MODIFIERS.RANGE}`],
    };
    return {
        PopoverComponent: (props) => (
            <DatePickerFilterPopup
                isExpanded={props.isExpanded}
                closeOverlay={props.closeOverlay}
                setPopoverWidth={props.setPopoverWidth}
                filterKey={filterKey}
                value={value}
                translationKey={translationKey}
                updateFilterForm={updateFilterForm}
            />
        ),
        sentryLabel: getFilterSentryLabel(filterKey),
    };
}

function makeAmountFilterItem(
    filterKey: SearchAmountFilterKeys,
    label: string,
    searchAdvancedFiltersForm: Partial<SearchAdvancedFiltersForm>,
    updateFilterForm: (v: Partial<SearchAdvancedFiltersForm>) => void,
): FilterItem {
    const value = {
        [CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO]: searchAdvancedFiltersForm[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO}`],
        [CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN]: searchAdvancedFiltersForm[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}`],
        [CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN]: searchAdvancedFiltersForm[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}`],
    };
    return {
        PopoverComponent: (props) => (
            <AmountPopup
                filterKey={filterKey}
                value={value}
                closeOverlay={props.closeOverlay}
                label={label}
                updateFilterForm={updateFilterForm}
            />
        ),
        sentryLabel: getFilterSentryLabel(filterKey),
    };
}

function useSearchFiltersBar(queryJSON: SearchQueryJSON): UseSearchFiltersBarResult {
    const [searchAdvancedFiltersForm = getEmptyObject<Partial<SearchAdvancedFiltersForm>>()] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const type = queryJSON.type;
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();

    const {isOffline} = useNetwork();
    const {shouldShowFiltersBarLoading, currentSearchResults} = useSearchStateContext();

    const hasErrors = Object.keys(currentSearchResults?.errors ?? {}).length > 0 && !isOffline;

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
                {sortBy: queryJSON.sortBy, sortOrder: queryJSON.sortOrder},
            ) ?? '';
        if (!queryString) {
            return;
        }

        close(() => {
            Navigation.setParams({q: queryString, rawQuery: undefined});
        });
    };

    const filters = mapFiltersFormToLabelValueList<FilterItem>(searchAdvancedFiltersForm, queryJSON.policyID, SKIPPED_FILTERS, translate, localeCompare, (filterKey) => {
        const groupConfig = FILTER_GROUP_MAP[filterKey];
        if (groupConfig) {
            if (isAmountFilterKey(groupConfig.syntax)) {
                return makeAmountFilterItem(groupConfig.syntax, translate(groupConfig.label), searchAdvancedFiltersForm, updateFilterForm);
            }
            return makeDateFilterItem(groupConfig.syntax, groupConfig.label, searchAdvancedFiltersForm, updateFilterForm);
        }

        if (filterKey.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)) {
            return {
                PopoverComponent: ({closeOverlay}) => (
                    <ReportFieldPopup
                        closeOverlay={closeOverlay}
                        updateFilterForm={updateFilterForm}
                    />
                ),
                sentryLabel: getFilterSentryLabel(filterKey),
            };
        }

        const label = FILTER_LABEL_MAP[filterKey];
        if (!label) {
            return {PopoverComponent: () => null};
        }

        switch (filterKey) {
            case FILTER_KEYS.IN:
            case FILTER_KEYS.TAX_RATE:
            case FILTER_KEYS.EXPORTED_TO:
            case FILTER_KEYS.TAG:
            case FILTER_KEYS.CATEGORY: {
                const PopupComponent = {
                    [FILTER_KEYS.TAX_RATE]: TaxRateSelectPopup,
                    [FILTER_KEYS.EXPORTED_TO]: ExportedToSelectPopup,
                    [FILTER_KEYS.TAG]: TagSelectPopup,
                    [FILTER_KEYS.CATEGORY]: CategorySelectPopup,
                    [FILTER_KEYS.IN]: InSelectPopup,
                }[filterKey];
                return {
                    PopoverComponent: ({closeOverlay}) => (
                        <PopupComponent
                            updateFilterForm={updateFilterForm}
                            closeOverlay={closeOverlay}
                        />
                    ),
                    sentryLabel: getFilterSentryLabel(filterKey),
                };
            }
            case FILTER_KEYS.CARD_ID: {
                return {
                    PopoverComponent: ({closeOverlay, isExpanded}) => (
                        <CardSelectPopup
                            isExpanded={isExpanded}
                            updateFilterForm={updateFilterForm}
                            closeOverlay={closeOverlay}
                        />
                    ),
                    sentryLabel: getFilterSentryLabel(filterKey),
                };
            }
            case FILTER_KEYS.FEED: {
                return {
                    PopoverComponent: ({closeOverlay, isExpanded}) => (
                        <FeedFilterPopup
                            isExpanded={isExpanded}
                            updateFilterForm={updateFilterForm}
                            closeOverlay={closeOverlay}
                        />
                    ),
                    sentryLabel: getFilterSentryLabel(filterKey),
                };
            }
            case FILTER_KEYS.MERCHANT:
            case FILTER_KEYS.DESCRIPTION:
            case FILTER_KEYS.REPORT_ID:
            case FILTER_KEYS.KEYWORD:
            case FILTER_KEYS.TITLE:
            case FILTER_KEYS.WITHDRAWAL_ID: {
                return {
                    PopoverComponent: ({closeOverlay}) => (
                        <TextInputPopup
                            placeholder={translate(label)}
                            label={translate(label)}
                            defaultValue={searchAdvancedFiltersForm[filterKey] ?? ''}
                            closeOverlay={closeOverlay}
                            onChange={(value) => updateFilterForm({[filterKey]: value})}
                        />
                    ),
                    sentryLabel: getFilterSentryLabel(filterKey),
                };
            }
            case FILTER_KEYS.CURRENCY:
            case FILTER_KEYS.PURCHASE_CURRENCY: {
                return {
                    PopoverComponent: ({closeOverlay}) => (
                        <CurrencySelectPopup
                            closeOverlay={closeOverlay}
                            translationKey={label}
                            value={searchAdvancedFiltersForm[filterKey] ?? []}
                            onChange={(selectedItems) => {
                                const update: Partial<SearchAdvancedFiltersForm> = {};
                                update[filterKey] = selectedItems.map((item) => item.value);
                                updateFilterForm(update);
                            }}
                        />
                    ),
                    sentryLabel: getFilterSentryLabel(filterKey),
                };
            }
            case FILTER_KEYS.BILLABLE:
            case FILTER_KEYS.REIMBURSABLE:
            case FILTER_KEYS.WITHDRAWAL_TYPE: {
                const formValue = searchAdvancedFiltersForm[filterKey];
                const items = getSingleSelectFilterOptions(filterKey, translate);
                const value = items.find((option) => option.value === formValue) ?? null;
                const singleSelectComponent = ({closeOverlay}: PopoverComponentProps) => (
                    <SingleSelectPopup
                        label={translate(label)}
                        items={items}
                        value={value}
                        closeOverlay={closeOverlay}
                        onChange={(item) => updateFilterForm({[filterKey]: item?.value})}
                    />
                );
                return {PopoverComponent: singleSelectComponent, sentryLabel: getFilterSentryLabel(filterKey)};
            }
            case FILTER_KEYS.HAS:
            case FILTER_KEYS.IS:
            case FILTER_KEYS.EXPENSE_TYPE:
            case FILTER_KEYS.STATUS: {
                let formValues = searchAdvancedFiltersForm[filterKey] ?? [];

                if (filterKey === FILTER_KEYS.STATUS) {
                    formValues = Array.isArray(formValues) ? formValues : formValues.split(',');
                }

                const items = getMultiSelectFilterOptions(filterKey, type, translate);
                const value = items.filter((item) => formValues.includes(item.value));

                const multiSelectComponent = ({closeOverlay}: PopoverComponentProps) => (
                    <MultiSelectFilterPopup
                        closeOverlay={closeOverlay}
                        translationKey={label}
                        items={items}
                        value={value}
                        onChangeCallback={(selectedItems) => {
                            if (filterKey === FILTER_KEYS.STATUS) {
                                updateFilterForm({status: selectedItems.length ? selectedItems.map((item) => item.value) : CONST.SEARCH.STATUS.EXPENSE.ALL});
                                return;
                            }
                            const update: Partial<SearchAdvancedFiltersForm> = {};
                            update[filterKey] = selectedItems.map((item) => item.value) as ExpenseTypeValues & HasFilterValues & IsFilterValues;
                            updateFilterForm(update);
                        }}
                    />
                );

                return {PopoverComponent: multiSelectComponent, sentryLabel: getFilterSentryLabel(filterKey)};
            }
            case FILTER_KEYS.ASSIGNEE:
            case FILTER_KEYS.ATTENDEE:
            case FILTER_KEYS.TO:
            case FILTER_KEYS.FROM:
                return {
                    PopoverComponent: ({closeOverlay}) => (
                        <UserSelectPopup
                            value={searchAdvancedFiltersForm[filterKey] ?? []}
                            label={translate(label)}
                            closeOverlay={closeOverlay}
                            onChange={(selectedUsers) => {
                                const update: Partial<SearchAdvancedFiltersForm> = {};
                                update[filterKey] = selectedUsers;
                                updateFilterForm(update);
                            }}
                        />
                    ),
                    sentryLabel: getFilterSentryLabel(filterKey),
                };
            case FILTER_KEYS.POLICY_ID:
                return {
                    PopoverComponent: ({closeOverlay}) => (
                        <WorkspaceSelectPopup
                            policyIDQuery={queryJSON.policyID}
                            updateFilterForm={updateFilterForm}
                            closeOverlay={closeOverlay}
                        />
                    ),
                    sentryLabel: getFilterSentryLabel(filterKey),
                };
            default:
                // This should be unreachable
                return {PopoverComponent: () => null};
        }
    });

    return {
        filters,
        hasErrors,
        shouldShowFiltersBarLoading,
        queryJSON,
        styles,
        translate,
    };
}

export default useSearchFiltersBar;
export type {FilterItem};
export {typeOptionsPoliciesSelector, SKIPPED_FILTERS};
