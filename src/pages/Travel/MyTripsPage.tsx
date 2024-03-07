import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import Permissions from '@libs/Permissions';
import type {CentralPaneNavigatorParamList} from '@navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Beta} from '@src/types/onyx';
import ManageTrips from './ManageTrips';

type MyTripsPageOnyxProps = {betas: OnyxEntry<Beta[]>};

type MyTripsPageProps = StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.TRAVEL.MY_TRIPS> & MyTripsPageOnyxProps;

function MyTripsPage({betas}: MyTripsPageProps) {
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();
    const canSeeTravelPage = Permissions.canSeeTravelPage(betas);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            testID={MyTripsPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                icon={Illustrations.Luggage}
                title={translate('travel.header')}
                shouldShowBackButton={isSmallScreenWidth}
                onBackButtonPress={() => Navigation.goBack()}
            />
            {canSeeTravelPage ? <ManageTrips /> : <FullPageNotFoundView />}
        </ScreenWrapper>
    );
}

MyTripsPage.displayName = 'MyTripsPage';

export default withOnyx<MyTripsPageProps, MyTripsPageOnyxProps>({
    betas: {
        key: ONYXKEYS.BETAS,
    },
})(MyTripsPage);
