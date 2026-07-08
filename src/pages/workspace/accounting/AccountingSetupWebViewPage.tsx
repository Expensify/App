import ActivityIndicator from '@components/ActivityIndicator';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import getUAForWebView from '@libs/getUAForWebView';
import Navigation from '@libs/Navigation/Navigation';

import {getShortLivedAuthTokenURL} from '@userActions/Link';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {WebView} from 'react-native-webview';

type AccountingSetupWebViewPageProps = {
    /** OldDot setup link to load inside the in-app WebView */
    uri: string;

    /** testID for the screen, used by automated tests */
    testID: string;

    /** Context label reported by the loading indicator for telemetry */
    context: string;

    /** Whether to append a short-lived auth token to the setup link before loading it, so the incognito WebView opens an authenticated URL instead of the raw command URL */
    shouldAppendShortLivedAuthToken?: boolean;
};

function AccountingSetupWebViewPage({uri, testID, context, shouldAppendShortLivedAuthToken = false}: AccountingSetupWebViewPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const authToken = session?.authToken ?? null;
    const [authenticatedUri, setAuthenticatedUri] = useState<string | null>(null);
    const hasFetchedAuthenticatedUri = useRef(false);

    const fetchAuthenticatedUri = () => {
        if (!shouldAppendShortLivedAuthToken || hasFetchedAuthenticatedUri.current) {
            return;
        }
        hasFetchedAuthenticatedUri.current = true;
        getShortLivedAuthTokenURL(uri).then(setAuthenticatedUri);
    };

    // Skip the token request while offline and retry it on reconnect, so an offline-opened page still ends up with an authenticated URL.
    const {isOffline} = useNetwork({onReconnect: fetchAuthenticatedUri});

    useEffect(() => {
        if (isOffline) {
            return;
        }
        fetchAuthenticatedUri();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only fetch once on mount when online
    }, []);

    const renderLoading = () => (
        <View style={[StyleSheet.absoluteFill, styles.fullScreenLoading]}>
            <ActivityIndicator
                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                reasonAttributes={{context}}
            />
        </View>
    );

    // Pages that don't opt into the short-lived auth token keep loading the raw uri immediately, exactly as before.
    const webViewUri = shouldAppendShortLivedAuthToken ? authenticatedUri : uri;

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            testID={testID}
        >
            <HeaderWithBackButton
                title={translate('workspace.accounting.title')}
                onBackButtonPress={() => Navigation.goBack()}
                shouldDisplayHelpButton={false}
            />
            <FullPageOfflineBlockingView>
                {webViewUri ? (
                    <WebView
                        source={{
                            uri: webViewUri,
                            headers: {
                                Cookie: `authToken=${authToken}`,
                            },
                        }}
                        userAgent={getUAForWebView()}
                        incognito // 'incognito' prop required for Android, issue here https://github.com/react-native-webview/react-native-webview/issues/1352
                        startInLoadingState
                        renderLoading={renderLoading}
                    />
                ) : (
                    renderLoading()
                )}
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

export default AccountingSetupWebViewPage;
