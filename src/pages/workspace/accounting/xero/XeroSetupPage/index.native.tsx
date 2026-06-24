import React from 'react';
import {StyleSheet, View} from 'react-native';
import {WebView} from 'react-native-webview';
import ActivityIndicator from '@components/ActivityIndicator';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getXeroSetupLink} from '@libs/actions/connections/Xero';
import getUAForWebView from '@libs/getUAForWebView';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type XeroSetupPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.XERO_SETUP>;

function XeroSetupPage({route}: XeroSetupPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = route.params.policyID;
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const authToken = session?.authToken ?? null;

    const renderLoading = () => (
        <View style={[StyleSheet.absoluteFill, styles.fullScreenLoading]}>
            <ActivityIndicator
                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                reasonAttributes={{context: 'XeroSetupPage'}}
            />
        </View>
    );

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            testID="XeroSetupPage"
        >
            <HeaderWithBackButton
                title={translate('workspace.accounting.title')}
                onBackButtonPress={() => Navigation.goBack()}
                shouldDisplayHelpButton={false}
            />
            <FullPageOfflineBlockingView>
                <WebView
                    source={{
                        uri: getXeroSetupLink(policyID),
                        headers: {
                            Cookie: `authToken=${authToken}`,
                        },
                    }}
                    userAgent={getUAForWebView()}
                    incognito
                    startInLoadingState
                    renderLoading={renderLoading}
                />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

export default XeroSetupPage;
