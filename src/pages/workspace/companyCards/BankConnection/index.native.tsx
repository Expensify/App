import React, {useRef, useState} from 'react';
import type {WebViewNavigation} from 'react-native-webview';
import {WebView} from 'react-native-webview';
import ActivityIndicator from '@components/ActivityIndicator';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import getUAForWebView from '@libs/getUAForWebView';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import WorkspaceCompanyCardsErrorConfirmation from '@pages/workspace/companyCards/WorkspaceCompanyCardsErrorConfirmation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';
import useBankConnection from './useBankConnection';

type BankConnectionProps = {
    /** ID of the policy */
    policyID?: string;

    /** Selected feed for assign card flow */
    feed?: CompanyCardFeedWithDomainID;

    /** Route params for add new card flow */
    route?: PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_BANK_CONNECTION>;

    /** Whether this is a refresh card list flow */
    isRefreshConnectionFlow?: boolean;

    /** Called when the assign flow succeeds */
    onSuccess?: () => void;

    /** Called when the assign flow fails due to broken connection */
    onFailure?: () => void;

    /** Called when the back button is pressed */
    onBackButtonPress?: () => void;
};

function BankConnection({policyID: policyIDFromProps, feed, route, isRefreshConnectionFlow, onSuccess, onFailure, onBackButtonPress}: BankConnectionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const webViewRef = useRef<WebView>(null);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const authToken = session?.authToken ?? null;
    const {feed: bankNameFromRoute, backTo, policyID: policyIDFromRoute} = route?.params ?? {};
    const policyID = policyIDFromProps ?? policyIDFromRoute;
    const [isConnectionCompleted, setConnectionCompleted] = useState(false);

    const {handleBackButtonPress, url, isPlaid, isNewFeedHasError, newFeed, isAllFeedsResultLoading, isBlockedToAddNewFeeds} = useBankConnection({
        policyID,
        feed,
        bankNameFromRoute,
        onSuccess,
        onFailure,
        onBackButtonPress,
        shouldOpenWindow: false,
    });

    const headerTitleAddCards = !backTo ? translate('workspace.companyCards.addCards') : undefined;
    const headerTitle = feed ? translate(isRefreshConnectionFlow ? 'workspace.moreFeatures.companyCards.assignNewCards' : 'workspace.companyCards.assignCard') : headerTitleAddCards;

    const renderLoading = () => <FullScreenLoadingIndicator />;

    const checkIfConnectionCompleted = (navState: WebViewNavigation) => {
        if (!navState.url.includes(ROUTES.BANK_CONNECTION_COMPLETE)) {
            return;
        }
        setConnectionCompleted(true);
    };

    return (
        <ScreenWrapper
            testID="BankConnection"
            shouldShowOfflineIndicator={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={headerTitle}
                onBackButtonPress={handleBackButtonPress}
            />
            <FullPageOfflineBlockingView addBottomSafeAreaPadding>
                {!!url && !isConnectionCompleted && !isPlaid && !isNewFeedHasError && !isAllFeedsResultLoading && (!isBlockedToAddNewFeeds || !!feed) && (
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
                        onNavigationStateChange={checkIfConnectionCompleted}
                        startInLoadingState
                        renderLoading={renderLoading}
                    />
                )}
                {(isAllFeedsResultLoading || (isBlockedToAddNewFeeds && !feed) || isConnectionCompleted || isPlaid) && !isNewFeedHasError && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={styles.flex1}
                    />
                )}
                {isNewFeedHasError && (
                    <WorkspaceCompanyCardsErrorConfirmation
                        policyID={policyID}
                        newFeed={newFeed}
                    />
                )}
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

export default BankConnection;
