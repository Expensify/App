import React, {useEffect, useRef} from 'react';
import {useOnyx} from 'react-native-onyx';
import {WebView} from 'react-native-webview';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import * as CardUtils from '@libs/CardUtils';
import getUAForWebView from '@libs/getUAForWebView';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as CompanyCards from '@userActions/CompanyCards';
import getCompanyCardBankConnection from '@userActions/getCompanyCardBankConnection';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CompanyCardFeed} from '@src/types/onyx';

type BankConnectionStepProps = {
    /** ID of the policy */
    policyID?: string;

    /** Selected feed */
    feed: CompanyCardFeed;
};

function BankConnection({policyID, feed}: BankConnectionStepProps) {
    const {translate} = useLocalize();
    const webViewRef = useRef<WebView>(null);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const authToken = session?.authToken ?? null;
    const bankName = CardUtils.getCardFeedName(feed);
    const url = getCompanyCardBankConnection(policyID, bankName);
    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);
    const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`);
    // This does not apply for custom feeds, this is used to check if the feed is expired to push user to reauthenticate
    const isFeedExpired = CardUtils.isSelectedFeedExpired(cardFeeds?.settings?.oAuthAccountDetails?.[feed]);

    const renderLoading = () => <FullScreenLoadingIndicator />;

    const handleBackButtonPress = () => {
        Navigation.goBack();
    };

    useEffect(() => {
        if (!url) {
            return;
        }
        if (!isFeedExpired) {
            CompanyCards.setAssignCardStepAndData({
                currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE,
                isEditing: false,
            });
        }
    }, [isFeedExpired, url]);

    return (
        <ScreenWrapper
            testID={BankConnection.displayName}
            shouldShowOfflineIndicator={false}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.companyCards.assignCard')}
                onBackButtonPress={handleBackButtonPress}
            />
            <FullPageOfflineBlockingView>
                {!!url && (
                    <WebView
                        ref={webViewRef}
                        source={{
                            uri: url,
                            headers: {
                                Cookie: `authToken=${authToken}`,
                            },
                        }}
                        userAgent={getUAForWebView()}
                        incognito
                        startInLoadingState
                        renderLoading={renderLoading}
                    />
                )}
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

BankConnection.displayName = 'BankConnection';

export default BankConnection;
