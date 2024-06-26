import React, {useMemo} from 'react';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import {getReportFieldAlternativeTextTranslationKey, getReportFieldTypeTranslationKey} from '@libs/WorkspaceReportFieldsUtils';
import CONST from '@src/CONST';
import type {PolicyReportFieldType} from '@src/types/onyx/Policy';

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
    const {translate} = useLocalize();

    const reportFieldOptions = useMemo(
        () =>
            Object.values(CONST.REPORT_FIELD_TYPES).map((reportFieldType) => ({
                keyForList: reportFieldType,
                value: reportFieldType,
                isSelected: defaultValue === reportFieldType,
                text: translate(getReportFieldTypeTranslationKey(reportFieldType)),
                alternateText: translate(getReportFieldAlternativeTextTranslationKey(reportFieldType)),
            })),
        [defaultValue, translate],
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
