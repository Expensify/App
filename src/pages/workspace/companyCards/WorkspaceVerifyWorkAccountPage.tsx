import React, {useEffect, useState} from 'react';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useCardFeedsForActivePolicies from '@hooks/useCardFeedsForActivePolicies';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';
import {getFeedInfo} from '@libs/CardFeedUtils';
import {getCardFeedWithDomainID} from '@libs/CardUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {updateSelectedFeed} from '@userActions/Card';
import {linkCardFeedToPolicy} from '@userActions/CompanyCards';
import {clearGetAccessiblePoliciesErrors, getAccessiblePolicies} from '@userActions/Policy/Policy';
import {resendValidateCode} from '@userActions/User';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeedWithDomainID, CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import type {Errors} from '@src/types/onyx/OnyxCommon';

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
    const [feedWithError, setFeedWithError] = useState<{error?: Errors} | undefined>(undefined);
    const [loading, setLoading] = useState(false);

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
        if (!feedInfo) {
            return;
        }
        if (isWorkEmailValidated) {
            setLoading(true);
            const feedValue = getCardFeedWithDomainID(feedInfo.feed, feedInfo.fundID) as CompanyCardFeedWithDomainID;
            linkCardFeedToPolicy(Number(feedInfo.fundID), policyID, CONST.COMPANY_CARD.LINK_FEED_TYPE.COMPANY_CARD, feedInfo?.country, feedInfo.feed as CompanyCardFeedWithNumber)
                .then(() => {
                    updateSelectedFeed(feedValue, policyID);
                    Navigation.closeRHPFlow();
                })
                .catch((error: TranslationPaths) => {
                    setFeedWithError({
                        error: getMicroSecondOnyxErrorWithTranslationKey(error),
                    });
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [feed, feedInfo, isWorkEmailValidated, policyID]);

    return (
        <ValidateCodeActionContent
            handleSubmitForm={validateAccountAndMerge}
            sendValidateCode={sendValidateCode}
            validateCodeActionErrorField="getAccessiblePolicies"
            clearError={feedWithError?.error ? onDismissError : clearGetAccessiblePoliciesErrors}
            isLoading={loading || getAccessiblePoliciesAction?.loading}
            validateError={feedWithError?.error ? feedWithError?.error : getAccessiblePoliciesAction?.errors}
            title={translate('onboarding.workEmailValidation.title')}
            descriptionPrimary={translate('onboarding.workEmailValidation.magicCodeSent', workEmail)}
            onClose={() => {
                Navigation.goBack();
            }}
        />
    );
}

export default WorkspaceVerifyWorkAccountPage;
