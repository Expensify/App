import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {CentralPaneNavigatorParamList} from '@navigation/types';
import type SCREENS from '@src/SCREENS';
import ManageTrips from './ManageTrips';

type MyTripsPageProps = StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.TRAVEL.MY_TRIPS>;

function MyTripsPage({route}: MyTripsPageProps) {
    const {translate} = useLocalize();
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            testID={MyTripsPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                icon={Illustrations.PalmTree}
                title={translate('travel.header')}
                shouldShowBackButton={false}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <ManageTrips />
        </ScreenWrapper>
    );
}

MyTripsPage.displayName = 'MyTripsPage';

export default MyTripsPage;
