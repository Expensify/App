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
import NetSuiteCustomFieldMappingPicker from '@pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldNew/NetSuiteCustomFieldMappingPicker';
import type {CustomFieldSubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';

function MappingStep({onNext, isEditing, importCustomField}: CustomFieldSubStepWithPolicy) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const handleSubmit = useNetSuiteCustomFieldAddFormSubmit({
        fieldIds: [INPUT_IDS.MAPPING],
        onNext,
        shouldSaveDraft: isEditing,
    });

    const [formValuesDraft] = useOnyx(ONYXKEYS.FORMS.NETSUITE_CUSTOM_FIELD_ADD_FORM_DRAFT);
    let titleKey;
    if (importCustomField === CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_LISTS) {
        titleKey = 'workspace.netsuite.import.importCustomFields.customLists.addForm.mappingTitle';
    } else {
        const customSegmentRecordType = formValuesDraft?.[INPUT_IDS.CUSTOM_SEGMENT_TYPE] ?? CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT;
        titleKey = `workspace.netsuite.import.importCustomFields.customSegments.addForm.${customSegmentRecordType}MappingTitle`;
    }

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_FIELD_ADD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_FIELD_ADD_FORM> =>
            ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.MAPPING]),
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
            <Text style={[styles.ph5, styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate(titleKey as TranslationPaths)}</Text>
            <Text style={[styles.ph5, styles.mb3]}>{translate(`workspace.netsuite.import.importCustomFields.chooseOptionBelow`)}</Text>
            <InputWrapper
                InputComponent={NetSuiteCustomFieldMappingPicker}
                inputID={INPUT_IDS.MAPPING}
                shouldSaveDraft={!isEditing}
                defaultValue={CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG}
            />
        </FormProvider>
    );
}

MappingStep.displayName = 'MappingStep';
export default MappingStep;
