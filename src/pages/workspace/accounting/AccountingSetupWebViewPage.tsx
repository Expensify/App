import ActivityIndicator from '@components/ActivityIndicator';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import getUAForWebView from '@libs/getUAForWebView';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {StyleSheet, View} from 'react-native';
import {WebView} from 'react-native-webview';

type AccountingSetupWebViewPageProps = {
    /** OldDot setup link to load inside the in-app WebView */
    uri: string;

    /** testID for the screen, used by automated tests */
    testID: string;

    /** Context label reported by the loading indicator for telemetry */
    context: string;
};

function AccountingSetupWebViewPage({uri, testID, context}: AccountingSetupWebViewPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const authToken = session?.authToken ?? null;

    const renderLoading = () => (
        <View style={[StyleSheet.absoluteFill, styles.fullScreenLoading]}>
            <ActivityIndicator
                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                reasonAttributes={{context}}
            />
        </View>
    );

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
                <WebView
                    source={{
                        uri,
                        headers: {
                            Cookie: `authToken=${authToken}`,
                        },
                    }}
                    userAgent={getUAForWebView()}
                    incognito // 'incognito' prop required for Android, issue here https://github.com/react-native-webview/react-native-webview/issues/1352
                    startInLoadingState
                    renderLoading={renderLoading}
                />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

export default AccountingSetupWebViewPage;
