import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';

import useLocalize from '@hooks/useLocalize';

import {getReportFieldAlternativeTextTranslationKey, getReportFieldTypeTranslationKey} from '@libs/WorkspaceReportFieldUtils';

import CONST from '@src/CONST';
import type {PolicyReportFieldType} from '@src/types/onyx/Policy';

import React from 'react';

type ReportFieldItemType = {
    value: PolicyReportFieldType;
    text: string;
    keyForList: string;
    isSelected: boolean;
};

type ReportFieldTypePickerProps = {
    defaultValue?: PolicyReportFieldType;
    onOptionSelected: (reportField: ReportFieldItemType) => void;
};

function ReportFieldTypePicker({defaultValue, onOptionSelected}: ReportFieldTypePickerProps) {
    const {translate} = useLocalize();

    const typeOptions = Object.values(CONST.REPORT_FIELD_TYPES).map((reportFieldType) => ({
        keyForList: reportFieldType,
        value: reportFieldType,
        isSelected: defaultValue === reportFieldType,
        text: translate(getReportFieldTypeTranslationKey(reportFieldType)),
        alternateText: translate(getReportFieldAlternativeTextTranslationKey(reportFieldType)),
    }));
    const selectedOption = typeOptions.find((reportField) => reportField.isSelected)?.keyForList;

    return (
        <SelectionList
            data={typeOptions}
            ListItem={SingleSelectListItem}
            onSelectRow={onOptionSelected}
            addBottomSafeAreaPadding
            initiallyFocusedItemKey={selectedOption}
        />
    );
}

export default ReportFieldTypePicker;

export type {ReportFieldItemType};
