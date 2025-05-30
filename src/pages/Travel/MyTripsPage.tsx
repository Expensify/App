import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ManageTrips from './ManageTrips';

function MyTripsPage() {
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();

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
                shouldShow={!isBetaEnabled(CONST.BETAS.SPOTNANA_TRAVEL) && !CONFIG.IS_HYBRID_APP}
            >
                <HeaderWithBackButton
                    title={translate('travel.header')}
                    shouldShowBackButton
                />
                <ManageTrips />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

MyTripsPage.displayName = 'MyTripsPage';

export default MyTripsPage;
