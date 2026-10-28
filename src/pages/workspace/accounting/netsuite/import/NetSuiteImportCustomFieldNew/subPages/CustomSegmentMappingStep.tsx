import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import FormHeader from '@components/Form/Layout/FormHeader';
import FormMenuRows from '@components/Form/Layout/FormMenuRows';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';

import useLocalize from '@hooks/useLocalize';
import useNetSuiteImportAddCustomSegmentFormSubmit from '@hooks/useNetSuiteImportAddCustomSegmentForm';
import useThemeStyles from '@hooks/useThemeStyles';

import {isRequiredFulfilled} from '@libs/ValidationUtils';

import NetSuiteCustomFieldMappingPicker from '@pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldNew/NetSuiteCustomFieldMappingPicker';
import type {CustomFieldSubPageWithPolicy} from '@pages/workspace/accounting/netsuite/types';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';

import React from 'react';

const STEP_FIELDS = [INPUT_IDS.MAPPING];

function CustomSegmentMappingStep({importCustomField, customSegmentType, onNext, isEditing, netSuiteCustomFieldFormValues}: CustomFieldSubPageWithPolicy) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // reminder to change the validation logic at the last phase of PR

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM> = {};
        if (!isRequiredFulfilled(values[INPUT_IDS.MAPPING])) {
            errors[INPUT_IDS.MAPPING] = translate('common.error.pleaseSelectOne');
        }
        return errors;
    };

    const handleSubmit = useNetSuiteImportAddCustomSegmentFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: true,
    });

    let titleKey;
    if (importCustomField === CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_LISTS) {
        titleKey = 'workspace.netsuite.import.importCustomFields.customLists.addForm.mappingTitle';
    } else {
        const customSegmentRecordType = customSegmentType ?? CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT;
        titleKey = `workspace.netsuite.import.importCustomFields.customSegments.addForm.${customSegmentRecordType}MappingTitle`;
    }

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            validate={validate}
            style={[styles.flexGrow1]}
            submitButtonStyles={styles.ph5}
            enabledWhenOffline
            shouldUseScrollView={false}
            shouldHideFixErrorsAlert
            submitFlexEnabled={false}
            addBottomSafeAreaPadding
        >
            <FormHeader
                title={translate(titleKey as TranslationPaths)}
                description={translate(`workspace.netsuite.import.importCustomFields.chooseOptionBelow`)}
                style={styles.ph5}
            />
            <FormMenuRows style={styles.flex1}>
                <InputWrapper
                    InputComponent={NetSuiteCustomFieldMappingPicker}
                    inputID={INPUT_IDS.MAPPING}
                    defaultValue={netSuiteCustomFieldFormValues[INPUT_IDS.MAPPING]}
                />
            </FormMenuRows>
        </FormProvider>
    );
}

export default CustomSegmentMappingStep;
