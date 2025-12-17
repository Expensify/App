import React, {useCallback} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useNetSuiteImportAddCustomListFormSubmit from '@hooks/useNetSuiteImportAddCustomListForm';
import useThemeStyles from '@hooks/useThemeStyles';
import Parser from '@libs/Parser';
import {isRequiredFulfilled} from '@libs/ValidationUtils';
import type {CustomFieldSubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';

const STEP_FIELDS = [INPUT_IDS.TRANSACTION_FIELD_ID];

function TransactionFieldIDStep({onNext, isEditing, netSuiteCustomFieldFormValues, customLists}: CustomFieldSubStepWithPolicy) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const fieldLabel = translate(`workspace.netsuite.import.importCustomFields.customLists.fields.transactionFieldID`);

    const handleSubmit = useNetSuiteImportAddCustomListFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: true,
    });

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM> => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM> = {};
            if (!isRequiredFulfilled(values[INPUT_IDS.TRANSACTION_FIELD_ID])) {
                errors[INPUT_IDS.TRANSACTION_FIELD_ID] = translate('workspace.netsuite.import.importCustomFields.requiredFieldError', {fieldName: fieldLabel});
            } else if (customLists?.find((customList) => customList.transactionFieldID.toLowerCase() === values[INPUT_IDS.TRANSACTION_FIELD_ID].toLowerCase())) {
                errors[INPUT_IDS.TRANSACTION_FIELD_ID] = translate('workspace.netsuite.import.importCustomFields.customLists.errors.uniqueTransactionFieldIDError');
            }
            return errors;
        },
        [customLists, translate, fieldLabel],
    );

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
            <View style={styles.ph5}>
                <Text style={[styles.mb3, styles.textHeadlineLineHeightXXL]}>{translate(`workspace.netsuite.import.importCustomFields.customLists.addForm.transactionFieldIDTitle`)}</Text>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.TRANSACTION_FIELD_ID}
                    label={fieldLabel}
                    aria-label={fieldLabel}
                    role={CONST.ROLE.PRESENTATION}
                    spellCheck={false}
                    ref={inputCallbackRef}
                    defaultValue={netSuiteCustomFieldFormValues[INPUT_IDS.TRANSACTION_FIELD_ID]}
                />
                <View style={[styles.flex1, styles.mv3, styles.renderHTML, styles.textDecorationSkipInkNone]}>
                    <RenderHTML html={`<comment>${Parser.replace(translate(`workspace.netsuite.import.importCustomFields.customLists.addForm.transactionFieldIDFooter`))}</comment>`} />
                </View>
            </View>
        </FormProvider>
    );
}

export default TransactionFieldIDStep;
