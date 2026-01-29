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
import useThemeStyles from '@hooks/useThemeStyles';
import {connectPolicyToNetSuite} from '@libs/actions/connections/NetSuiteCommands';
import {isMobileSafari} from '@libs/Browser';
import {addErrorMessage} from '@libs/ErrorUtils';
import Parser from '@libs/Parser';
import type {CustomSubPageTokenInputProps} from '@pages/workspace/accounting/netsuite/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/NetSuiteTokenInputForm';

function NetSuiteTokenInputForm({onNext, policyID}: CustomSubPageTokenInputProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const formInputs = Object.values(INPUT_IDS);

    const validate = useCallback(
        (formValues: FormOnyxValues<typeof ONYXKEYS.FORMS.NETSUITE_TOKEN_INPUT_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.NETSUITE_TOKEN_INPUT_FORM> = {};

            for (const formInput of formInputs) {
                if (formValues[formInput]) {
                    continue;
                }
                addErrorMessage(errors, formInput, translate('common.error.fieldRequired'));
            }
            return errors;
        },
        [formInputs, translate],
    );

    const connectPolicy = useCallback(
        (formValues: FormOnyxValues<typeof ONYXKEYS.FORMS.NETSUITE_TOKEN_INPUT_FORM>) => {
            if (!policyID) {
                return;
            }

            connectPolicyToNetSuite(policyID, formValues);
            onNext();
        },
        [onNext, policyID],
    );

    return (
        <>
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mb6, styles.ph5]}>{translate(`workspace.netsuite.tokenInput.formSteps.enterCredentials.title`)}</Text>
            <FormProvider
                formID={ONYXKEYS.FORMS.NETSUITE_TOKEN_INPUT_FORM}
                style={[styles.flexGrow1, styles.ph5]}
                validate={validate}
                onSubmit={connectPolicy}
                submitButtonText={translate('common.confirm')}
                shouldValidateOnBlur
                shouldValidateOnChange
                addBottomSafeAreaPadding={!isMobileSafari()}
            >
                {formInputs.map((formInput, index) => (
                    <View
                        style={styles.mb4}
                        key={formInput}
                    >
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={formInput}
                            ref={index === 0 ? inputCallbackRef : undefined}
                            label={translate(`workspace.netsuite.tokenInput.formSteps.enterCredentials.formInputs.${formInput}`)}
                            aria-label={translate(`workspace.netsuite.tokenInput.formSteps.enterCredentials.formInputs.${formInput}`)}
                            role={CONST.ROLE.PRESENTATION}
                            spellCheck={false}
                        />
                        {formInput === INPUT_IDS.NETSUITE_ACCOUNT_ID && (
                            <View style={[styles.flexRow, styles.pt2]}>
                                <RenderHTML
                                    html={`<comment><muted-text>${Parser.replace(
                                        translate(`workspace.netsuite.tokenInput.formSteps.enterCredentials.${formInput}Description`),
                                    )}</muted-text></comment>`}
                                />
                            </View>
                        )}
                    </View>
                ))}
            </FormProvider>
        </>
    );
}

export default NetSuiteTokenInputForm;
