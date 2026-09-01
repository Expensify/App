import type {ListFilterContentProps} from '@components/Search/FilterComponents/ListFilterContent';

import {getFilterFormValues} from '@libs/SearchQueryUtils';
import {getFilterContentValues} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

import React from 'react';

import type {AmountFilterContentProps} from './AmountFilterContent';
import type {DateFilterContentProps} from './DateFilterContent';
import type {ReportFieldFilterContentProps} from './ReportFieldFilterContent';
import type {TextInputFilterContentProps} from './TextInputFilterContent';

type TextInputFilterContentWrapperProps = Pick<TextInputFilterContentProps, 'baseFilterKey' | 'value' | 'isNegated' | 'onChange'>;
type AmountFilterContentWrapperProps = Pick<AmountFilterContentProps, 'baseFilterKey' | 'value' | 'onChange'>;
type DateFilterContentWrapperProps = Pick<DateFilterContentProps, 'baseFilterKey' | 'value' | 'hasFeed' | 'onChange'>;
type ReportFieldFilterContentWrapperProps = Pick<ReportFieldFilterContentProps, 'values' | 'onChange'>;
type ListFilterContentWrapperProps = Omit<ListFilterContentProps, 'onChange' | 'onNegationChange' | 'selectionListTextInputStyle' | 'selectionListStyle' | 'autoFocus' | 'footer'> & {
    onChange: (value: ListFilterContentProps['value'], isNegated: boolean) => void;
};

type SearchAdvancedFiltersContentProps = {
    baseFilterKey: SearchFilter['key'];
    values: Partial<SearchAdvancedFiltersForm> | undefined;
    ready?: boolean;
    components: {
        Text: React.ComponentType<TextInputFilterContentWrapperProps>;
        Amount: React.ComponentType<AmountFilterContentWrapperProps>;
        Date: React.ComponentType<DateFilterContentWrapperProps>;
        ReportField: React.ComponentType<ReportFieldFilterContentWrapperProps>;
        List: React.ComponentType<ListFilterContentWrapperProps>;
    };
    onChange: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

function SearchAdvancedFiltersContent({baseFilterKey, values, ready, components, onChange}: SearchAdvancedFiltersContentProps) {
    const contentValues = getFilterContentValues(baseFilterKey, values);

    if (contentValues.kind === 'amount') {
        const AmountFilter = components.Amount;
        return (
            <AmountFilter
                key={contentValues.baseFilterKey}
                baseFilterKey={contentValues.baseFilterKey}
                value={contentValues.value}
                onChange={onChange}
            />
        );
    }

    if (contentValues.kind === 'date') {
        const DateFilter = components.Date;
        const onModifier = CONST.SEARCH.DATE_MODIFIERS.ON;
        const afterModifier = CONST.SEARCH.DATE_MODIFIERS.AFTER;
        const beforeModifier = CONST.SEARCH.DATE_MODIFIERS.BEFORE;
        const rangeModifier = CONST.SEARCH.DATE_MODIFIERS.RANGE;

        return (
            <DateFilter
                key={contentValues.baseFilterKey}
                baseFilterKey={contentValues.baseFilterKey}
                value={contentValues.value}
                hasFeed={contentValues.hasFeed}
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

    if (contentValues.kind === 'reportField') {
        const ReportFieldFilter = components.ReportField;
        return (
            <ReportFieldFilter
                values={contentValues.values}
                onChange={onChange}
            />
        );
    }

    if (contentValues.kind === 'text') {
        const TextFilter = components.Text;
        return (
            <TextFilter
                key={contentValues.baseFilterKey}
                baseFilterKey={contentValues.baseFilterKey}
                value={contentValues.negatable.value}
                isNegated={contentValues.negatable.isNegated}
                onChange={(newValue, negated) => onChange(getFilterFormValues(contentValues.baseFilterKey, newValue, negated))}
            />
        );
    }

    const ListFilter = components.List;
    return (
        <ListFilter
            key={contentValues.baseFilterKey}
            baseFilterKey={contentValues.baseFilterKey}
            value={contentValues.negatable.value}
            type={contentValues.type}
            policyID={contentValues.policyID}
            ready={ready}
            isNegated={contentValues.negatable.isNegated}
            onChange={(newValue, negated) => onChange(getFilterFormValues(contentValues.baseFilterKey, newValue, negated))}
        />
    );
}

export default SearchAdvancedFiltersContent;
export type {TextInputFilterContentWrapperProps, AmountFilterContentWrapperProps, DateFilterContentWrapperProps, ReportFieldFilterContentWrapperProps, ListFilterContentWrapperProps};
