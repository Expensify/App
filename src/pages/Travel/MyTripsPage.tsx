import React, {useCallback} from 'react';
import {NativeModules} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ManageTrips from './ManageTrips';

function MyTripsPage() {
    const {translate} = useLocalize();
    const {canUseSpotnanaTravel} = usePermissions();
    const [shouldReturnToOldDotAfterBooking] = useOnyx(ONYXKEYS.SHOULD_RETURN_TO_OLD_DOT_AFTER_BOOKING);

    const onBackButtonPress = useCallback(() => {
        if (NativeModules.HybridAppModule && shouldReturnToOldDotAfterBooking) {
            Log.info('[HybridApp] Returning to OldDot after closing MyTripsPage');
            NativeModules.HybridAppModule.closeReactNativeApp(false, false);
            return;
        }
        Navigation.goBack();
    }, [shouldReturnToOldDotAfterBooking]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            testID={MyTripsPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
        >
            <FullPageNotFoundView
                shouldForceFullScreen
                shouldShow={!canUseSpotnanaTravel}
            >
                <HeaderWithBackButton
                    title={translate('travel.header')}
                    shouldShowBackButton
                    onBackButtonPress={onBackButtonPress}
                />
                <ManageTrips />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

MyTripsPage.displayName = 'MyTripsPage';

export default MyTripsPage;
