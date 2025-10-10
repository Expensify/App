import React from 'react';
import type {PolicyReportField} from '@src/types/onyx';

type ReportFieldTextProps = {
    field: PolicyReportField;
    close: () => void;
};

function ReportFieldText({field, close}: ReportFieldTextProps) {
    return <></>;
}

ReportFieldText.displayName = 'SearchFiltersReportFieldPage';

export default ReportFieldText;
