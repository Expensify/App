import React, {useCallback} from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetSuiteImportAddCustomListFormSubmit from '@hooks/useNetSuiteImportAddCustomListForm';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import NetSuiteCustomListPicker from '@pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldNew/NetSuiteCustomListPicker';
import type {CustomFieldSubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';

const STEP_FIELDS = [INPUT_IDS.LIST_NAME, INPUT_IDS.INTERNAL_ID];

function ChooseCustomListStep({policy, onNext, isEditing, netSuiteCustomFieldFormValues}: CustomFieldSubStepWithPolicy) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM> => {
        return getFieldRequiredErrors(values, [INPUT_IDS.LIST_NAME]);
    }, []);

    const handleSubmit = useNetSuiteImportAddCustomListFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: true,
    });

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            validate={validate}
            style={[styles.flexGrow1, styles.mt3]}
            submitButtonStyles={[styles.ph5, styles.mb0]}
            enabledWhenOffline
            submitFlexEnabled
            shouldUseScrollView
            shouldHideFixErrorsAlert
            addBottomSafeAreaPadding
        >
            <Text style={[styles.mb3, styles.ph5, styles.textHeadlineLineHeightXXL]}>{translate(`workspace.netsuite.import.importCustomFields.customLists.addForm.listNameTitle`)}</Text>
            <InputWrapper
                InputComponent={NetSuiteCustomListPicker}
                inputID={INPUT_IDS.LIST_NAME}
                policy={policy}
                internalIDInputID={INPUT_IDS.INTERNAL_ID}
                defaultValue={netSuiteCustomFieldFormValues[INPUT_IDS.LIST_NAME]}
            />
        </FormProvider>
    );
}

export default ChooseCustomListStep;
