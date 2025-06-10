import React, {useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {WebViewNavigation} from 'react-native-webview';
import {WebView} from 'react-native-webview';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useCardFeeds from '@hooks/useCardFeeds';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateSelectedFeed} from '@libs/actions/Card';
import {setAssignCardStepAndData} from '@libs/actions/CompanyCards';
import {checkIfNewFeedConnected, getBankName, isSelectedFeedExpired} from '@libs/CardUtils';
import getUAForWebView from '@libs/getUAForWebView';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {setAddNewCompanyCardStepAndData} from '@userActions/CompanyCards';
import {getCompanyCardBankConnection, getCompanyCardPlaidConnection} from '@userActions/getCompanyCardBankConnection';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeed} from '@src/types/onyx';

type BankConnectionProps = {
    /** ID of the policy */
    policyID?: string;

    /** Selected feed for assign card flow */
    feed?: CompanyCardFeed;

    /** Route params for add new card flow */
    route?: PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_BANK_CONNECTION>;
};

function BankConnection({policyID: policyIDFromProps, feed, route}: BankConnectionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const webViewRef = useRef<WebView>(null);
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD, {canBeMissing: true});
    const authToken = session?.authToken ?? null;
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD, {canBeMissing: true});
    const selectedBank = addNewCard?.data?.selectedBank;
    const {bankName: bankNameFromRoute, backTo, policyID: policyIDFromRoute} = route?.params ?? {};
    const policyID = policyIDFromProps ?? policyIDFromRoute;
    const bankName = feed ? getBankName(feed) : (bankNameFromRoute ?? addNewCard?.data?.plaidConnectedFeed ?? selectedBank);
    const {isBetaEnabled} = usePermissions();
    const plaidToken = addNewCard?.data?.publicToken ?? assignCard?.data?.plaidAccessToken;
    const plaidFeed = addNewCard?.data?.plaidConnectedFeed ?? assignCard?.data?.institutionId;
    const plaidFeedName = addNewCard?.data?.plaidConnectedFeedName ?? assignCard?.data?.plaidConnectedFeedName;
    const url =
        isBetaEnabled(CONST.BETAS.PLAID_COMPANY_CARDS) && plaidToken
            ? getCompanyCardPlaidConnection(policyID, plaidToken, plaidFeed, plaidFeedName)
            : getCompanyCardBankConnection(policyID, bankName);
    const [cardFeeds] = useCardFeeds(policyID);
    const [isConnectionCompleted, setConnectionCompleted] = useState(false);
    const prevFeedsData = usePrevious(cardFeeds?.settings?.oAuthAccountDetails);
    const isFeedExpired = feed ? isSelectedFeedExpired(cardFeeds?.settings?.oAuthAccountDetails?.[feed]) : false;
    const {isNewFeedConnected, newFeed} = useMemo(
        () => checkIfNewFeedConnected(prevFeedsData ?? {}, cardFeeds?.settings?.oAuthAccountDetails ?? {}, addNewCard?.data?.plaidConnectedFeed),
        [addNewCard?.data?.plaidConnectedFeed, cardFeeds?.settings?.oAuthAccountDetails, prevFeedsData],
    );
    const headerTitleAddCards = !backTo ? translate('workspace.companyCards.addCards') : undefined;
    const headerTitle = feed ? translate('workspace.companyCards.assignCard') : headerTitleAddCards;

    const renderLoading = () => <FullScreenLoadingIndicator />;

    const handleBackButtonPress = () => {
        // Handle assign card flow
        if (feed) {
            Navigation.goBack();
            return;
        }

        // Handle add new card flow
        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }
        if (bankName === CONST.COMPANY_CARDS.BANKS.BREX || isBetaEnabled(CONST.BETAS.PLAID_COMPANY_CARDS)) {
            setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.SELECT_BANK});
            return;
        }
        if (bankName === CONST.COMPANY_CARDS.BANKS.AMEX) {
            setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.AMEX_CUSTOM_FEED});
            return;
        }
        setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.SELECT_FEED_TYPE});
    };

    useEffect(() => {
        if (!url) {
            return;
        }

        // Handle assign card flow
        if (feed && !isFeedExpired) {
            setAssignCardStepAndData({
                currentStep: assignCard?.data?.dateOption ? CONST.COMPANY_CARD.STEP.CONFIRMATION : CONST.COMPANY_CARD.STEP.ASSIGNEE,
                isEditing: false,
            });
            return;
        }

        // Handle add new card flow
        if (isNewFeedConnected) {
            if (newFeed) {
                updateSelectedFeed(newFeed, policyID);
            }
            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID));
        }
    }, [isNewFeedConnected, newFeed, policyID, url, feed, isFeedExpired, assignCard]);

    const checkIfConnectionCompleted = (navState: WebViewNavigation) => {
        if (!navState.url.includes(ROUTES.BANK_CONNECTION_COMPLETE)) {
            return;
        }
        setConnectionCompleted(true);
    };

    return (
        <ScreenWrapper
            testID={BankConnection.displayName}
            shouldShowOfflineIndicator={false}
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={headerTitle}
                onBackButtonPress={handleBackButtonPress}
            />
            <FullPageOfflineBlockingView addBottomSafeAreaPadding>
                {!!url && !isConnectionCompleted && (
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
                {isConnectionCompleted && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={styles.flex1}
                        color={theme.spinner}
                    />
                )}
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

BankConnection.displayName = 'BankConnection';

export default BankConnection;
