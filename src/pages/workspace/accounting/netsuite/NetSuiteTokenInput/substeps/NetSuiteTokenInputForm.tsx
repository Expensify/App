import React, { useCallback } from 'react';
import {View} from 'react-native';
import TextInput from '@components/TextInput';
import Text from '@components/Text';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import useLocalize from '@hooks/useLocalize';
import INPUT_IDS from '@src/types/form/NetSuiteTokenInputForm';
import ONYXKEYS from '@src/ONYXKEYS';
import * as ErrorUtils from '@libs/ErrorUtils';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import CONST from '@src/CONST';
import useStepFormSubmit from '@hooks/useStepFormSubmit';

function NetSuiteTokenInputForm({onNext}: SubStepProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const formInputs = Object.values(INPUT_IDS);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NETSUITE_TOKEN_INPUT_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.NETSUITE_TOKEN_INPUT_FORM> = {};

            formInputs.forEach((formInput) => {
                if (values[formInput]) {
                    return;
                }
                ErrorUtils.addErrorMessage(errors, formInput, translate('common.error.fieldRequired'));
            });
            return errors;
        },
        [formInputs, translate],
    );

    const handleSubmit = useStepFormSubmit<typeof ONYXKEYS.FORMS.NETSUITE_TOKEN_INPUT_FORM>({
        formId: ONYXKEYS.FORMS.NETSUITE_TOKEN_INPUT_FORM,
        fieldIds: formInputs,
        onNext,
        shouldSaveDraft: true,
    });

    return (
        <View style={[styles.flexGrow1, styles.ph5]}>
            <Text style={[styles.textHeadlineLineHeightXXL]}>{translate(`workspace.netsuite.tokenInput.formSteps.enterCredentials.title`)}</Text>

            <FormProvider
                formID={ONYXKEYS.FORMS.NETSUITE_TOKEN_INPUT_FORM}
                style={styles.flexGrow1}
                validate={validate}
                onSubmit={handleSubmit}
                submitButtonText={translate('common.confirm')}
                enabledWhenOffline
                shouldValidateOnBlur
                shouldValidateOnChange
            >
                {formInputs.map((formInput) => (
                    <View
                        style={styles.mb4}
                        key={formInput}
                    >
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={formInput}
                            label={translate(`workspace.netsuite.tokenInput.formSteps.enterCredentials.formInputs.${formInput}`)}
                            aria-label={translate(`workspace.netsuite.tokenInput.formSteps.enterCredentials.formInputs.${formInput}`)}
                            role={CONST.ROLE.PRESENTATION}
                            spellCheck={false}
                        />
                    </View>
                ))}
            </FormProvider>
        </View>
    );
}

NetSuiteTokenInputForm.displayName = 'NetSuiteTokenInputForm';
export default NetSuiteTokenInputForm;
