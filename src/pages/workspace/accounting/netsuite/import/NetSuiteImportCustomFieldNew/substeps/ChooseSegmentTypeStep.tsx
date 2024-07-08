import React from 'react';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {CustomFieldSubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import * as FormActions from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';

function ChooseSegmentTypeStep({onNext, customSegmentType}: CustomFieldSubStepWithPolicy) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const selectionData = [
        {
            text: translate(`workspace.netsuite.import.importCustomFields.customSegments.addForm.segmentTitle`),
            keyForList: CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT,
            isSelected: customSegmentType === CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT,
            value: CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT,
        },
        {
            text: translate(`workspace.netsuite.import.importCustomFields.customSegments.addForm.recordTitle`),
            keyForList: CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_RECORD,
            isSelected: customSegmentType === CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_RECORD,
            value: CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_RECORD,
        },
    ];

    return (
        <>
            <Text style={[styles.ph5, styles.textHeadlineLineHeightXXL, styles.mb3]}>
                {translate(`workspace.netsuite.import.importCustomFields.customSegments.addForm.segmentRecordType`)}
            </Text>
            <Text style={[styles.ph5, styles.mb3]}>{translate(`workspace.netsuite.import.importCustomFields.chooseOptionBelow`)}</Text>
            <SelectionList
                sections={[{data: selectionData}]}
                ListItem={RadioListItem}
                initiallyFocusedOptionKey={customSegmentType}
                onSelectRow={(selected) => {
                    FormActions.setDraftValues(ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM, {[INPUT_IDS.CUSTOM_SEGMENT_RECORD_TYPE]: selected.value});
                    onNext();
                }}
            />
        </>
    );
}

ChooseSegmentTypeStep.displayName = 'ChooseSegmentTypeStep';
export default ChooseSegmentTypeStep;
