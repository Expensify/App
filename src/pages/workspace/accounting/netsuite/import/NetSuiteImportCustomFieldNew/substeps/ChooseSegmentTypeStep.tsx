import React, {useState} from 'react';
import type {ValueOf} from 'type-fest';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {CustomFieldSubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import CONST from '@src/CONST';

function ChooseSegmentTypeStep({onNext, setCustomSegmentType}: CustomFieldSubStepWithPolicy) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [segmentType, onSegmentTypeChange] = useState<ValueOf<typeof CONST.NETSUITE_CUSTOM_RECORD_TYPES>>(CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT);

    const selectionData = [
        {
            text: translate(`workspace.netsuite.import.importCustomFields.customSegments.addForm.segmentTitle`),
            keyForList: CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT,
            isSelected: segmentType === CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT,
            value: CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT,
        },
        {
            text: translate(`workspace.netsuite.import.importCustomFields.customSegments.addForm.recordTitle`),
            keyForList: CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_RECORD,
            isSelected: segmentType === CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_RECORD,
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
                onSelectRow={(selected) => onSegmentTypeChange(selected.value)}
                ListItem={RadioListItem}
                initiallyFocusedOptionKey={segmentType ?? CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT}
                showConfirmButton
                onConfirm={() => {
                    setCustomSegmentType?.(segmentType);
                    onNext();
                }}
                confirmButtonText={translate('common.next')}
            />
        </>
    );
}

ChooseSegmentTypeStep.displayName = 'ChooseSegmentTypeStep';
export default ChooseSegmentTypeStep;
