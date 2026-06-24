import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import type {LinkSuccessMetadata} from 'react-native-plaid-link-sdk';
import type {WebViewNavigation} from 'react-native-webview';
import {WebView} from 'react-native-webview';
import type {PlaidLinkOnSuccessMetadata} from 'react-plaid-link/src/types';
import ActivityIndicator from '@components/ActivityIndicator';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import PlaidLink from '@components/PlaidLink';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlaidOAuthReceivedRedirectURI from '@libs/getPlaidOAuthReceivedRedirectURI';
import getUAForWebView from '@libs/getUAForWebView';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import {handleRestrictedEvent} from '@userActions/App';
import {setPlaidEvent} from '@userActions/BankAccounts';
import {updatePersonalCardConnection} from '@userActions/PersonalCards';
import {addPersonalPlaidCard, openPlaidCompanyCardLogin} from '@userActions/Plaid';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import useFixPersonalCardConnection from './useFixPersonalCardConnection';

type FixPersonalCardConnectionPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.PERSONAL_CARD_FIX_CONNECTION>;

function FixPersonalCardConnectionPage({route}: FixPersonalCardConnectionPageProps) {
    const {cardID} = route.params;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const webViewRef = useRef<WebView>(null);
    const [isConnectionCompleted, setConnectionCompleted] = useState(false);
    const {card, url, isPlaid, country} = useFixPersonalCardConnection(cardID);
    const {isOffline} = useNetwork();
    const hasRequestedPlaidToken = useRef(false);

    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [plaidLinkToken] = useOnyx(ONYXKEYS.RAM_ONLY_PLAID_LINK_TOKEN);
    const [plaidData] = useOnyx(ONYXKEYS.PLAID_DATA);
    const [isPlaidDisabled] = useOnyx(ONYXKEYS.IS_PLAID_DISABLED);
    const authToken = session?.authToken ?? null;
    // Snapshot any stale Plaid token left over in Onyx from a previous Plaid flow.
    // We only render PlaidLink once the token differs from this snapshot — otherwise the
    // initial mount with the stale token starts a Plaid SDK create/destroy cycle that leaves
    // `ready` stuck at false after the real token arrives.
    const [stalePlaidLinkToken] = useState(plaidLinkToken);
    const hasFreshPlaidToken = !!plaidLinkToken && plaidLinkToken !== stalePlaidLinkToken;

    const plaidErrors = plaidData?.errors;
    const plaidDataErrorMessage = !isEmptyObject(plaidErrors) ? (Object.values(plaidErrors).at(0) ?? '') : '';

    const activityReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'FixPersonalCardConnectionPage',
        isConnectionCompleted,
    };
    const renderLoadingReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'FixPersonalCardConnectionPage',
    };
    const renderLoading = () => (
        <View style={[StyleSheet.absoluteFill, styles.fullScreenLoading]}>
            <ActivityIndicator
                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                reasonAttributes={renderLoadingReasonAttributes}
            />
        </View>
    );

    const checkIfConnectionCompleted = (navState: WebViewNavigation) => {
        if (!navState.url.includes(ROUTES.BANK_CONNECTION_COMPLETE)) {
            return;
        }
        setConnectionCompleted(true);
    };

    useEffect(() => {
        if (!isPlaid || isOffline || hasRequestedPlaidToken.current) {
            return;
        }
        hasRequestedPlaidToken.current = true;
        openPlaidCompanyCardLogin(country, '', undefined, true, cardID);
    }, [isPlaid, isOffline, country, cardID]);

    const handlePlaidLinkSuccess = ({publicToken, metadata}: {publicToken: string; metadata: PlaidLinkOnSuccessMetadata | LinkSuccessMetadata}) => {
        Log.info('[PlaidLink] Fix personal card success');
        const plaidConnectedFeed = (metadata?.institution as PlaidLinkOnSuccessMetadata['institution'])?.institution_id ?? (metadata?.institution as LinkSuccessMetadata['institution'])?.id;
        const plaidAccounts = metadata?.accounts;
        if (!plaidConnectedFeed || !plaidAccounts?.length) {
            return;
        }
        addPersonalPlaidCard(publicToken, plaidConnectedFeed, country, JSON.stringify(plaidAccounts));
        // Trigger a scrape so the broken-connection error clears immediately.
        // The non-Plaid flow relies on useFixPersonalCardConnection's effect, which
        // doesn't fire here because we navigate away before isCardBroken flips.
        updatePersonalCardConnection(cardID, card?.lastScrapeResult);
        Navigation.goBack(ROUTES.SETTINGS_WALLET_PERSONAL_CARD_DETAILS.getRoute(cardID));
    };

    const handlePlaidLinkEvent = (eventName: string) => {
        setPlaidEvent(eventName);
        // Limit the number of times a user can submit Plaid credentials (24-hour lockout)
        if (eventName === 'SUBMIT_CREDENTIALS') {
            handleRestrictedEvent(eventName);
        }
    };

    const handlePlaidLinkError = (error: ErrorEvent | null) => {
        Log.hmmm('[PlaidLink] Fix personal card error: ', error?.message);
    };

    const renderPlaid = () => {
        if (isPlaidDisabled) {
            return <Text style={[styles.formError, styles.ph5, styles.mv3]}>{translate('bankAccount.error.tooManyAttempts')}</Text>;
        }
        if (hasFreshPlaidToken) {
            return (
                <PlaidLink
                    token={plaidLinkToken}
                    onSuccess={handlePlaidLinkSuccess}
                    onError={handlePlaidLinkError}
                    onEvent={handlePlaidLinkEvent}
                    onExit={() => Navigation.goBack()}
                    receivedRedirectURI={getPlaidOAuthReceivedRedirectURI()}
                />
            );
        }
        if (plaidDataErrorMessage) {
            return <Text style={[styles.formError, styles.mh5]}>{plaidDataErrorMessage}</Text>;
        }
        return (
            <ActivityIndicator
                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                style={styles.flex1}
                reasonAttributes={renderLoadingReasonAttributes}
            />
        );
    };

    return (
        <ScreenWrapper
            testID="FixPersonalCardConnectionPage"
            shouldShowOfflineIndicator={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('personalCard.fixCard')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <FullPageOfflineBlockingView addBottomSafeAreaPadding>
                {isPlaid && renderPlaid()}
                {!isPlaid && !!url && !isConnectionCompleted && (
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
                {!isPlaid && isConnectionCompleted && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={styles.flex1}
                        reasonAttributes={activityReasonAttributes}
                    />
                )}
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

FixPersonalCardConnectionPage.displayName = 'FixPersonalCardConnectionPage';

export default FixPersonalCardConnectionPage;
