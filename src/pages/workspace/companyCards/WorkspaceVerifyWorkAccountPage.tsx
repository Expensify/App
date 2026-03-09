import React, {useEffect} from 'react';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import AccountUtils from '@libs/AccountUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {getAccessiblePolicies} from '@userActions/Policy/Policy';
import {resendValidateCode} from '@userActions/User';
import {setOnboardingErrorMessage} from '@userActions/Welcome';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type WorkspaceVerifyWorkAccountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARD_VERIFY_WORK_EMAIL>;

function WorkspaceVerifyWorkAccountPage({route}: WorkspaceVerifyWorkAccountPageProps) {
    const {policyID, feed} = route.params;
    const {translate} = useLocalize();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const [onboardingEmail] = useOnyx(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM);
    const workEmail = onboardingEmail?.onboardingWorkEmail;

    const [onboardingErrorMessage] = useOnyx(ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY);
    const isValidateCodeFormSubmitting = AccountUtils.isValidateCodeFormSubmitting(account);

    const sendValidateCode = () => {
        if (!workEmail) {
            return;
        }
        resendValidateCode(workEmail);
    };

    const validateAccountAndMerge = (validateCode: string) => {
        setOnboardingErrorMessage(null);
        getAccessiblePolicies(validateCode);
    };

    useEffect(() => {
        if (!workEmail) {
            return;
        }
        if (loginList?.[workEmail]?.validatedDate) {
            // execute link API for feed
        }
    });

    return (
        <ValidateCodeActionContent
            handleSubmitForm={validateAccountAndMerge}
            sendValidateCode={sendValidateCode}
            validateCodeActionErrorField="mergeIntoAccountAndLogIn"
            clearError={() => setOnboardingErrorMessage(null)}
            isLoading={isValidateCodeFormSubmitting}
            validateError={onboardingErrorMessage ? {invalidCodeError: translate(onboardingErrorMessage)} : undefined}
            title={translate('onboarding.workEmailValidation.title')}
            descriptionPrimary={translate('onboarding.workEmailValidation.magicCodeSent', {workEmail})}
            onClose={() => {
                Navigation.goBack();
            }}
        />
    );
}

export default WorkspaceVerifyWorkAccountPage;
