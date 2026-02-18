import React, {useCallback} from 'react';
import type {ValueOf} from 'type-fest';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetSuiteImportAddCustomSegmentFormSubmit from '@hooks/useNetSuiteImportAddCustomSegmentForm';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import NetSuiteCustomSegmentMappingPicker from '@pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldNew/NetSuiteCustomSegmentMappingPicker';
import type {CustomFieldSubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';

const STEP_FIELDS = [INPUT_IDS.SEGMENT_TYPE];

function ChooseSegmentTypeStep({onNext, setCustomSegmentType, isEditing, netSuiteCustomFieldFormValues}: CustomFieldSubStepWithPolicy) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM> => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM> = {};

            if (!ValidationUtils.isRequiredFulfilled(values[INPUT_IDS.SEGMENT_TYPE])) {
                errors[INPUT_IDS.SEGMENT_TYPE] = translate('common.error.pleaseSelectOne');
            }

            return errors;
        },
        [translate],
    );

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
            validate={validate}
            style={[styles.flexGrow1]}
            submitButtonStyles={[styles.ph5, styles.mb0]}
            enabledWhenOffline
            shouldUseScrollView
            shouldHideFixErrorsAlert
            submitFlexEnabled={false}
            addBottomSafeAreaPadding
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

export default ChooseSegmentTypeStep;
