import React from 'react';
import DateFilterBase from '@components/Search/FilterComponents/DateFilterBase';
import {updateAdvancedFilters} from '@libs/actions/Search';
import CONST from '@src/CONST';
import type {PolicyReportField} from '@src/types/onyx';

type ReportFieldDateProps = {
    field: PolicyReportField;
    close: () => void;
};

function ReportFieldDate({field, close}: ReportFieldDateProps) {
    const formKey = `${CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX}${field.name.toLowerCase().replaceAll(' ', '-')}` as const;

    const updateFilter = (values: Record<string, string | null>) => {
        updateAdvancedFilters(values);
        close();
    };

    return (
        <DateFilterBase
            title={field.name}
            dateKey={formKey}
            back={close}
            onSubmit={updateFilter}
        />
    );
}

export default ReportFieldDate;
