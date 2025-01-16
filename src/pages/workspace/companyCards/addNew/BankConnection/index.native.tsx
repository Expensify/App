import React, {useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {WebViewNavigation} from 'react-native-webview';
import {WebView} from 'react-native-webview';
import type {ValueOf} from 'type-fest';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateSelectedFeed} from '@libs/actions/Card';
import {checkIfNewFeedConnected} from '@libs/CardUtils';
import getUAForWebView from '@libs/getUAForWebView';
import Navigation from '@libs/Navigation/Navigation';
import {getWorkspaceAccountID} from '@libs/PolicyUtils';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {setAddNewCompanyCardStepAndData} from '@userActions/CompanyCards';
import getCompanyCardBankConnection from '@userActions/getCompanyCardBankConnection';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type BankConnectionStepProps = {
    policyID?: string;
    route?: PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_BANK_CONNECTION>;
};

function BankConnection({policyID: policyIDFromProps, route}: BankConnectionStepProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const webViewRef = useRef<WebView>(null);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const authToken = session?.authToken ?? null;
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD);
    const {bankConnection, backTo, policyID: policyIDFromRoute} = route?.params ?? {};
    const policyID = policyIDFromProps ?? policyIDFromRoute;
    const bankName: ValueOf<typeof CONST.COMPANY_CARDS.BANKS> | undefined = addNewCard?.data?.selectedBank;
    const url = getCompanyCardBankConnection(policyID, bankName, bankConnection);
    const workspaceAccountID = getWorkspaceAccountID(policyID);
    const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`);
    const [isConnectionCompleted, setConnectionCompleted] = useState(false);
    const prevFeedsData = usePrevious(cardFeeds?.settings?.oAuthAccountDetails);
    const {isNewFeedConnected, newFeed} = useMemo(() => checkIfNewFeedConnected(prevFeedsData ?? {}, cardFeeds?.settings?.oAuthAccountDetails ?? {}), [cardFeeds, prevFeedsData]);

    const renderLoading = () => <FullScreenLoadingIndicator />;

    const handleBackButtonPress = () => {
        if (backTo) {
            Navigation.goBack(backTo);
        }
        if (bankName === CONST.COMPANY_CARDS.BANKS.BREX) {
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
        if (isNewFeedConnected) {
            if (newFeed) {
                updateSelectedFeed(newFeed, policyID);
            }
            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID));
        }
    }, [isNewFeedConnected, newFeed, policyID, url]);

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
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={!backTo ? translate('workspace.companyCards.addCards') : undefined}
                onBackButtonPress={handleBackButtonPress}
            />
            <FullPageOfflineBlockingView>
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
