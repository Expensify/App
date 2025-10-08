import React from 'react';
import type {PolicyReportField} from '@src/types/onyx';

type ReportFieldTextProps = {
    field: PolicyReportField;
    values: Record<string, string | string[] | null>;
    close: () => void;
    setValues: React.Dispatch<React.SetStateAction<Record<string, string | string[] | null>>>;
};

function ReportFieldText({field, values, close, setValues}: ReportFieldTextProps) {
    return <></>;
}

ReportFieldText.displayName = 'SearchFiltersReportFieldPage';

export default ReportFieldText;
