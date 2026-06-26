import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {SearchAmountFilterKeys, SearchDateFilterKeys, SearchFilterCommonProps} from '@components/Search/types';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {isFilterNegatable} from '@libs/SearchQueryUtils';
import {FILTER_VIEW_MAP, getMultiSelectFilterOptions, getSingleSelectFilterOptions} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form/SearchAdvancedFiltersForm';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
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

type FilterKeys = Exclude<SearchFilter['key'], SearchDateFilterKeys | SearchAmountFilterKeys | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_FIELD>;
type FilterComponentsProps = SearchFilterCommonProps<SearchAdvancedFiltersForm[FilterKeys] | undefined> & {
    baseFilterKey: FilterKeys;
    isNegated: boolean;
    type?: SearchDataTypes;
    policyIDs: string[] | undefined;
    policyIDQuery: string[] | undefined;
    style?: StyleProp<ViewStyle>;
    onNegationChange: (isNegated: boolean) => void;
};

type TextInputFilterComponentsProps = SearchFilterCommonProps<string | undefined> & {
    baseFilterKey:
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID;
    autoFocus?: boolean;
};

type SingleSelectFilterKeys = typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE;
type SingleSelectFilterComponentsProps = SearchFilterCommonProps<SearchAdvancedFiltersForm[SingleSelectFilterKeys] | undefined> & {
    baseFilterKey: SingleSelectFilterKeys;
};

type MultiSelectFilterKeys =
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.IS
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_STATUS
    | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS;
type MultiSelectFilterComponentsProps = SearchFilterCommonProps<SearchAdvancedFiltersForm[MultiSelectFilterKeys] | undefined> & {
    baseFilterKey: MultiSelectFilterKeys;
    type: SearchDataTypes | undefined;
};

function TextInputFilterComponents({baseFilterKey, value, autoFocus, onChange}: TextInputFilterComponentsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const label = translate(FILTER_VIEW_MAP[baseFilterKey].labelKey);
    const {inputCallbackRef} = useAutoFocusInput();

    const isFilterKeyNegatable = isFilterNegatable(baseFilterKey);

    return (
        <TextInput
            ref={autoFocus ? (inputCallbackRef as (ref: BaseTextInputRef | null) => void) : undefined}
            placeholder={label}
            value={value}
            onChangeText={onChange}
            accessibilityLabel={label}
            role={CONST.ROLE.PRESENTATION}
            containerStyles={[styles.ph5, isFilterKeyNegatable && styles.pt2]}
        />
    );
}

function SingleSelectFilterComponents({baseFilterKey, value, selectionListStyle, footer, onChange}: SingleSelectFilterComponentsProps) {
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

function MultiSelectFilterComponents({baseFilterKey, value = [], type = CONST.SEARCH.DATA_TYPES.EXPENSE, selectionListStyle, footer, onChange}: MultiSelectFilterComponentsProps) {
    const {translate} = useLocalize();
    const items = getMultiSelectFilterOptions(baseFilterKey, type, translate);
    const normalizedValue = Array.isArray(value) ? value : value.split(',');
    const multiSelectValues = items.filter((item) => normalizedValue.includes(item.value));

    return (
        <MultiSelect
            items={items}
            value={multiSelectValues}
            selectionListStyle={selectionListStyle}
            footer={footer}
            onChange={(selectedItems) => {
                if (baseFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS) {
                    onChange(selectedItems.length > 0 ? selectedItems.map((item) => item.value) : CONST.SEARCH.STATUS.EXPENSE.ALL);
                    return;
                }
                onChange(selectedItems.map((item) => item.value));
            }}
        />
    );
}

function FilterComponents({
    baseFilterKey,
    value,
    isNegated,
    type,
    policyIDs,
    policyIDQuery,
    style,
    selectionListTextInputStyle: selectionListTextInputStyleProp,
    selectionListStyle,
    autoFocus,
    ready,
    footer,
    onChange,
    onNegationChange,
}: FilterComponentsProps) {
    const styles = useThemeStyles();
    const isFilterKeyNegatable = isFilterNegatable(baseFilterKey);
    const selectionListTextInputStyle = [selectionListTextInputStyleProp, isFilterKeyNegatable && styles.pt2];

    let content;
    switch (baseFilterKey) {
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
            }[baseFilterKey];
            content = (
                <Component
                    value={typeof value === 'object' ? value : undefined}
                    policyIDs={policyIDs}
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
            content = (
                <TypeSelector
                    value={typeof value === 'string' ? value : undefined}
                    selectionListStyle={selectionListStyle}
                    footer={footer}
                    onChange={onChange}
                />
            );
            break;
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID: {
            content = (
                <TextInputFilterComponents
                    key={baseFilterKey}
                    baseFilterKey={baseFilterKey}
                    value={typeof value === 'string' ? value : undefined}
                    autoFocus={autoFocus}
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
            const isSingleSelectFilterValue = (v: FilterComponentsProps['value']): v is SingleSelectFilterComponentsProps['value'] => {
                return typeof v === 'string';
            };

            content = (
                <SingleSelectFilterComponents
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
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_STATUS:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS: {
            content = (
                <MultiSelectFilterComponents
                    key={baseFilterKey}
                    baseFilterKey={baseFilterKey}
                    value={value}
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
                    policyIDQuery={policyIDQuery}
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

export default FilterComponents;
export type {FilterComponentsProps};
