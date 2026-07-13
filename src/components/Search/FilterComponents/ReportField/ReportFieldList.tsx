import SingleSelect from '@components/Search/FilterComponents/SingleSelect';

import type {PolicyReportField} from '@src/types/onyx';

import React from 'react';

type ReportFieldListProps = {
    field: PolicyReportField;
    value: string | undefined;
    onChange: (newValue: string | undefined) => void;
};

function ReportFieldList({field, value, onChange}: ReportFieldListProps) {
    const items = field.values.map((fieldValue) => ({
        value: fieldValue,
        text: fieldValue,
    }));
    const selectedValue = value ? {text: value, value} : undefined;

    return (
        <SingleSelect
            items={items}
            value={selectedValue}
            allowDeselect
            onChange={(item) => onChange(item?.value)}
            hasHeader
        />
    );
}

export default ReportFieldList;
