import React, {useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import type {WebViewNavigation} from 'react-native-webview';
import {WebView} from 'react-native-webview';
import ActivityIndicator from '@components/ActivityIndicator';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import getUAForWebView from '@libs/getUAForWebView';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import useFixPersonalCardConnection from './useFixPersonalCardConnection';

type FixPersonalCardConnectionPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.PERSONAL_CARD_FIX_CONNECTION>;

function FixPersonalCardConnectionPage({route}: FixPersonalCardConnectionPageProps) {
    const {cardID} = route.params;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const webViewRef = useRef<WebView>(null);
    const [isConnectionCompleted, setConnectionCompleted] = useState(false);
    const {url} = useFixPersonalCardConnection(cardID);

    const [session] = useOnyx(ONYXKEYS.SESSION);
    const authToken = session?.authToken ?? null;

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
                        reasonAttributes={activityReasonAttributes}
                    />
                )}
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

FixPersonalCardConnectionPage.displayName = 'FixPersonalCardConnectionPage';

export default FixPersonalCardConnectionPage;
