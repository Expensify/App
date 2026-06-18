import React from 'react';
import useFilterNegatableValue from '@components/Search/hooks/useFilterNegatableValue';
import useGetFilterFormValues from '@components/Search/hooks/useGetFilterFormValues';
import {isAmountFilterKey, isDateFilterKey} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {FilterComponentsProps} from '..';
import type {AmountFilterContentProps} from './AmountFilterContent';
import type {DateFilterContentProps} from './DateFilterContent';
import type {ReportFieldFilterContentProps} from './ReportFieldFilterContent';
import type {TextInputFilterContentProps} from './TextInputFilterContent';

type TextInputFilterContentWrapperProps = Pick<TextInputFilterContentProps, 'baseFilterKey' | 'value' | 'isNegated' | 'onChange'>;
type AmountFilterContentWrapperProps = Pick<AmountFilterContentProps, 'baseFilterKey' | 'value' | 'onChange'>;
type DateFilterContentWrapperProps = Pick<DateFilterContentProps, 'baseFilterKey' | 'value' | 'hasFeed' | 'onChange'>;
type ReportFieldFilterContentWrapperProps = Pick<ReportFieldFilterContentProps, 'values' | 'onChange'>;
type CommonFilterContentWrapperProps = Omit<FilterComponentsProps, 'onChange' | 'onNegationChange' | 'selectionListTextInputStyle' | 'selectionListStyle' | 'autoFocus' | 'footer'> & {
    onChange: (value: FilterComponentsProps['value'], isNegated: boolean) => void;
};

type SearchAdvancedFiltersContentProps = {
    baseFilterKey: SearchFilter['key'];
    values: Partial<SearchAdvancedFiltersForm> | undefined;
    policyIDQuery: string[] | undefined;
    ready?: boolean;
    components: {
        Text: React.ComponentType<TextInputFilterContentWrapperProps>;
        Amount: React.ComponentType<AmountFilterContentWrapperProps>;
        Date: React.ComponentType<DateFilterContentWrapperProps>;
        ReportField: React.ComponentType<ReportFieldFilterContentWrapperProps>;
        Common: React.ComponentType<CommonFilterContentWrapperProps>;
    };
    onChange: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

type SingleAdvancedFiltersContentProps = Pick<SearchAdvancedFiltersContentProps, 'values' | 'policyIDQuery' | 'ready' | 'onChange'> & {
    baseFilterKey: FilterComponentsProps['baseFilterKey'];
    components: {
        Text: React.ComponentType<TextInputFilterContentWrapperProps>;
        Common: React.ComponentType<CommonFilterContentWrapperProps>;
    };
};

function SingleAdvancedFiltersContent({baseFilterKey, values, policyIDQuery, ready, components, onChange}: SingleAdvancedFiltersContentProps) {
    const {isNegated, value} = useFilterNegatableValue(baseFilterKey, values);
    const getFilterFormValues = useGetFilterFormValues();

    if (
        baseFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT ||
        baseFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION ||
        baseFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID ||
        baseFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD ||
        baseFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE ||
        baseFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID
    ) {
        const TextFilter = components.Text;
        return (
            <TextFilter
                key={baseFilterKey}
                baseFilterKey={baseFilterKey}
                value={values?.[baseFilterKey]}
                isNegated={isNegated}
                onChange={(newValue, negated) => onChange(getFilterFormValues(baseFilterKey, newValue, negated))}
            />
        );
    }

    const CommonFilter = components.Common;
    return (
        <CommonFilter
            key={baseFilterKey}
            baseFilterKey={baseFilterKey}
            value={value}
            type={values?.type}
            policyIDs={values?.policyID}
            policyIDQuery={policyIDQuery}
            ready={ready}
            isNegated={isNegated}
            onChange={(newValue, negated) => onChange(getFilterFormValues(baseFilterKey, newValue, negated))}
        />
    );
}

function SearchAdvancedFiltersContent({baseFilterKey, values, policyIDQuery, ready, components, onChange}: SearchAdvancedFiltersContentProps) {
    if (isAmountFilterKey(baseFilterKey)) {
        const AmountFilter = components.Amount;
        return (
            <AmountFilter
                key={baseFilterKey}
                baseFilterKey={baseFilterKey}
                value={{
                    [CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO]: values?.[`${baseFilterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO}`],
                    [CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN]: values?.[`${baseFilterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}`],
                    [CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN]: values?.[`${baseFilterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}`],
                }}
                onChange={onChange}
            />
        );
    }

    if (isDateFilterKey(baseFilterKey)) {
        const DateFilter = components.Date;
        const onModifier = CONST.SEARCH.DATE_MODIFIERS.ON;
        const afterModifier = CONST.SEARCH.DATE_MODIFIERS.AFTER;
        const beforeModifier = CONST.SEARCH.DATE_MODIFIERS.BEFORE;
        const rangeModifier = CONST.SEARCH.DATE_MODIFIERS.RANGE;

        return (
            <DateFilter
                key={baseFilterKey}
                baseFilterKey={baseFilterKey}
                value={{
                    [onModifier]: values?.[`${baseFilterKey}${onModifier}`],
                    [afterModifier]: values?.[`${baseFilterKey}${afterModifier}`],
                    [beforeModifier]: values?.[`${baseFilterKey}${beforeModifier}`],
                    [rangeModifier]: values?.[`${baseFilterKey}${rangeModifier}`],
                }}
                hasFeed={!!values?.feed}
                onChange={(newValues) =>
                    onChange({
                        [`${baseFilterKey}${onModifier}`]: newValues[onModifier],
                        [`${baseFilterKey}${afterModifier}`]: newValues[afterModifier],
                        [`${baseFilterKey}${beforeModifier}`]: newValues[beforeModifier],
                        [`${baseFilterKey}${rangeModifier}`]: newValues[rangeModifier],
                    })
                }
            />
        );
    }

    if (baseFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_FIELD) {
        const ReportFieldFilter = components.ReportField;
        return (
            <ReportFieldFilter
                values={values}
                onChange={onChange}
            />
        );
    }

    return (
        <SingleAdvancedFiltersContent
            baseFilterKey={baseFilterKey}
            values={values}
            policyIDQuery={policyIDQuery}
            ready={ready}
            components={{Text: components.Text, Common: components.Common}}
            onChange={onChange}
        />
    );
}

export default SearchAdvancedFiltersContent;
export type {TextInputFilterContentWrapperProps, AmountFilterContentWrapperProps, DateFilterContentWrapperProps, ReportFieldFilterContentWrapperProps, CommonFilterContentWrapperProps};
