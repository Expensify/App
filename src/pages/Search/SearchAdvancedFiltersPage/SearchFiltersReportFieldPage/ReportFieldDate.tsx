import React from 'react';
import type {PolicyReportField} from '@src/types/onyx';

type ReportFieldDateProps = {
    field: PolicyReportField;
    close: () => void;
};

function ReportFieldDate({field, close}: ReportFieldDateProps) {
    return <></>;
}

ReportFieldDate.displayName = 'SearchFiltersReportFieldPage';

export default ReportFieldDate;
