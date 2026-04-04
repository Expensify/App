import React, {useEffect, useState} from 'react';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';
import {setIssueNewCardStepAndData, updateSelectedExpensifyCardFeed} from '@libs/actions/Card';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {linkCardFeedToPolicy} from '@userActions/CompanyCards';
import {clearGetAccessiblePoliciesErrors, getAccessiblePolicies} from '@userActions/Policy/Policy';
import {resendValidateCode} from '@userActions/User';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Errors} from '@src/types/onyx/OnyxCommon';

type WorkspaceExpensifyCardVerifyWorkAccountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_VERIFY_WORK_EMAIL>;

const DEFAULT_ISSUE_NEW = 'true';
function WorkspaceExpensifyCardVerifyWorkAccountPage({route}: WorkspaceExpensifyCardVerifyWorkAccountPageProps) {
    const {policyID, fundID, exitToIssueNew: exitToIssueNewParam} = route.params;
    const exitToIssueNew = exitToIssueNewParam === DEFAULT_ISSUE_NEW;
    const {translate} = useLocalize();
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const workEmail = usePrimaryContactMethod();
    const workEmailLoginKey = workEmail ? Object.keys(loginList ?? {}).find((login) => login.toLowerCase() === workEmail.toLowerCase()) : undefined;
    const [getAccessiblePoliciesAction] = useOnyx(ONYXKEYS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES);
    const isWorkEmailValidated = workEmailLoginKey ? !!loginList?.[workEmailLoginKey]?.validatedDate : false;
    const [feedWithError, setFeedWithError] = useState<{error?: Errors} | undefined>(undefined);

    const sendValidateCode = () => {
        if (!workEmail) {
            return;
        }
        resendValidateCode(workEmail);
    };

    const validateAccountAndMerge = (validateCode: string) => {
        getAccessiblePolicies(validateCode);
    };

    const onDismissError = () => {
        setFeedWithError(undefined);
    };

    useEffect(() => {
        if (!isWorkEmailValidated) {
            return;
        }
        linkCardFeedToPolicy(Number(fundID), policyID, CONST.COMPANY_CARD.LINK_FEED_TYPE.EXPENSIFY_CARD)
            .then(() => {
                updateSelectedExpensifyCardFeed(Number(fundID), policyID);
                if (exitToIssueNew) {
                    setIssueNewCardStepAndData({policyID, isChangeAssigneeDisabled: false});
                    Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.getRoute(policyID, ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID)));
                    return;
                }
                Navigation.closeRHPFlow();
            })
            .catch((error: TranslationPaths) => {
                setFeedWithError({
                    error: getMicroSecondOnyxErrorWithTranslationKey(error),
                });
            });
    }, [fundID, isWorkEmailValidated, policyID, exitToIssueNew]);

    return (
        <ValidateCodeActionContent
            handleSubmitForm={validateAccountAndMerge}
            sendValidateCode={sendValidateCode}
            validateCodeActionErrorField="getAccessiblePolicies"
            clearError={feedWithError?.error ? onDismissError : clearGetAccessiblePoliciesErrors}
            isLoading={getAccessiblePoliciesAction?.loading}
            validateError={feedWithError?.error ? feedWithError.error : getAccessiblePoliciesAction?.errors}
            title={translate('onboarding.workEmailValidation.title')}
            descriptionPrimary={translate('onboarding.workEmailValidation.magicCodeSent', workEmail)}
            onClose={() => {
                Navigation.goBack();
            }}
        />
    );
}

export default WorkspaceExpensifyCardVerifyWorkAccountPage;
