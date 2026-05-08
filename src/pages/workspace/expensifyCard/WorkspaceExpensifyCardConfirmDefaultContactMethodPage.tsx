import React, {useCallback, useEffect, useState} from 'react';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {updateSelectedExpensifyCardFeed} from '@libs/actions/Card';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {linkCardFeedToPolicy} from '@userActions/CompanyCards';
import {requestValidateCodeAction, resetValidateActionCodeSent, setContactMethodAsDefault} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type WorkspaceExpensifyCardConfirmDefaultContactMethodPageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_CONFIRM_DEFAULT_CONTACT_METHOD
>;

function WorkspaceExpensifyCardConfirmDefaultContactMethodPage({route}: WorkspaceExpensifyCardConfirmDefaultContactMethodPageProps) {
    const {policyID, fundID, email: workEmail} = route.params;
    const {translate, formatPhoneNumber} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const primaryLogin = account?.primaryLogin ?? session?.email ?? '';
    const [validateActionCode] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        requestValidateCodeAction();
    }, []);

    const handleSubmit = useCallback(
        (validateCode: string) => {
            setContactMethodAsDefault(currentUserPersonalDetails, workEmail, formatPhoneNumber, undefined, true, validateCode);

            setLoading(true);
            linkCardFeedToPolicy(Number(fundID), policyID, CONST.COMPANY_CARD.LINK_FEED_TYPE.EXPENSIFY_CARD)
                .then(() => {
                    updateSelectedExpensifyCardFeed(Number(fundID), policyID);
                    Navigation.closeRHPFlow();
                })
                .catch(() => {
                    Navigation.goBack();
                })
                .finally(() => {
                    setLoading(false);
                });
        },
        [currentUserPersonalDetails, workEmail, formatPhoneNumber, fundID, policyID],
    );

    const handleClose = useCallback(() => {
        resetValidateActionCodeSent();
        Navigation.goBack();
    }, []);

    return (
        <ValidateCodeActionContent
            isLoading={loading || validateActionCode?.isLoading}
            title={translate('workspace.companyCards.confirmDefaultContactMethod')}
            descriptionPrimary={translate('workspace.companyCards.enterMagicCodeDefaultContactMethod', primaryLogin)}
            sendValidateCode={() => requestValidateCodeAction()}
            validateCodeActionErrorField="actionVerified"
            handleSubmitForm={handleSubmit}
            validateError={validateActionCode?.errorFields?.actionVerified ?? undefined}
            clearError={() => {}}
            onClose={handleClose}
        />
    );
}

export default WorkspaceExpensifyCardConfirmDefaultContactMethodPage;
