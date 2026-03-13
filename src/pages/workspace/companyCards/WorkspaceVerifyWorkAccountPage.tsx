import React, {useEffect} from 'react';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useCardFeedsForActivePolicies from '@hooks/useCardFeedsForActivePolicies';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';
import {getFeedInfo} from '@libs/CardFeedUtils';
import {getCardFeedWithDomainID} from '@libs/CardUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {updateSelectedFeed} from '@userActions/Card';
import {linkCardFeedToPolicy} from '@userActions/CompanyCards';
import {clearGetAccessiblePoliciesErrors, getAccessiblePolicies} from '@userActions/Policy/Policy';
import {resendValidateCode} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeedWithDomainID, CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';

type WorkspaceVerifyWorkAccountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARD_VERIFY_WORK_EMAIL>;

function WorkspaceVerifyWorkAccountPage({route}: WorkspaceVerifyWorkAccountPageProps) {
    const {policyID, feed} = route.params;
    const {translate} = useLocalize();
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const workEmail = usePrimaryContactMethod();

    const [getAccessiblePoliciesAction] = useOnyx(ONYXKEYS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES);
    const {cardFeedsByPolicy} = useCardFeedsForActivePolicies();
    const isWorkEmailValidated = workEmail ? !!loginList?.[workEmail]?.validatedDate : false;
    const feedInfo = getFeedInfo(feed, cardFeedsByPolicy);

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
        if (!feedInfo) {
            return;
        }
        if (isWorkEmailValidated) {
            const feedValue = getCardFeedWithDomainID(feedInfo.feed, feedInfo.fundID) as CompanyCardFeedWithDomainID;
            linkCardFeedToPolicy(Number(feedInfo.fundID), policyID, CONST.COMPANY_CARD.LINK_FEED_TYPE.COMPANY_CARD, feedInfo?.country, feedInfo.feed as CompanyCardFeedWithNumber);
            updateSelectedFeed(feedValue, policyID);
            Navigation.closeRHPFlow();
        }
    }, [feed, feedInfo, isWorkEmailValidated, policyID]);

    return (
        <ValidateCodeActionContent
            handleSubmitForm={validateAccountAndMerge}
            sendValidateCode={sendValidateCode}
            validateCodeActionErrorField="getAccessiblePolicies"
            clearError={clearGetAccessiblePoliciesErrors}
            isLoading={getAccessiblePoliciesAction?.loading}
            validateError={getAccessiblePoliciesAction?.errors}
            title={translate('onboarding.workEmailValidation.title')}
            descriptionPrimary={translate('onboarding.workEmailValidation.magicCodeSent', {workEmail})}
            onClose={() => {
                Navigation.goBack();
            }}
        />
    );
}

export default WorkspaceVerifyWorkAccountPage;
