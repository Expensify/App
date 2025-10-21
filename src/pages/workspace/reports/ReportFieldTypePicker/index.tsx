import React from 'react';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import {getReportFieldAlternativeTextTranslationKey, getReportFieldTypeTranslationKey} from '@libs/WorkspaceReportFieldUtils';
import CONST from '@src/CONST';
import type {PolicyReportFieldType} from '@src/types/onyx/Policy';

type ReportFieldItemType = {
    /** The value */
    value: PolicyReportFieldType;

    /** The display text */
    text: string;

    /** The key for list */
    keyForList: string;

    /** Whether the value is selected */
    isSelected: boolean;
};

type ReportFieldTypePickerProps = {
    /** Currently selected report field type */
    defaultValue: PolicyReportFieldType;

    /** Function to call when the user selects a report field type */
    onOptionSelected: (reportField: ReportFieldItemType) => void;
};

function ReportFieldTypePicker({defaultValue, onOptionSelected}: ReportFieldTypePickerProps) {
    const {translate} = useLocalize();

    const typeOptions = Object.values(CONST.REPORT_FIELD_TYPES)
        .map((reportFieldType) => {
            // Formula type is not selectable when adding report fields
            if (reportFieldType === CONST.REPORT_FIELD_TYPES.FORMULA) {
                return null;
            }
            return {
                keyForList: reportFieldType,
                value: reportFieldType,
                isSelected: defaultValue === reportFieldType,
                text: translate(getReportFieldTypeTranslationKey(reportFieldType)),
                alternateText: translate(getReportFieldAlternativeTextTranslationKey(reportFieldType)),
            };
        })
        .filter(Boolean) as ReportFieldItemType[];
    const selectedOption = typeOptions.find((reportField) => reportField.isSelected)?.keyForList;

    return (
        <SelectionList
            data={typeOptions}
            ListItem={RadioListItem}
            onSelectRow={onOptionSelected}
            addBottomSafeAreaPadding
            initiallyFocusedItemKey={selectedOption}
        />
    );
}

ReportFieldTypePicker.displayName = 'ReportFieldTypePicker';

export default ReportFieldTypePicker;

export type {ReportFieldItemType};
