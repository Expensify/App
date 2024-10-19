import React, {useState} from 'react';
import {ValueOf} from 'type-fest';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetSuiteImportAddCustomSegmentFormSubmit from '@hooks/useNetSuiteImportAddCustomSegmentForm';
import useThemeStyles from '@hooks/useThemeStyles';
import type {CustomFieldSubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';
import NetSuiteCustomSegmentMappingPicker from '../NetSuiteCustomSegmentMappingPicker';

const STEP_FIELDS = [INPUT_IDS.SEGMENT_TYPE];

function ChooseSegmentTypeStep({onNext, customSegmentType, setCustomSegmentType, isEditing, netSuiteCustomFieldFormValues}: CustomFieldSubStepWithPolicy) {
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

    const handleSubmit = useNetSuiteImportAddCustomSegmentFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext: () => {
            setCustomSegmentType?.(netSuiteCustomFieldFormValues[INPUT_IDS.SEGMENT_TYPE] as ValueOf<typeof CONST.NETSUITE_CUSTOM_RECORD_TYPES>);
            onNext();
        },
        shouldSaveDraft: true,
    });

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            style={[styles.flexGrow1, styles.mt3]}
            submitButtonStyles={[styles.ph5, styles.mb0]}
            enabledWhenOffline
            submitFlexEnabled
            shouldUseScrollView
        >
            <Text style={[styles.ph5, styles.textHeadlineLineHeightXXL, styles.mb3]}>
                {translate(`workspace.netsuite.import.importCustomFields.customSegments.addForm.segmentRecordType`)}
            </Text>
            <Text style={[styles.ph5, styles.mb3]}>{translate(`workspace.netsuite.import.importCustomFields.chooseOptionBelow`)}</Text>
            <InputWrapper
                InputComponent={NetSuiteCustomSegmentMappingPicker}
                inputID={INPUT_IDS.SEGMENT_TYPE}
                defaultValue={netSuiteCustomFieldFormValues[INPUT_IDS.SEGMENT_TYPE]}
                shouldSaveDraft
            />
        </FormProvider>
    );
}

ChooseSegmentTypeStep.displayName = 'ChooseSegmentTypeStep';
export default ChooseSegmentTypeStep;
