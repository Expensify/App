import type {Filter, SearchAmountFilterKeys, SearchDateFilterKeys, SearchFilterCommonProps} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';

import {getMultiSelectFilterOptions, getSingleSelectFilterOptions} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form/SearchAdvancedFiltersForm';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

import React from 'react';

import BankAccountSelector from './BankAccountSelector';
import CardSelector from './CardSelector';
import CategorySelector from './CategorySelector';
import CurrencySelector from './CurrencySelector';
import ExportedToSelector from './ExportedToSelector';
import FeedSelector from './FeedSelector';
import InSelector from './InSelector';
import MultiSelect from './MultiSelect';
import SingleSelect from './SingleSelect';
import TagSelector from './TagSelector';
import TaxRateSelector from './TaxRateSelector';
import TypeSelector from './TypeSelector';
import UserSelector from './UserSelector';
import WorkspaceSelector from './WorkspaceSelector';

type FilterKeys = Exclude<SearchFilter['key'], SearchDateFilterKeys | SearchAmountFilterKeys | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_FIELD>;
type FilterComponentsProps = SearchFilterCommonProps<SearchAdvancedFiltersForm[FilterKeys] | undefined> & {
    filterKey: FilterKeys;
    type?: SearchDataTypes;
    policyID: Filter | undefined;
};

type SingleSelectFilterKeys = typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE;
type SingleSelectFilterComponentsProps = SearchFilterCommonProps<SearchAdvancedFiltersForm[SingleSelectFilterKeys] | undefined> & {
    filterKey: SingleSelectFilterKeys;
};

type MultiSelectFilterKeys =
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.IS
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.RECEIPT_TYPE
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_STATUS
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID_STATUS
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS;
type MultiSelectFilterComponentsProps = SearchFilterCommonProps<SearchAdvancedFiltersForm[MultiSelectFilterKeys] | undefined> & {
    filterKey: MultiSelectFilterKeys;
    type: SearchDataTypes | undefined;
};

function SingleSelectFilterComponents({filterKey, value, selectionListTextInputStyle, selectionListStyle, footer, onChange}: SingleSelectFilterComponentsProps) {
    const {translate} = useLocalize();
    const items = getSingleSelectFilterOptions(filterKey, translate);

    return (
        <SingleSelect
            items={items}
            value={items.find((option) => option.value === value)}
            selectionListTextInputStyle={selectionListTextInputStyle}
            selectionListStyle={selectionListStyle}
            footer={footer}
            allowDeselect
            onChange={(item) => onChange(item?.value)}
        />
    );
}

function MultiSelectFilterComponents({filterKey, value = [], type = CONST.SEARCH.DATA_TYPES.EXPENSE, selectionListStyle, footer, onChange}: MultiSelectFilterComponentsProps) {
    const {translate} = useLocalize();
    const items = getMultiSelectFilterOptions(filterKey, type, translate);
    const multiSelectValues = items.filter((item) => (value as string[]).includes(item.value));

    return (
        <MultiSelect
            items={items}
            value={multiSelectValues}
            selectionListStyle={selectionListStyle}
            footer={footer}
            onChange={(selectedItems) => {
                onChange(selectedItems.map((item) => item.value));
            }}
        />
    );
}

function FilterComponents({filterKey, value, type, policyID, selectionListTextInputStyle, selectionListStyle, autoFocus, ready, footer, onChange}: FilterComponentsProps) {
    switch (filterKey) {
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.BANK_ACCOUNT:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.IN:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED_TO:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY: {
            const Component = {
                [CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED]: FeedSelector,
                [CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID]: CardSelector,
                [CONST.SEARCH.SYNTAX_FILTER_KEYS.BANK_ACCOUNT]: BankAccountSelector,
                [CONST.SEARCH.SYNTAX_FILTER_KEYS.IN]: InSelector,
                [CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE]: TaxRateSelector,
                [CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED_TO]: ExportedToSelector,
                [CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG]: TagSelector,
                [CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY]: CategorySelector,
            }[filterKey];
            return (
                <Component
                    value={typeof value === 'object' ? value : undefined}
                    policyID={policyID}
                    selectionListTextInputStyle={selectionListTextInputStyle}
                    selectionListStyle={selectionListStyle}
                    autoFocus={autoFocus}
                    ready={ready}
                    footer={footer}
                    onChange={onChange}
                />
            );
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE: {
            return (
                <TypeSelector
                    value={typeof value === 'string' ? value : undefined}
                    selectionListStyle={selectionListStyle}
                    footer={footer}
                    onChange={onChange}
                />
            );
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_CURRENCY: {
            return (
                <CurrencySelector
                    key={filterKey}
                    value={typeof value === 'object' ? value : undefined}
                    selectionListTextInputStyle={selectionListTextInputStyle}
                    selectionListStyle={selectionListStyle}
                    autoFocus={autoFocus}
                    footer={footer}
                    onChange={onChange}
                />
            );
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE: {
            const isSingleSelectFilterValue = (v: FilterComponentsProps['value']): v is SingleSelectFilterComponentsProps['value'] => {
                return typeof v === 'string';
            };

            return (
                <SingleSelectFilterComponents
                    key={filterKey}
                    filterKey={filterKey}
                    value={isSingleSelectFilterValue(value) ? value : undefined}
                    selectionListTextInputStyle={selectionListTextInputStyle}
                    selectionListStyle={selectionListStyle}
                    footer={footer}
                    onChange={onChange}
                />
            );
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.IS:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.RECEIPT_TYPE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_STATUS:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID_STATUS:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS: {
            return (
                <MultiSelectFilterComponents
                    key={filterKey}
                    filterKey={filterKey}
                    value={typeof value === 'object' ? value : undefined}
                    type={type}
                    selectionListTextInputStyle={selectionListTextInputStyle}
                    selectionListStyle={selectionListStyle}
                    footer={footer}
                    onChange={onChange}
                />
            );
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.ASSIGNEE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.ATTENDEE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.TO:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM:
            return (
                <UserSelector
                    value={typeof value === 'object' ? value : undefined}
                    key={filterKey}
                    selectionListTextInputStyle={selectionListTextInputStyle}
                    selectionListStyle={selectionListStyle}
                    autoFocus={autoFocus}
                    ready={ready}
                    footer={footer}
                    onChange={onChange}
                />
            );
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID:
            return (
                <WorkspaceSelector
                    value={typeof value === 'object' ? value : undefined}
                    selectionListTextInputStyle={selectionListTextInputStyle}
                    selectionListStyle={selectionListStyle}
                    autoFocus={autoFocus}
                    ready={ready}
                    footer={footer}
                    onChange={onChange}
                />
            );
        default:
            return null;
    }
}

export default FilterComponents;
export type {FilterComponentsProps};
