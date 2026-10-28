import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import FormHeader from '@components/Form/Layout/FormHeader';
import FormMenuRows from '@components/Form/Layout/FormMenuRows';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';

import useLocalize from '@hooks/useLocalize';
import useNetSuiteImportAddCustomSegmentFormSubmit from '@hooks/useNetSuiteImportAddCustomSegmentForm';
import useThemeStyles from '@hooks/useThemeStyles';

import {isRequiredFulfilled} from '@libs/ValidationUtils';

import NetSuiteCustomSegmentMappingPicker from '@pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldNew/NetSuiteCustomSegmentMappingPicker';
import type {CustomFieldSubPageWithPolicy} from '@pages/workspace/accounting/netsuite/types';

import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';

import type {ValueOf} from 'type-fest';

import React from 'react';

const STEP_FIELDS = [INPUT_IDS.SEGMENT_TYPE];

function ChooseSegmentTypeStep({onNext, setCustomSegmentType, isEditing, netSuiteCustomFieldFormValues}: CustomFieldSubPageWithPolicy) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM> = {};

        if (!isRequiredFulfilled(values[INPUT_IDS.SEGMENT_TYPE])) {
            errors[INPUT_IDS.SEGMENT_TYPE] = translate('common.error.pleaseSelectOne');
        }

        return errors;
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
            validate={validate}
            style={[styles.flexGrow1]}
            submitButtonStyles={styles.ph5}
            enabledWhenOffline
            shouldUseScrollView
            shouldHideFixErrorsAlert
            submitFlexEnabled={false}
            addBottomSafeAreaPadding
        >
            <FormHeader
                title={translate(`workspace.netsuite.import.importCustomFields.customSegments.addForm.segmentRecordType`)}
                description={translate(`workspace.netsuite.import.importCustomFields.chooseOptionBelow`)}
                style={styles.ph5}
            />
            <FormMenuRows style={styles.flex1}>
                <InputWrapper
                    InputComponent={NetSuiteCustomSegmentMappingPicker}
                    inputID={INPUT_IDS.SEGMENT_TYPE}
                    defaultValue={netSuiteCustomFieldFormValues[INPUT_IDS.SEGMENT_TYPE]}
                    shouldSaveDraft
                />
            </FormMenuRows>
        </FormProvider>
    );
}

export default ChooseSegmentTypeStep;
