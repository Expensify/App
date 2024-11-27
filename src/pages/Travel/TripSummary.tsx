import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {NativeModules} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {ReservationView} from '@components/ReportActionItem/TripDetailsView';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import * as TripReservationUtils from '@src/libs/TripReservationUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type TripDetailsPageProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.TRIP_DETAILS>;

function TripDetailsPage({route}: TripDetailsPageProps) {
    const {translate} = useLocalize();
    const {canUseSpotnanaTravel} = usePermissions();

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${route.params.transactionID}`);
    const reservationType = transaction?.receipt?.reservationList?.at(0)?.type;
    const reservationsData: TripReservationUtils.ReservationData[] = TripReservationUtils.getReservationsFromTripTransactions(transaction ? [transaction] : []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            testID={TripDetailsPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
        >
            <FullPageNotFoundView
                shouldForceFullScreen
                shouldShow={!canUseSpotnanaTravel && !NativeModules.HybridAppModule}
            >
                <HeaderWithBackButton
                    title={reservationType ? `${translate(`travel.${reservationType}`)} ${translate('common.details').toLowerCase()}` : translate('common.details')}
                    shouldShowBackButton
                />
                <ScrollView>
                    {reservationsData.map(({reservation, transactionID, reportID, reservationIndex}) => {
                        return (
                            <OfflineWithFeedback>
                                <ReservationView
                                    reservation={reservation}
                                    transactionID={transactionID}
                                    reportID={reportID}
                                    reservationIndex={reservationIndex}
                                />
                            </OfflineWithFeedback>
                        );
                    })}
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

TripDetailsPage.displayName = 'TripDetailsPage';

export default TripDetailsPage;
