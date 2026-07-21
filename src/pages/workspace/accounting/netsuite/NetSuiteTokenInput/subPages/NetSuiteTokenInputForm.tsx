import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import RenderHTML from '@components/RenderHTML';
import RequireTwoFactorAuthenticationModal from '@components/RequireTwoFactorAuthenticationModal';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import useTwoFactorAuthRoute from '@hooks/useTwoFactorAuthRoute';

import {shouldUseUpdateNetSuiteTokens} from '@libs/actions/connections';
import {connectPolicyToNetSuite, updateNetSuiteTokens} from '@libs/actions/connections/NetSuiteCommands';
import {isMobileSafari} from '@libs/Browser';
import {addErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';

import type {CustomSubPageTokenInputProps} from '@pages/workspace/accounting/netsuite/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/NetSuiteTokenInputForm';

import React, {useCallback, useState} from 'react';
import {View} from 'react-native';

import connectToNetSuiteOAuthSetup from './connectToNetSuiteOAuthSetup';

function NetSuiteTokenInputForm({onNext, policyID}: CustomSubPageTokenInputProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policy = usePolicy(policyID);
    const {inputCallbackRef} = useAutoFocusInput();
    const {isBetaEnabled} = usePermissions();
    const {environmentURL} = useEnvironment();
    const {is2FAEnabled, getTwoFactorAuthRoute} = useTwoFactorAuthRoute();

    const isOAuthFlow = isBetaEnabled(CONST.BETAS.NETSUITE_OAUTH);
    const [isRequire2FAModalOpen, setIsRequire2FAModalOpen] = useState(false);

    const formInputs = isOAuthFlow ? [INPUT_IDS.NETSUITE_ACCOUNT_ID] : Object.values(INPUT_IDS);

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

            if (isOAuthFlow) {
                if (!is2FAEnabled) {
                    setIsRequire2FAModalOpen(true);
                    return;
                }
                connectToNetSuiteOAuthSetup(policyID, formValues[INPUT_IDS.NETSUITE_ACCOUNT_ID], environmentURL);
                return;
            }

            if (shouldUseUpdateNetSuiteTokens(policy)) {
                updateNetSuiteTokens(policyID, formValues);
            } else {
                connectPolicyToNetSuite(policyID, formValues);
            }
            onNext();
        },
        [onNext, policyID, policy, isOAuthFlow, is2FAEnabled, environmentURL],
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
                        {formInput === INPUT_IDS.NETSUITE_ACCOUNT_ID && !isOAuthFlow && (
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
            {isOAuthFlow && !is2FAEnabled && (
                <RequireTwoFactorAuthenticationModal
                    onSubmit={() => {
                        setIsRequire2FAModalOpen(false);
                        Navigation.navigate(getTwoFactorAuthRoute());
                    }}
                    onCancel={() => {
                        setIsRequire2FAModalOpen(false);
                    }}
                    isVisible={isRequire2FAModalOpen}
                    description={translate('twoFactorAuth.twoFactorAuthIsRequiredDescription')}
                />
            )}
        </>
    );
}

export default NetSuiteTokenInputForm;
