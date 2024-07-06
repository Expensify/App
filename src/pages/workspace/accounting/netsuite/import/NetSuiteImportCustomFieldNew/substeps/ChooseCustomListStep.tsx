import React, {useCallback} from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetSuiteCustomFieldAddFormSubmit from '@hooks/useNetSuiteCustomFieldAddFormSubmit';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import NetSuiteCustomListPicker from '@pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldNew/NetSuiteCustomListPicker';
import type {CustomFieldSubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';

function ChooseCustomListStep({onNext, isEditing, policy}: CustomFieldSubStepWithPolicy) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const handleSubmit = useNetSuiteCustomFieldAddFormSubmit({
        fieldIds: [INPUT_IDS.LIST_NAME],
        onNext,
        shouldSaveDraft: isEditing,
    });

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_FIELD_ADD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_FIELD_ADD_FORM> =>
            ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.LIST_NAME]),
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
            <Text style={[styles.mb3, styles.ph5, styles.textHeadlineLineHeightXXL]}>{translate(`workspace.netsuite.import.importCustomFields.customLists.addForm.listNameTitle`)}</Text>
            <InputWrapper
                InputComponent={NetSuiteCustomListPicker}
                inputID={INPUT_IDS.LIST_NAME}
                shouldSaveDraft={!isEditing}
                policy={policy}
            />
        </FormProvider>
    );
}

ChooseCustomListStep.displayName = 'ChooseCustomListStep';
export default ChooseCustomListStep;
