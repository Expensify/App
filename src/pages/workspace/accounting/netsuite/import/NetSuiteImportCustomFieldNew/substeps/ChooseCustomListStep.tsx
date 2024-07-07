import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetSuiteCustomFieldAddFormSubmit from '@hooks/useNetSuiteCustomFieldAddFormSubmit';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAddCustomLisFormRecord} from '@libs/actions/Policy/Policy';
import * as ValidationUtils from '@libs/ValidationUtils';
import NetSuiteCustomListPicker from '@pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldNew/NetSuiteCustomListPicker';
import type {CustomFieldSubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';
import type {NetSuiteCustomList} from '@src/types/onyx/Policy';

function ChooseCustomListStep({onNext, isEditing, policy}: CustomFieldSubStepWithPolicy) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const handleSubmit = useNetSuiteCustomFieldAddFormSubmit({
        fieldIds: [INPUT_IDS.LIST_NAME],
        onNext,
        shouldSaveDraft: isEditing,
    });

    const [formValues] = useOnyx(ONYXKEYS.FORMS.NETSUITE_CUSTOM_FIELD_ADD_FORM_DRAFT);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_FIELD_ADD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_FIELD_ADD_FORM> =>
            ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.LIST_NAME]),
        [],
    );

    const onSelectCustomList = (customList: Partial<NetSuiteCustomList>) => {
        updateAddCustomLisFormRecord(customList);
    };

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
                onSelect={onSelectCustomList}
                defaultValue={formValues?.[INPUT_IDS.LIST_NAME] ?? policy?.connections?.netsuite?.options?.data?.customLists?.[0].id}
            />
        </FormProvider>
    );
}

ChooseCustomListStep.displayName = 'ChooseCustomListStep';
export default ChooseCustomListStep;
