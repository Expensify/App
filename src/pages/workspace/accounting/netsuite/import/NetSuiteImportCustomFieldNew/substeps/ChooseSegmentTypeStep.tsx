import React, {useState} from 'react';
import {View} from 'react-native';
import FormHelpMessage from '@components/FormHelpMessage';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {CustomFieldSubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import CONST from '@src/CONST';

function ChooseSegmentTypeStep({onNext, customSegmentType, setCustomSegmentType}: CustomFieldSubStepWithPolicy) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [selectedType, setSelectedType] = useState(customSegmentType);
    const [isError, setIsError] = useState(false);

    const selectionData = [
        {
            text: translate(`workspace.netsuite.import.importCustomFields.customSegments.addForm.segmentTitle`),
            keyForList: CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT,
            isSelected: selectedType === CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT,
            value: CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT,
        },
        {
            text: translate(`workspace.netsuite.import.importCustomFields.customSegments.addForm.recordTitle`),
            keyForList: CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_RECORD,
            isSelected: selectedType === CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_RECORD,
            value: CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_RECORD,
        },
    ];

    const onConfirm = () => {
        if (!selectedType) {
            setIsError(true);
        } else {
            setCustomSegmentType?.(selectedType);
            onNext();
        }
    };

    return (
        <>
            <Text style={[styles.ph5, styles.textHeadlineLineHeightXXL, styles.mb3]}>
                {translate(`workspace.netsuite.import.importCustomFields.customSegments.addForm.segmentRecordType`)}
            </Text>
            <Text style={[styles.ph5, styles.mb3]}>{translate(`workspace.netsuite.import.importCustomFields.chooseOptionBelow`)}</Text>
            <SelectionList
                sections={[{data: selectionData}]}
                ListItem={RadioListItem}
                initiallyFocusedOptionKey={selectedType}
                onSelectRow={(selected) => {
                    setSelectedType(selected.value);
                    setIsError(false);
                }}
                shouldSingleExecuteRowSelect
                shouldUpdateFocusedIndex
                showConfirmButton
                confirmButtonText={translate('common.next')}
                onConfirm={onConfirm}
            >
                {isError && (
                    <View style={[styles.ph5, styles.mb5]}>
                        <FormHelpMessage
                            isError={isError}
                            message={translate('common.error.pleaseSelectOne')}
                        />
                    </View>
                )}
            </SelectionList>
        </>
    );
}

ChooseSegmentTypeStep.displayName = 'ChooseSegmentTypeStep';
export default ChooseSegmentTypeStep;
