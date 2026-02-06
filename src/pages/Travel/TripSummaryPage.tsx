import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {ReservationView} from '@components/ReportActionItem/TripDetailsView';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import CONFIG from '@src/CONFIG';
import * as TripReservationUtils from '@src/libs/TripReservationUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type TripSummaryPageProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.TRIP_SUMMARY>;

function TripSummaryPage({route}: TripSummaryPageProps) {
    const {translate} = useLocalize();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`, {canBeMissing: true});
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(route.params.transactionID)}`, {canBeMissing: true});
    const reservationsData: TripReservationUtils.ReservationData[] = TripReservationUtils.getReservationsFromTripReport(report, transaction ? [transaction] : []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            testID="TripSummaryPage"
            shouldShowOfflineIndicatorInWideScreen
        >
            <FullPageNotFoundView
                shouldForceFullScreen
                shouldShow={reservationsData.length === 0 || !CONFIG.IS_HYBRID_APP}
            >
                <HeaderWithBackButton
                    title={translate(`travel.tripDetails`)}
                    shouldShowBackButton
                />
                <ScrollView>
                    {reservationsData.map(({reservation, transactionID, sequenceIndex}) => {
                        return (
                            <OfflineWithFeedback key={`${transactionID}-${sequenceIndex}`}>
                                <ReservationView
                                    reservation={reservation}
                                    transactionID={transactionID}
                                    tripRoomReportID={route.params.reportID}
                                    sequenceIndex={sequenceIndex}
                                />
                            </OfflineWithFeedback>
                        );
                    })}
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default TripSummaryPage;
