import React, {useCallback, useEffect, useState} from 'react';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useCardFeedsForActivePolicies from '@hooks/useCardFeedsForActivePolicies';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getFeedInfo} from '@libs/CardFeedUtils';
import {getCardFeedWithDomainID} from '@libs/CardUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {updateSelectedFeed} from '@userActions/Card';
import {linkCardFeedToPolicy} from '@userActions/CompanyCards';
import {requestValidateCodeAction, resetValidateActionCodeSent, setContactMethodAsDefault} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';
import type {CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';

type WorkspaceCompanyCardConfirmDefaultContactMethodPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARD_CONFIRM_DEFAULT_CONTACT_METHOD>;

function WorkspaceCompanyCardConfirmDefaultContactMethodPage({route}: WorkspaceCompanyCardConfirmDefaultContactMethodPageProps) {
    const {policyID, feed, email: workEmail} = route.params;
    const {translate, formatPhoneNumber} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const primaryLogin = account?.primaryLogin ?? session?.email ?? '';
    const [validateActionCode] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);
    const {cardFeedsByPolicy} = useCardFeedsForActivePolicies();
    const feedInfo = getFeedInfo(feed, cardFeedsByPolicy);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        requestValidateCodeAction();
    }, []);

    const handleSubmit = useCallback(
        (validateCode: string) => {
            setContactMethodAsDefault(currentUserPersonalDetails, workEmail, formatPhoneNumber, undefined, true, validateCode);

            if (!feedInfo) {
                return;
            }
            setLoading(true);
            const feedValue = getCardFeedWithDomainID(feedInfo.feed, feedInfo.fundID) as CompanyCardFeedWithDomainID;
            linkCardFeedToPolicy(Number(feedInfo.fundID), policyID, CONST.COMPANY_CARD.LINK_FEED_TYPE.COMPANY_CARD, feedInfo?.country, feedInfo.feed as CompanyCardFeedWithNumber)
                .then(() => {
                    updateSelectedFeed(feedValue, policyID);
                    Navigation.closeRHPFlow();
                })
                .catch(() => {
                    Navigation.goBack();
                })
                .finally(() => {
                    setLoading(false);
                });
        },
        [currentUserPersonalDetails, workEmail, formatPhoneNumber, feedInfo, policyID],
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

export default WorkspaceCompanyCardConfirmDefaultContactMethodPage;
