import React from 'react';
import SingleSelect from '@components/Search/FilterComponents/SingleSelect';
import type {PolicyReportField} from '@src/types/onyx';

type ReportFieldListProps = {
    field: PolicyReportField;
    value: string;
    onChange: (newValue: string) => void;
};

function ReportFieldList({field, value, onChange}: ReportFieldListProps) {
    const items = field.values.map((fieldValue) => ({
        value: fieldValue,
        text: fieldValue,
    }));
    const selectedValue = {text: value, value};

    return (
        <SingleSelect
            items={items}
            value={selectedValue}
            onChange={(item) => onChange(item.value)}
            hasHeader
        />
    );
}

export default ReportFieldList;
