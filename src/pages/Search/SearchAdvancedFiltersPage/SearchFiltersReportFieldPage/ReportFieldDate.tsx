import React from 'react';
import type {PolicyReportField} from '@src/types/onyx';

type ReportFieldDateProps = {
    field: PolicyReportField;
    values: Record<string, string | string[] | null>;
    setValues: React.Dispatch<React.SetStateAction<Record<string, string | string[] | null>>>;
};

function ReportFieldDate({field, values, setValues}: ReportFieldDateProps) {
    return <></>;
}

ReportFieldDate.displayName = 'SearchFiltersReportFieldPage';

export default ReportFieldDate;
