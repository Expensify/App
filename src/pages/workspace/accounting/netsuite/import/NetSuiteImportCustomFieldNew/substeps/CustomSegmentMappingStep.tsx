import React, {useCallback} from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetSuiteImportAddCustomListFormSubmit from '@hooks/useNetSuiteImportAddCustomListForm';
import useNetSuiteImportAddCustomSegmentFormSubmit from '@hooks/useNetSuiteImportAddCustomSegmentForm';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import NetSuiteCustomFieldMappingPicker from '@pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldNew/NetSuiteCustomFieldMappingPicker';
import type {CustomFieldSubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';

const STEP_FIELDS = [INPUT_IDS.MAPPING];

function CustomSegmentMappingStep({importCustomField, customSegmentType, onNext, isEditing, netSuiteCustomFieldFormValues, isCustomlist}: CustomFieldSubStepWithPolicy) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM> = {};

        if (!ValidationUtils.isRequiredFulfilled(values[INPUT_IDS.MAPPING])) {
            errors[INPUT_IDS.MAPPING] = translate('common.error.pleaseSelectOne');
        }

        return errors;
    }, []);

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
            style={[styles.flexGrow1, styles.mt3]}
            submitButtonStyles={[styles.ph5, styles.mb0]}
            enabledWhenOffline
        >
            <Text style={[styles.ph5, styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate(titleKey as TranslationPaths)}</Text>
            <Text style={[styles.ph5, styles.mb3]}>{translate(`workspace.netsuite.import.importCustomFields.chooseOptionBelow`)}</Text>
            <InputWrapper
                InputComponent={NetSuiteCustomFieldMappingPicker}
                inputID={INPUT_IDS.MAPPING}
                defaultValue={netSuiteCustomFieldFormValues[INPUT_IDS.MAPPING]}
                shouldSaveDraft
            />
        </FormProvider>
    );
}

CustomSegmentMappingStep.displayName = 'CustomSegmentMappingStep';
export default CustomSegmentMappingStep;
