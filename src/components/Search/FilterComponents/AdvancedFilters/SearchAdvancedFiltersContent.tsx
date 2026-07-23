import {isAmountFilterKey, isDateFilterKey} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

import React from 'react';

import type {FilterComponentsProps} from '..';
import type {AmountFilterContentProps} from './AmountFilterContent';
import type {CommonFilterContentProps} from './CommonFilterContent';
import type {DateFilterContentProps} from './DateFilterContent';
import type {ReportFieldFilterContentProps} from './ReportFieldFilterContent';
import type {TextInputFilterContentProps} from './TextInputFilterContent';

type TextInputFilterContentWrapperProps = Pick<TextInputFilterContentProps, 'filterKey' | 'value' | 'onChange'>;
type AmountFilterContentWrapperProps = Pick<AmountFilterContentProps, 'filterKey' | 'value' | 'onChange'>;
type DateFilterContentWrapperProps = Pick<DateFilterContentProps, 'filterKey' | 'value' | 'hasFeed' | 'onChange'>;
type ReportFieldFilterContentWrapperProps = Pick<ReportFieldFilterContentProps, 'values' | 'onChange'>;
type CommonFilterContentWrapperProps = Omit<CommonFilterContentProps, 'selectionListTextInputStyle' | 'selectionListStyle' | 'autoFocus' | 'footer'>;
type SearchAdvancedFiltersContentProps = {
    filterKey: SearchFilter['key'];
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

function getFilterFormValue<K extends FilterComponentsProps['filterKey']>(filterKey: K, value: SearchAdvancedFiltersForm[K] | undefined): Partial<SearchAdvancedFiltersForm> {
    const update: Partial<SearchAdvancedFiltersForm> = {};
    update[filterKey] = value;
    return update;
}

function SearchAdvancedFiltersContent({filterKey, values, policyIDQuery, ready, components, onChange}: SearchAdvancedFiltersContentProps) {
    const {Text: TextFilter, Amount: AmountFilter, Date: DateFilter, ReportField: ReportFieldFilter, Common: CommonFilter} = components;

    if (
        filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT ||
        filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION ||
        filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID ||
        filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD ||
        filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE ||
        filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID
    ) {
        return (
            <TextFilter
                key={filterKey}
                filterKey={filterKey}
                value={values?.[filterKey]}
                onChange={(newValue) => onChange({[filterKey]: newValue})}
            />
        );
    }

    if (isAmountFilterKey(filterKey)) {
        return (
            <AmountFilter
                key={filterKey}
                filterKey={filterKey}
                value={{
                    [CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO]: values?.[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO}`],
                    [CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN]: values?.[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}`],
                    [CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN]: values?.[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}`],
                }}
                onChange={onChange}
            />
        );
    }

    if (isDateFilterKey(filterKey)) {
        const onModifier = CONST.SEARCH.DATE_MODIFIERS.ON;
        const afterModifier = CONST.SEARCH.DATE_MODIFIERS.AFTER;
        const beforeModifier = CONST.SEARCH.DATE_MODIFIERS.BEFORE;
        const rangeModifier = CONST.SEARCH.DATE_MODIFIERS.RANGE;

        return (
            <DateFilter
                key={filterKey}
                filterKey={filterKey}
                value={{
                    [onModifier]: values?.[`${filterKey}${onModifier}`],
                    [afterModifier]: values?.[`${filterKey}${afterModifier}`],
                    [beforeModifier]: values?.[`${filterKey}${beforeModifier}`],
                    [rangeModifier]: values?.[`${filterKey}${rangeModifier}`],
                }}
                hasFeed={!!values?.feed}
                onChange={(newValues) =>
                    onChange({
                        [`${filterKey}${onModifier}`]: newValues[onModifier],
                        [`${filterKey}${afterModifier}`]: newValues[afterModifier],
                        [`${filterKey}${beforeModifier}`]: newValues[beforeModifier],
                        [`${filterKey}${rangeModifier}`]: newValues[rangeModifier],
                    })
                }
            />
        );
    }

    if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_FIELD) {
        return (
            <ReportFieldFilter
                values={values}
                onChange={onChange}
            />
        );
    }

    return (
        <CommonFilter
            key={filterKey}
            filterKey={filterKey}
            value={values?.[filterKey]}
            type={values?.type}
            policyIDs={values?.policyID}
            policyIDQuery={policyIDQuery}
            ready={ready}
            onChange={(newValue) => onChange(getFilterFormValue(filterKey, newValue))}
        />
    );
}

export default SearchAdvancedFiltersContent;
export type {TextInputFilterContentWrapperProps, AmountFilterContentWrapperProps, DateFilterContentWrapperProps, ReportFieldFilterContentWrapperProps, CommonFilterContentWrapperProps};
