import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {SearchAmountFilterKeys, SearchDateFilterKeys} from '@components/Search/types';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {FILTER_LABEL_MAP, getMultiSelectFilterOptions, getSingleSelectFilterOptions} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form/SearchAdvancedFiltersForm';
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
type FilterComponentsProps = {
    filterKey: FilterKeys;
    value: SearchAdvancedFiltersForm[FilterKeys] | undefined;
    policyIDQuery: string[] | undefined;
    onChange: (value: SearchAdvancedFiltersForm[FilterKeys]) => void;
};

type TextInputFilterComponentsProps = {
    filterKey:
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID;
    value: string | undefined;
    onChange: (value: string) => void;
};

type SingleSelectFilterKeys = typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE;
type SingleSelectFilterComponentsProps = {
    filterKey: SingleSelectFilterKeys;
    value: SearchAdvancedFiltersForm[SingleSelectFilterKeys] | undefined;
    onChange: (value: SearchAdvancedFiltersForm[SingleSelectFilterKeys]) => void;
};

type MultiSelectFilterKeys =
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.IS
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_STATUS
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS;
type MultiSelectFilterComponentsProps = {
    filterKey: MultiSelectFilterKeys;
    value: SearchAdvancedFiltersForm[MultiSelectFilterKeys] | undefined;
    onChange: (values: SearchAdvancedFiltersForm[MultiSelectFilterKeys]) => void;
};

function TextInputFilterComponents({filterKey, value, onChange}: TextInputFilterComponentsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const label = translate(FILTER_LABEL_MAP[filterKey]);
    return (
        <TextInput
            placeholder={label}
            value={value}
            onChangeText={onChange}
            accessibilityLabel={label}
            role={CONST.ROLE.PRESENTATION}
            containerStyles={[styles.ph5]}
        />
    );
}

function SingleSelectFilterComponents({filterKey, value, onChange}: SingleSelectFilterComponentsProps) {
    const {translate} = useLocalize();
    const items = getSingleSelectFilterOptions(filterKey, translate);

    return (
        <SingleSelect
            items={items}
            value={items.find((option) => option.value === value)}
            onChange={(item) => onChange(item.value)}
        />
    );
}

function MultiSelectFilterComponents({filterKey, value = [], onChange}: MultiSelectFilterComponentsProps) {
    const {translate} = useLocalize();
    const typeSelector = (searchAdvancedFiltersForm: OnyxEntry<SearchAdvancedFiltersForm>) => {
        return searchAdvancedFiltersForm?.type;
    };
    const [type = CONST.SEARCH.DATA_TYPES.EXPENSE] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {
        selector: typeSelector,
    });
    const items = getMultiSelectFilterOptions(filterKey, type, translate);
    const normalizedValue = Array.isArray(value) ? value : value.split(',');
    const multiSelectValues = items.filter((item) => normalizedValue.includes(item.value));

    return (
        <MultiSelect
            items={items}
            value={multiSelectValues}
            onChange={(selectedItems) => {
                if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS) {
                    onChange(selectedItems.length > 0 ? selectedItems.map((item) => item.value) : CONST.SEARCH.STATUS.EXPENSE.ALL);
                    return;
                }
                onChange(selectedItems.map((item) => item.value));
            }}
        />
    );
}

function FilterComponents({filterKey, value, policyIDQuery, onChange}: FilterComponentsProps) {
    switch (filterKey) {
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.IN:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED_TO:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY: {
            const Component = {
                [CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED]: FeedSelector,
                [CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID]: CardSelector,
                [CONST.SEARCH.SYNTAX_FILTER_KEYS.IN]: InSelector,
                [CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE]: TaxRateSelector,
                [CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED_TO]: ExportedToSelector,
                [CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG]: TagSelector,
                [CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY]: CategorySelector,
            }[filterKey];
            return (
                <Component
                    value={value as string[] | undefined}
                    onChange={onChange}
                />
            );
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE: {
            return (
                <TypeSelector
                    value={value as string | undefined}
                    onChange={onChange}
                />
            );
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID: {
            return (
                <TextInputFilterComponents
                    key={filterKey}
                    filterKey={filterKey}
                    value={value as string | undefined}
                    onChange={onChange}
                />
            );
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_CURRENCY: {
            return (
                <CurrencySelector
                    key={filterKey}
                    value={value as string[] | undefined}
                    onChange={onChange}
                />
            );
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE: {
            return (
                <SingleSelectFilterComponents
                    key={filterKey}
                    filterKey={filterKey}
                    value={value as SingleSelectFilterComponentsProps['value'] | undefined}
                    onChange={onChange}
                />
            );
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.IS:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_STATUS:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS: {
            return (
                <MultiSelectFilterComponents
                    key={filterKey}
                    filterKey={filterKey}
                    value={value}
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
                    value={value as string[] | undefined}
                    key={filterKey}
                    onChange={onChange}
                />
            );
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID:
            return (
                <WorkspaceSelector
                    value={value as string[] | undefined}
                    policyIDQuery={policyIDQuery}
                    onChange={onChange}
                />
            );
        default:
            return null;
    }
}

export default FilterComponents;
export type {FilterComponentsProps};
