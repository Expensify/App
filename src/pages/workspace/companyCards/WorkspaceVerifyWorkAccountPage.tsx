import React, {useEffect} from 'react';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useCardFeedsForActivePolicies from '@hooks/useCardFeedsForActivePolicies';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import AccountUtils from '@libs/AccountUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {updateSelectedFeed} from '@userActions/Card';
import {linkCardFeedToPolicy} from '@userActions/CompanyCards';
import {getAccessiblePolicies} from '@userActions/Policy/Policy';
import {resendValidateCode} from '@userActions/User';
import {setOnboardingErrorMessage} from '@userActions/Welcome';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';

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
    const {cardFeedsByPolicy} = useCardFeedsForActivePolicies();
    const isWorkEmailValidated = workEmail ? !!loginList?.[workEmail]?.validatedDate : false;

    const getFeedInfo = () => {
        if (!feed || !cardFeedsByPolicy) {
            return undefined;
        }
        for (const cardFeeds of Object.values(cardFeedsByPolicy)) {
            const found = cardFeeds.find((item) => item.id === feed);
            if (found) {
                return found;
            }
        }
        return undefined;
    };
    const feedInfo = getFeedInfo();

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
        if (!feedInfo) {
            return;
        }
        if (isWorkEmailValidated) {
            linkCardFeedToPolicy(Number(feedInfo.fundID), policyID, 'CompanyCard', feedInfo?.country, feedInfo.feed as CompanyCardFeedWithNumber);
            updateSelectedFeed(feed, policyID);
            Navigation.closeRHPFlow();
        }
    }, [feedInfo, isWorkEmailValidated, policyID]);

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
