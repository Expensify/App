import React, {useCallback, useEffect} from 'react';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useInitial from '@hooks/useInitial';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import {clearIssueNewCardError, clearIssueNewCardFlow, issueExpensifyCard} from '@libs/actions/Card';
import {requestValidateCodeAction, resetValidateActionCodeSent} from '@libs/actions/User';
import {getLatestErrorMessageField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type IssueNewCardConfirmMagicCodePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_ISSUE_NEW_CONFIRM_MAGIC_CODE>;

function IssueNewCardConfirmMagicCodePage({route}: IssueNewCardConfirmMagicCodePageProps) {
    const {translate} = useLocalize();
    const policyID = route.params.policyID;
    const backTo = route.params.backTo;
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const primaryLogin = account?.primaryLogin ?? '';
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD}${policyID}`, {canBeMissing: true});
    const validateError = getLatestErrorMessageField(issueNewCard);
    const data = issueNewCard?.data;
    const isSuccessful = issueNewCard?.isSuccessful;
    const defaultFundID = useDefaultFundID(policyID);
    const {isBetaEnabled} = usePermissions();
    const firstAssigneeEmail = useInitial(issueNewCard?.data?.assigneeEmail);
    const shouldUseBackToParam = !firstAssigneeEmail || firstAssigneeEmail === issueNewCard?.data?.assigneeEmail;

    useEffect(() => {
        if (!isSuccessful) {
            return;
        }
        if (backTo && shouldUseBackToParam) {
            Navigation.goBack(backTo);
        } else {
            Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID), {forceReplace: true});
        }
        clearIssueNewCardFlow(policyID);
    }, [backTo, isSuccessful, policyID, shouldUseBackToParam]);

    const handleSubmit = useCallback(
        (validateCode: string) => {
            // NOTE: For Expensify Card UK/EU, the backend will automatically detect the correct feedCountry to use
            issueExpensifyCard(defaultFundID, policyID, isBetaEnabled(CONST.BETAS.EXPENSIFY_CARD_EU_UK) ? '' : CONST.COUNTRY.US, validateCode, data);
        },
        [isBetaEnabled, data, defaultFundID, policyID],
    );

    const handleClose = useCallback(() => {
        resetValidateActionCodeSent();
        Navigation.goBack(ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.getRoute(policyID, backTo));
    }, [policyID, backTo]);

    return (
        <ValidateCodeActionContent
            isLoading={issueNewCard?.isLoading}
            title={translate('cardPage.validateCardTitle')}
            descriptionPrimary={translate('cardPage.enterMagicCode', primaryLogin)}
            sendValidateCode={() => requestValidateCodeAction()}
            validateCodeActionErrorField={data?.cardType === CONST.EXPENSIFY_CARD.CARD_TYPE.PHYSICAL ? 'createExpensifyCard' : 'createAdminIssuedVirtualCard'}
            handleSubmitForm={handleSubmit}
            validateError={validateError}
            clearError={() => clearIssueNewCardError(policyID)}
            onClose={handleClose}
        />
    );
}

export default IssueNewCardConfirmMagicCodePage;
