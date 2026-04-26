import React from 'react';
import DateFilterBase from '@components/Search/FilterComponents/DateFilterBase';
import type {ReportFieldDateKey} from '@components/Search/types';
import useOnyx from '@hooks/useOnyx';
import {updateAdvancedFilters} from '@libs/actions/Search';
import {getDateFilterKeys} from '@libs/SearchQueryUtils';
import {getDatePresets} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyReportField} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type ReportFieldDateProps = {
    field: PolicyReportField;
    close: () => void;
};

function ReportFieldDate({field, close}: ReportFieldDateProps) {
    const formKey = `${CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX}${field.name.toLowerCase().replaceAll(' ', '-')}` as const;

    const [searchAdvancedFiltersForm, searchAdvancedFiltersFormMetadata] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const isSearchAdvancedFiltersFormLoading = isLoadingOnyxValue(searchAdvancedFiltersFormMetadata);

    const {dateOnKey, dateBeforeKey, dateAfterKey, dateRangeKey} = getDateFilterKeys(formKey) as {
        dateOnKey: ReportFieldDateKey;
        dateBeforeKey: ReportFieldDateKey;
        dateAfterKey: ReportFieldDateKey;
        dateRangeKey: ReportFieldDateKey;
    };

    const dateOnValue = searchAdvancedFiltersForm?.[dateOnKey];
    const dateBeforeValue = searchAdvancedFiltersForm?.[dateBeforeKey];
    const dateAfterValue = searchAdvancedFiltersForm?.[dateAfterKey];
    const dateRangeValue = searchAdvancedFiltersForm?.[dateRangeKey];

    function getDefaultDateValues() {
        return {
            [CONST.SEARCH.DATE_MODIFIERS.ON]: dateOnValue,
            [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: dateBeforeValue,
            [CONST.SEARCH.DATE_MODIFIERS.AFTER]: dateAfterValue,
            [CONST.SEARCH.DATE_MODIFIERS.RANGE]: dateRangeValue,
        };
    }

    function getPresets() {
        const hasFeed = !!searchAdvancedFiltersForm?.feed?.length;
        return getDatePresets(formKey, hasFeed);
    }

    const updateFilter = (values: Record<string, string | undefined>) => {
        updateAdvancedFilters({
            [dateOnKey]: values[CONST.SEARCH.DATE_MODIFIERS.ON] ?? null,
            [dateBeforeKey]: values[CONST.SEARCH.DATE_MODIFIERS.BEFORE] ?? null,
            [dateAfterKey]: values[CONST.SEARCH.DATE_MODIFIERS.AFTER] ?? null,
            [dateRangeKey]: values[CONST.SEARCH.DATE_MODIFIERS.RANGE] ?? null,
        });
        close();
    };

    const defaultDateValues = getDefaultDateValues();
    const presets = getPresets();

    return (
        <DateFilterBase
            title={field.name}
            defaultDateValues={defaultDateValues}
            presets={presets}
            isSearchAdvancedFiltersFormLoading={isSearchAdvancedFiltersFormLoading}
            onBackButtonPress={close}
            onSubmit={updateFilter}
            onReset={(values) => {
                updateAdvancedFilters({
                    [dateOnKey]: values[CONST.SEARCH.DATE_MODIFIERS.ON] ?? null,
                    [dateBeforeKey]: values[CONST.SEARCH.DATE_MODIFIERS.BEFORE] ?? null,
                    [dateAfterKey]: values[CONST.SEARCH.DATE_MODIFIERS.AFTER] ?? null,
                    [dateRangeKey]: values[CONST.SEARCH.DATE_MODIFIERS.RANGE] ?? null,
                });
            }}
        />
    );
}

export default ReportFieldDate;
