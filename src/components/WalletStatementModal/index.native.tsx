import ActivityIndicator from '@components/ActivityIndicator';

import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetailsByIDs} from '@hooks/usePersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';

import {isRecord} from '@libs/ObjectUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {WebViewMessageEvent} from 'react-native-webview';
import type {ShouldStartLoadRequest} from 'react-native-webview/lib/WebViewTypes';

import {guidedSetupAndTourStatusSelector} from '@selectors/Onboarding';
import noop from 'lodash/noop';
import React, {useRef} from 'react';
import {StyleSheet, View} from 'react-native';
import {WebView} from 'react-native-webview';

import type {WalletStatementProps} from './types';

import handleWalletStatementNavigation from './walletNavigationUtils';

/** Opaque URLs must not compare as trusted origins, even when they embed an HTTPS URL. */
function getWebOrigin(url: string): string | undefined {
    try {
        const parsedURL = new URL(url);
        if (parsedURL.protocol !== 'https:' && parsedURL.protocol !== 'http:') {
            return undefined;
        }
        return parsedURL.origin;
    } catch {
        // Invalid URLs are untrusted, not errors that should interrupt the statement.
        return undefined;
    }
}

function WalletStatementModal({statementPageURL}: WalletStatementProps) {
    const styles = useThemeStyles();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [guidedSetupAndTourStatus] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: guidedSetupAndTourStatusSelector});
    const isSelfTourViewed = guidedSetupAndTourStatus?.isSelfTourViewed;
    const hasCompletedGuidedSetupFlow = guidedSetupAndTourStatus?.hasCompletedGuidedSetupFlow;
    const [conciergePersonalDetails] = usePersonalDetailsByIDs([CONST.ACCOUNT_ID.CONCIERGE]);
    const delegateAccountID = useDelegateAccountID();

    const webViewRef = useRef<WebView>(null);

    const authToken = session?.authToken ?? null;
    const statementPageOrigin = getWebOrigin(statementPageURL);

    // Android does not call the navigation gate for the initial source.
    if (!statementPageOrigin) {
        return null;
    }

    const renderLoading = () => (
        <View style={[StyleSheet.absoluteFill, styles.fullScreenLoading]}>
            <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
        </View>
    );

    const canLoadStatementPage = (request: ShouldStartLoadRequest) => getWebOrigin(request.url) === statementPageOrigin;

    const navigateFromStatement = (event: WebViewMessageEvent) => {
        if (!webViewRef.current || getWebOrigin(event.nativeEvent.url) !== statementPageOrigin) {
            return;
        }

        let parsedData: unknown;
        try {
            parsedData = JSON.parse(event.nativeEvent.data);
        } catch {
            // Page messages are untrusted input and may contain sensitive data, so do not log parse errors.
            return;
        }

        if (!isRecord(parsedData) || !('type' in parsedData)) {
            return;
        }

        const type = parsedData.type;
        if (type !== CONST.WALLET.WEB_MESSAGE_TYPE.STATEMENT && type !== CONST.WALLET.WEB_MESSAGE_TYPE.CONCIERGE) {
            return;
        }

        const url = 'url' in parsedData ? parsedData.url : undefined;
        if (type === CONST.WALLET.WEB_MESSAGE_TYPE.STATEMENT && (typeof url !== 'string' || !url)) {
            return;
        }

        handleWalletStatementNavigation(
            conciergeReportID,
            introSelected,
            session?.accountID,
            isSelfTourViewed,
            hasCompletedGuidedSetupFlow,
            conciergePersonalDetails,
            delegateAccountID,
            type,
            typeof url === 'string' ? url : undefined,
        );
    };

    return (
        <WebView
            ref={webViewRef}
            // All URLs must reach our gate; WebView otherwise opens rejected origins in another app.
            originWhitelist={['*']}
            onShouldStartLoadWithRequest={canLoadStatementPage}
            // Popup requests can bypass the navigation gate and are not used by the statement.
            onOpenWindow={noop}
            source={{
                uri: statementPageURL,
                headers: {
                    Cookie: `authToken=${authToken}`,
                },
            }}
            incognito // 'incognito' prop required for Android, issue here https://github.com/react-native-webview/react-native-webview/issues/1352
            startInLoadingState
            renderLoading={renderLoading}
            onMessage={navigateFromStatement}
        />
    );
}

export default WalletStatementModal;
