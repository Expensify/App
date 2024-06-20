import {Str} from 'expensify-common';
import React, {useMemo} from 'react';
import CONST from '@src/CONST';
import type {PolicyReportFieldType} from '@src/types/onyx/Policy';
import SelectionList from './SelectionList';
import RadioListItem from './SelectionList/RadioListItem';

type ReportFieldItemType = {
    value: PolicyReportFieldType;
    text: string;
    keyForList: string;
    isSelected: boolean;
};

type ReportFieldTypePickerProps = {
    defaultValue: PolicyReportFieldType;
    onOptionSelected: (reportField: ReportFieldItemType) => void;
};

function ReportFieldTypePicker({defaultValue, onOptionSelected}: ReportFieldTypePickerProps) {
    const reportFieldOptions = useMemo(
        () =>
            Object.values(CONST.REPORT_FIELD_TYPES).map((reportField) => ({
                value: reportField,
                // TODO: Add translation here
                text: Str.recapitalize(reportField),
                keyForList: reportField,
                isSelected: defaultValue === reportField,
            })),
        [defaultValue],
    );

    return (
        <SelectionList
            sections={[{data: reportFieldOptions}]}
            ListItem={RadioListItem}
            onSelectRow={onOptionSelected}
            initiallyFocusedOptionKey={reportFieldOptions.find((reportField) => reportField.isSelected)?.keyForList}
        />
    );
}

ReportFieldTypePicker.displayName = 'ReportFieldTypePicker';

export default ReportFieldTypePicker;

export type {ReportFieldItemType};
