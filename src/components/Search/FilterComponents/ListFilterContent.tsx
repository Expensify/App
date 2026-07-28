import type {Filter, SearchAmountFilterKeys, SearchDateFilterKeys, SearchFilterCommonProps, SearchTextFilterKeys} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {isFilterNegatable} from '@libs/SearchQueryUtils';
import {getMultiSelectFilterOptions, getSingleSelectFilterOptions} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form/SearchAdvancedFiltersForm';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';

import BankAccountSelector from './BankAccountSelector';
import CardSelector from './CardSelector';
import CategorySelector from './CategorySelector';
import CurrencySelector from './CurrencySelector';
import ExportedToSelector from './ExportedToSelector';
import FeedSelector from './FeedSelector';
import InSelector from './InSelector';
import MultiSelect from './MultiSelect';
import NegatableFilter from './NegatableFilter';
import SingleSelect from './SingleSelect';
import TagSelector from './TagSelector';
import TaxRateSelector from './TaxRateSelector';
import TypeSelector from './TypeSelector';
import UserSelector from './UserSelector';
import WorkspaceSelector from './WorkspaceSelector';

type FilterKeys = Exclude<SearchFilter['key'], SearchDateFilterKeys | SearchAmountFilterKeys | SearchTextFilterKeys | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_FIELD>;
type ListFilterContentProps = SearchFilterCommonProps<SearchAdvancedFiltersForm[FilterKeys] | undefined> & {
    baseFilterKey: FilterKeys;
    isNegated: boolean;
    type?: SearchDataTypes;
    policyID: Filter | undefined;
    style?: StyleProp<ViewStyle>;
    onNegationChange: (isNegated: boolean) => void;
};

type SingleSelectFilterKeys = typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE;
type SingleSelectListFilterContentProps = SearchFilterCommonProps<SearchAdvancedFiltersForm[SingleSelectFilterKeys] | undefined> & {
    baseFilterKey: SingleSelectFilterKeys;
};

type MultiSelectFilterKeys =
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.IS
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.RECEIPT_TYPE
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_STATUS
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID_STATUS
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS;
type MultiSelectListFilterContentProps = SearchFilterCommonProps<SearchAdvancedFiltersForm[MultiSelectFilterKeys] | undefined> & {
    baseFilterKey: MultiSelectFilterKeys;
    type: SearchDataTypes | undefined;
};

function SingleSelectListFilterContent({baseFilterKey, value, selectionListStyle, footer, onChange}: SingleSelectListFilterContentProps) {
    const {translate} = useLocalize();
    const items = getSingleSelectFilterOptions(baseFilterKey, translate);

    return (
        <SingleSelect
            items={items}
            value={items.find((option) => option.value === value)}
            selectionListStyle={selectionListStyle}
            footer={footer}
            allowDeselect
            onChange={(item) => onChange(item?.value)}
        />
    );
}

function MultiSelectListFilterContent({baseFilterKey, value = [], type = CONST.SEARCH.DATA_TYPES.EXPENSE, selectionListStyle, footer, onChange}: MultiSelectListFilterContentProps) {
    const {translate} = useLocalize();
    const items = getMultiSelectFilterOptions(baseFilterKey, type, translate);
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

function ListFilterContent({
    baseFilterKey,
    value,
    isNegated,
    type,
    policyID,
    style,
    selectionListTextInputStyle: selectionListTextInputStyleProp,
    selectionListStyle,
    autoFocus,
    ready,
    footer,
    onChange,
    onNegationChange,
}: ListFilterContentProps) {
    const styles = useThemeStyles();
    const isFilterKeyNegatable = isFilterNegatable(baseFilterKey);
    const selectionListTextInputStyle = [selectionListTextInputStyleProp, isFilterKeyNegatable && styles.pt2];

    let content;
    switch (baseFilterKey) {
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
            }[baseFilterKey];
            content = (
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
            break;
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE: {
            const isTypeFilterValue = (v: ListFilterContentProps['value']): v is SearchDataTypes => {
                return typeof v === 'string';
            };
            content = (
                <TypeSelector
                    value={isTypeFilterValue(value) ? value : undefined}
                    selectionListStyle={selectionListStyle}
                    footer={footer}
                    onChange={onChange}
                />
            );
            break;
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_CURRENCY: {
            content = (
                <CurrencySelector
                    key={baseFilterKey}
                    value={typeof value === 'object' ? value : undefined}
                    selectionListTextInputStyle={selectionListTextInputStyle}
                    selectionListStyle={selectionListStyle}
                    autoFocus={autoFocus}
                    footer={footer}
                    onChange={onChange}
                />
            );
            break;
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE: {
            const isSingleSelectFilterValue = (v: ListFilterContentProps['value']): v is SingleSelectListFilterContentProps['value'] => {
                return typeof v === 'string';
            };

            content = (
                <SingleSelectListFilterContent
                    key={baseFilterKey}
                    baseFilterKey={baseFilterKey}
                    value={isSingleSelectFilterValue(value) ? value : undefined}
                    selectionListStyle={selectionListStyle}
                    footer={footer}
                    onChange={onChange}
                />
            );
            break;
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.IS:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.RECEIPT_TYPE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_STATUS:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID_STATUS:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS: {
            content = (
                <MultiSelectListFilterContent
                    key={baseFilterKey}
                    baseFilterKey={baseFilterKey}
                    value={typeof value === 'object' ? value : undefined}
                    type={type}
                    selectionListStyle={selectionListStyle}
                    footer={footer}
                    onChange={onChange}
                />
            );
            break;
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.ASSIGNEE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.ATTENDEE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.TO:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM: {
            content = (
                <UserSelector
                    value={typeof value === 'object' ? value : undefined}
                    key={baseFilterKey}
                    selectionListTextInputStyle={selectionListTextInputStyle}
                    selectionListStyle={selectionListStyle}
                    autoFocus={autoFocus}
                    ready={ready}
                    footer={footer}
                    onChange={onChange}
                />
            );
            break;
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID: {
            content = (
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
            break;
        }
        default:
            break;
    }

    return (
        <NegatableFilter
            style={style}
            baseFilterKey={baseFilterKey}
            isNegated={isNegated}
            onNegationChange={onNegationChange}
        >
            {content}
        </NegatableFilter>
    );
}

export default ListFilterContent;
export type {ListFilterContentProps};
