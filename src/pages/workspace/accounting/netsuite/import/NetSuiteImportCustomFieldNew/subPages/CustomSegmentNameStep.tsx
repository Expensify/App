import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import FormFieldGroup from '@components/Form/Layout/FormFieldGroup';
import FormHeader from '@components/Form/Layout/FormHeader';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import RenderHTML from '@components/RenderHTML';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useNetSuiteImportAddCustomSegmentFormSubmit from '@hooks/useNetSuiteImportAddCustomSegmentForm';
import useThemeStyles from '@hooks/useThemeStyles';

import Parser from '@libs/Parser';
import {isRequiredFulfilled} from '@libs/ValidationUtils';

import type {CustomFieldSubPageWithPolicy} from '@pages/workspace/accounting/netsuite/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';

import React from 'react';
import {View} from 'react-native';

const STEP_FIELDS = [INPUT_IDS.SEGMENT_NAME];
function CustomSegmentNameStep({customSegmentType, onNext, isEditing, customSegments}: CustomFieldSubPageWithPolicy) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const fieldLabel = translate(`workspace.netsuite.import.importCustomFields.customSegments.fields.segmentName`);

    const customSegmentRecordType = customSegmentType ?? CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT;

    const handleSubmit = useNetSuiteImportAddCustomSegmentFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: true,
    });

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM> = {};

        if (!isRequiredFulfilled(values[INPUT_IDS.SEGMENT_NAME])) {
            errors[INPUT_IDS.SEGMENT_NAME] = translate(
                'workspace.netsuite.import.importCustomFields.requiredFieldError',
                translate(`workspace.netsuite.import.importCustomFields.customSegments.addForm.${customSegmentRecordType}Name`),
            );
        } else if (customSegments?.find((customSegment) => customSegment.segmentName.toLowerCase() === values[INPUT_IDS.SEGMENT_NAME].toLowerCase())) {
            errors[INPUT_IDS.SEGMENT_NAME] = translate('workspace.netsuite.import.importCustomFields.customSegments.errors.uniqueFieldError', fieldLabel);
        }
        return errors;
    };

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            validate={validate}
            style={[styles.flexGrow1]}
            submitButtonStyles={styles.ph5}
            enabledWhenOffline
            submitFlexEnabled
            shouldUseScrollView
            shouldHideFixErrorsAlert
            addBottomSafeAreaPadding
        >
            <FormHeader
                title={translate(`workspace.netsuite.import.importCustomFields.customSegments.addForm.${customSegmentRecordType}NameTitle`)}
                style={styles.ph5}
            />
            <FormFieldGroup style={styles.ph5}>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.SEGMENT_NAME}
                    label={fieldLabel}
                    aria-label={fieldLabel}
                    role={CONST.ROLE.PRESENTATION}
                    spellCheck={false}
                    ref={inputCallbackRef}
                />
                <View style={[styles.flex1, styles.renderHTML, styles.textDecorationSkipInkNone]}>
                    <RenderHTML
                        html={`<comment>${Parser.replace(translate(`workspace.netsuite.import.importCustomFields.customSegments.addForm.${customSegmentRecordType}NameFooter`))}</comment>`}
                    />
                </View>
            </FormFieldGroup>
        </FormProvider>
    );
}

export default CustomSegmentNameStep;
