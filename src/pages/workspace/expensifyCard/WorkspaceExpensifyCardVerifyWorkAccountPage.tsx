import React, {useEffect} from 'react';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {clearGetAccessiblePoliciesErrors, getAccessiblePolicies} from '@userActions/Policy/Policy';
import {resendValidateCode} from '@userActions/User';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceExpensifyCardVerifyWorkAccountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_VERIFY_WORK_EMAIL>;

function WorkspaceExpensifyCardVerifyWorkAccountPage({route}: WorkspaceExpensifyCardVerifyWorkAccountPageProps) {
    const {policyID, fundID} = route.params;
    const {translate} = useLocalize();
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const workEmail = usePrimaryContactMethod();
    const workEmailLoginKey = workEmail ? Object.keys(loginList ?? {}).find((login) => login.toLowerCase() === workEmail.toLowerCase()) : undefined;
    const [getAccessiblePoliciesAction] = useOnyx(ONYXKEYS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES);
    const isWorkEmailValidated = workEmailLoginKey ? !!loginList?.[workEmailLoginKey]?.validatedDate : false;

    const sendValidateCode = () => {
        if (!workEmail) {
            return;
        }
        resendValidateCode(workEmail);
    };

    const validateAccountAndMerge = (validateCode: string) => {
        getAccessiblePolicies(validateCode);
    };

    useEffect(() => {
        if (!isWorkEmailValidated) {
            return;
        }
        // After the work email is validated, navigate to the magic code confirmation page
        // to verify the user's identity before changing the default contact method
        Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_CONFIRM_DEFAULT_CONTACT_METHOD.getRoute(policyID, fundID, workEmail ?? ''));
    }, [isWorkEmailValidated, policyID, fundID, workEmail]);

    return (
        <ValidateCodeActionContent
            handleSubmitForm={validateAccountAndMerge}
            sendValidateCode={sendValidateCode}
            validateCodeActionErrorField="getAccessiblePolicies"
            clearError={clearGetAccessiblePoliciesErrors}
            isLoading={getAccessiblePoliciesAction?.loading}
            validateError={getAccessiblePoliciesAction?.errors}
            title={translate('onboarding.workEmailValidation.title')}
            descriptionPrimary={translate('onboarding.workEmailValidation.magicCodeSent', workEmail)}
            onClose={() => {
                Navigation.goBack();
            }}
        />
    );
}

export default WorkspaceExpensifyCardVerifyWorkAccountPage;
