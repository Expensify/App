import React from 'react';
import {NativeModules} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';

function TripDetails() {
    const {translate} = useLocalize();
    const {canUseSpotnanaTravel} = usePermissions();

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            testID={TripDetails.displayName}
            shouldShowOfflineIndicatorInWideScreen
        >
            <FullPageNotFoundView
                shouldForceFullScreen
                shouldShow={!canUseSpotnanaTravel && !NativeModules.HybridAppModule}
            >
                <HeaderWithBackButton
                    title={translate('travel.header')}
                    shouldShowBackButton
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

TripDetails.displayName = 'TripDetails';

export default TripDetails;
