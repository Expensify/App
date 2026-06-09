import React, {useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import useFullscreenAdvancedFilters from '@components/Search/FilterDropdowns/AdvancedFilters/useFullscreenAdvancedFilters';
import type {SearchFilterCommonProps} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {isAmountFilterKey, isDateFilterKey} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import FilterComponents from '..';
import type {FilterComponentsProps} from '..';
import AmountFilterComponent from './AmountFilterComponent';
import DateFilterComponent from './DateFilterComponent';
import ReportFieldFilterComponent from './ReportFieldFilterComponent';

type FilterContentProps = SearchFilterCommonProps & {
    filterKey: SearchFilter['key'];
    values: Partial<SearchAdvancedFiltersForm> | undefined;
    policyIDQuery: string[] | undefined;
    onChange: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

type TextInputFilterContentProps = {
    filterKey:
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID;
    value: string | undefined;
    autoFocus: boolean | undefined;
    onChange: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

type CommonContentProps = SearchFilterCommonProps & {
    filterKey: FilterComponentsProps['filterKey'];
    value: FilterComponentsProps['value'];
    type: SearchDataTypes | undefined;
    policyIDs: string[] | undefined;
    policyIDQuery: string[] | undefined;
    onChange: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

function TextInputFilterContent({filterKey, value: initialValue, autoFocus, onChange}: TextInputFilterContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [value, setValue] = useState(initialValue);

    const fullscreen = useFullscreenAdvancedFilters();

    return (
        <View style={[styles.flex1, styles.justifyContentBetween, !fullscreen && styles.pt5]}>
            <FilterComponents
                value={value}
                policyIDs={undefined}
                filterKey={filterKey}
                policyIDQuery={undefined}
                autoFocus={autoFocus}
                onChange={(v) => setValue(v as string)}
            />
            <Button
                style={[styles.ph5, styles.pb5]}
                success
                medium={!fullscreen}
                large={fullscreen}
                text={translate('common.confirm')}
                pressOnEnter
                onPress={() => onChange({[filterKey]: value})}
            />
        </View>
    );
}

function CommonContent({filterKey, value: initialValue, type, policyIDs, policyIDQuery, autoFocus, ready, onChange}: CommonContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [value, setValue] = useState<FilterComponentsProps['value']>(initialValue);

    const fullscreen = useFullscreenAdvancedFilters();

    return (
        <FilterComponents
            value={fullscreen ? value : initialValue}
            type={type}
            ready={ready}
            policyIDs={policyIDs}
            filterKey={filterKey}
            policyIDQuery={policyIDQuery}
            selectionListTextInputStyle={!fullscreen && [styles.pb1, styles.pt5]}
            selectionListStyle={!fullscreen ? {contentContainerStyle: [styles.pv2]} : undefined}
            autoFocus={autoFocus}
            onChange={(newValue) => {
                if (fullscreen) {
                    setValue(newValue);
                    return;
                }
                onChange({[filterKey]: newValue} as Partial<SearchAdvancedFiltersForm>);
            }}
            footer={
                fullscreen ? (
                    <Button
                        success
                        large
                        text={translate('common.confirm')}
                        onPress={() => onChange({[filterKey]: value} as Partial<SearchAdvancedFiltersForm>)}
                    />
                ) : undefined
            }
        />
    );
}

function FilterContent({filterKey, values, policyIDQuery, autoFocus, ready, onChange}: FilterContentProps) {
    if (
        filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT ||
        filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION ||
        filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID ||
        filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD ||
        filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE ||
        filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID
    ) {
        return (
            <TextInputFilterContent
                key={filterKey}
                filterKey={filterKey}
                value={values?.[filterKey]}
                autoFocus={autoFocus}
                onChange={onChange}
            />
        );
    }

    if (isAmountFilterKey(filterKey)) {
        return (
            <AmountFilterComponent
                key={filterKey}
                filterKey={filterKey}
                value={{
                    [CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO]: values?.[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO}`],
                    [CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN]: values?.[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}`],
                    [CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN]: values?.[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}`],
                }}
                autoFocus={autoFocus}
                onChange={onChange}
            />
        );
    }

    if (isDateFilterKey(filterKey)) {
        return (
            <DateFilterComponent
                key={filterKey}
                filterKey={filterKey}
                value={{
                    [CONST.SEARCH.DATE_MODIFIERS.ON]: values?.[`${filterKey}${CONST.SEARCH.DATE_MODIFIERS.ON}`],
                    [CONST.SEARCH.DATE_MODIFIERS.AFTER]: values?.[`${filterKey}${CONST.SEARCH.DATE_MODIFIERS.AFTER}`],
                    [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: values?.[`${filterKey}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}`],
                    [CONST.SEARCH.DATE_MODIFIERS.RANGE]: values?.[`${filterKey}${CONST.SEARCH.DATE_MODIFIERS.RANGE}`],
                }}
                hasFeed={!!values?.feed}
                onChange={onChange}
            />
        );
    }

    if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_FIELD) {
        return (
            <ReportFieldFilterComponent
                values={values}
                onChange={onChange}
            />
        );
    }

    return (
        <CommonContent
            key={filterKey}
            filterKey={filterKey}
            value={values?.[filterKey]}
            type={values?.type}
            policyIDs={values?.policyID}
            policyIDQuery={policyIDQuery}
            autoFocus={autoFocus}
            ready={ready}
            onChange={onChange}
        />
    );
}

export default FilterContent;
