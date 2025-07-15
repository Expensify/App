import type {StackScreenProps} from '@react-navigation/stack';
import React, {useRef} from 'react';
import WebView from 'react-native-webview';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {buildTravelDotURL} from '@libs/actions/Link';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';

type TravelDotLinkWebviewProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.TRAVEL_DOT_LINK_WEB_VIEW>;

function TravelDotLinkWebview({route}: TravelDotLinkWebviewProps) {
    const {translate} = useLocalize();
    const {token, isTestAccount} = route.params;
    const webViewRef = useRef<WebView>(null);
    const styles = useThemeStyles();

    const url = buildTravelDotURL(token, isTestAccount === 'true');

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            testID={TravelDotLinkWebview.displayName}
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('travel.header')}
                shouldShowBackButton
            />
            <WebView
                ref={webViewRef}
                source={{uri: url}}
                style={styles.flex1}
                incognito
                originWhitelist={['https://*']}
            />
        </ScreenWrapper>
    );
}

TravelDotLinkWebview.displayName = 'TravelDotLinkWebview';

export default TravelDotLinkWebview;
