import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetSuiteCustomFieldAddFormSubmit from '@hooks/useNetSuiteCustomFieldAddFormSubmit';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import NetSuiteCustomSegmentTypePicker from '@pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldNew/NetSuiteCustomSegmentTypePicker';
import type {CustomFieldSubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';

function ChooseSegmentTypeStep({onNext, isEditing}: CustomFieldSubStepWithPolicy) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const handleSubmit = useNetSuiteCustomFieldAddFormSubmit({
        fieldIds: [INPUT_IDS.CUSTOM_SEGMENT_TYPE],
        onNext,
        shouldSaveDraft: isEditing,
    });

    const [formValues] = useOnyx(ONYXKEYS.FORMS.NETSUITE_CUSTOM_FIELD_ADD_FORM_DRAFT);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_FIELD_ADD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_FIELD_ADD_FORM> =>
            ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.CUSTOM_SEGMENT_TYPE]),
        [],
    );

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.NETSUITE_CUSTOM_FIELD_ADD_FORM}
            submitButtonText={translate('common.next')}
            onSubmit={handleSubmit}
            validate={validate}
            style={[styles.flexGrow1]}
            submitButtonStyles={[styles.ph5, styles.mb0]}
        >
            <Text style={[styles.ph5, styles.textHeadlineLineHeightXXL, styles.mb3]}>
                {translate(`workspace.netsuite.import.importCustomFields.customSegments.addForm.segmentRecordType`)}
            </Text>
            <Text style={[styles.ph5, styles.mb3]}>{translate(`workspace.netsuite.import.importCustomFields.chooseOptionBelow`)}</Text>
            <InputWrapper
                InputComponent={NetSuiteCustomSegmentTypePicker}
                inputID={INPUT_IDS.CUSTOM_SEGMENT_TYPE}
                shouldSaveDraft={!isEditing}
                value={formValues?.[INPUT_IDS.CUSTOM_SEGMENT_TYPE] ?? CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT}
            />
        </FormProvider>
    );
}

ChooseSegmentTypeStep.displayName = 'ChooseSegmentTypeStep';
export default ChooseSegmentTypeStep;
