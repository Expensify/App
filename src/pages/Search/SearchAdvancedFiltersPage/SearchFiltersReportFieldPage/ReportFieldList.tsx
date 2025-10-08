import React from 'react';
import type {PolicyReportField} from '@src/types/onyx';

type ReportFieldListProps = {
    field: PolicyReportField;
    values: Record<string, string | string[]>;
    setValues: React.Dispatch<React.SetStateAction<Record<string, string | string[]>>>;
};

function ReportFieldList({field, values, setValues}: ReportFieldListProps) {
    return <></>;
}

ReportFieldList.displayName = 'SearchFiltersReportFieldPage';

export default ReportFieldList;
