import React, {useRef, useState} from 'react';
import type {WebViewNavigation} from 'react-native-webview';
import {WebView} from 'react-native-webview';
import ActivityIndicator from '@components/ActivityIndicator';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import ConfirmationPage from '@components/ConfirmationPage';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import getUAForWebView from '@libs/getUAForWebView';
import Navigation from '@libs/Navigation/Navigation';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
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

    const {handleBackButtonPress, url, isPlaid, isNewFeedHasError, newFeed, isAllFeedsResultLoading, isBlockedToAddNewFeeds, isRefreshComplete} = useBankConnection({
        policyID,
        feed,
        bankNameFromRoute,
        onSuccess,
        onFailure,
        onBackButtonPress,
        isRefreshConnectionFlow,
        shouldOpenWindow: false,
    });

    const headerTitleAddCards = !backTo ? translate('workspace.companyCards.addCards') : undefined;
    const headerTitle = feed ? translate(isRefreshConnectionFlow ? 'workspace.moreFeatures.companyCards.assignNewCards' : 'workspace.companyCards.assignCard') : headerTitleAddCards;

    const fullscreenReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'BankConnection',
    };
    const activityReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'BankConnection',
        isAllFeedsResultLoading,
        isBlockedToAddNewFeedsWithoutFeed: isBlockedToAddNewFeeds && !feed,
        isConnectionCompleted,
        isPlaid,
    };
    const renderLoading = () => <FullScreenLoadingIndicator reasonAttributes={fullscreenReasonAttributes} />;

    const checkIfConnectionCompleted = (navState: WebViewNavigation) => {
        if (!navState.url.includes(ROUTES.BANK_CONNECTION_COMPLETE)) {
            return;
        }
        setConnectionCompleted(true);
    };

    const getContent = () => {
        if (isRefreshComplete) {
            return (
                <ConfirmationPage
                    heading={translate('workspace.moreFeatures.companyCards.refreshConnectionSuccess')}
                    description={translate('workspace.moreFeatures.companyCards.refreshConnectionSuccessDescription')}
                    shouldShowButton
                    buttonText={translate('common.buttonConfirm')}
                    onButtonPress={() => Navigation.dismissModal()}
                />
            );
        }
        if (isNewFeedHasError) {
            return (
                <WorkspaceCompanyCardsErrorConfirmation
                    policyID={policyID}
                    newFeed={newFeed}
                />
            );
        }
        if (!!url && !isConnectionCompleted && !isPlaid && !isAllFeedsResultLoading && (!isBlockedToAddNewFeeds || !!feed)) {
            return (
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
            );
        }
        return (
            <ActivityIndicator
                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                style={styles.flex1}
                reasonAttributes={activityReasonAttributes}
            />
        );
    };

    return (
        <ScreenWrapper
            testID={isRefreshComplete ? 'RefreshCardFeedConnectionSuccess' : 'BankConnection'}
            shouldShowOfflineIndicator={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={headerTitle}
                onBackButtonPress={handleBackButtonPress}
            />
            <FullPageOfflineBlockingView addBottomSafeAreaPadding>{getContent()}</FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

export default BankConnection;
