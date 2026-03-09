import React, {useCallback, useMemo, useRef, useState} from 'react';
import type {WebViewNavigation} from 'react-native-webview';
import {WebView} from 'react-native-webview';
import ActivityIndicator from '@components/ActivityIndicator';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useCardFeeds from '@hooks/useCardFeeds';
import useIsBlockedToAddFeed from '@hooks/useIsBlockedToAddFeed';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import {checkIfNewFeedConnected, getBankName, getCompanyCardFeed, isSelectedFeedExpired} from '@libs/CardUtils';
import getUAForWebView from '@libs/getUAForWebView';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import WorkspaceCompanyCardsErrorConfirmation from '@pages/workspace/companyCards/WorkspaceCompanyCardsErrorConfirmation';
import {getCompanyCardBankConnection} from '@userActions/getCompanyCardBankConnection';
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
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD);
    const authToken = session?.authToken ?? null;
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD);
    const selectedBank = addNewCard?.data?.selectedBank;
    const {feed: bankNameFromRoute, backTo, policyID: policyIDFromRoute} = route?.params ?? {};
    const policyID = policyIDFromProps ?? policyIDFromRoute;
    const bankName = feed ? getBankName(getCompanyCardFeed(feed)) : (bankNameFromRoute ?? addNewCard?.data?.plaidConnectedFeed ?? selectedBank);
    const plaidToken = addNewCard?.data?.publicToken ?? assignCard?.cardToAssign?.plaidAccessToken;
    const isPlaid = !!plaidToken;
    const url = getCompanyCardBankConnection(policyID, bankName);
    const [cardFeeds] = useCardFeeds(policyID);
    const [isConnectionCompleted, setConnectionCompleted] = useState(false);
    const prevFeedsData = usePrevious(cardFeeds);
    const isFeedExpired = feed ? !!isSelectedFeedExpired(cardFeeds?.[feed]) : false;
    const {isNewFeedConnected, newFeed} = useMemo(
        () => checkIfNewFeedConnected(prevFeedsData ?? {}, cardFeeds ?? {}, addNewCard?.data?.plaidConnectedFeed),
        [addNewCard?.data?.plaidConnectedFeed, cardFeeds, prevFeedsData],
    );
    const headerTitleAddCards = !backTo ? translate('workspace.companyCards.addCards') : undefined;
    const headerTitle = feed ? translate(isRefreshConnectionFlow ? 'workspace.moreFeatures.companyCards.assignNewCards' : 'workspace.companyCards.assignCard') : headerTitleAddCards;
    const isNewFeedHasError = !!(newFeed && cardFeeds?.[newFeed]?.errors);
    const {isBlockedToAddNewFeeds, isAllFeedsResultLoading} = useIsBlockedToAddFeed(policyID);

    const renderLoading = () => <FullScreenLoadingIndicator />;

    const handleAssignFailure = useCallback(() => {
        if (onFailure) {
            onFailure();
            return;
        }
        Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID));
    }, [onFailure, policyID]);

    const handleComplete = useCallback(() => {
        if (onSuccess) {
            onSuccess();
            return;
        }
        Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID));
    }, [onSuccess, policyID]);

    const {handleBackButtonPress} = useBankConnection({
        policyID,
        feed,
        isPlaid,
        url,
        isNewFeedConnected: !!isNewFeedConnected,
        newFeed,
        isFeedExpired,
        isNewFeedHasError,
        onSuccess: handleComplete,
        onFailure: handleAssignFailure,
        onBackButtonPress,
        cardFeeds,
        shouldOpenWindow: false,
    });

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
