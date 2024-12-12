import React, {useMemo} from 'react';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import * as WorkspaceReportFieldUtils from '@libs/WorkspaceReportFieldUtils';
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

    const typeSections = useMemo(() => {
        const data = Object.values(CONST.REPORT_FIELD_TYPES).map((reportFieldType) => ({
            keyForList: reportFieldType,
            value: reportFieldType,
            isSelected: defaultValue === reportFieldType,
            text: translate(WorkspaceReportFieldUtils.getReportFieldTypeTranslationKey(reportFieldType)),
            alternateText: translate(WorkspaceReportFieldUtils.getReportFieldAlternativeTextTranslationKey(reportFieldType)),
        }));

        return [{data}];
    }, [defaultValue, translate]);

    return (
        <SelectionList
            sections={typeSections}
            ListItem={RadioListItem}
            onSelectRow={onOptionSelected}
            initiallyFocusedOptionKey={typeSections.at(0)?.data?.find((reportField) => reportField.isSelected)?.keyForList}
        />
    );
}

ReportFieldTypePicker.displayName = 'ReportFieldTypePicker';

export default ReportFieldTypePicker;

export type {ReportFieldItemType};
