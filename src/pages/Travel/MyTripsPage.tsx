import React from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import ManageTrips from './ManageTrips';

function MyTripsPage() {
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            testID={MyTripsPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
        >
            <ManageTrips />
        </ScreenWrapper>
    );
}

MyTripsPage.displayName = 'MyTripsPage';

export default MyTripsPage;
