import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {ReservationView} from '@components/ReportActionItem/TripDetailsView';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import CONFIG from '@src/CONFIG';
import * as TripReservationUtils from '@src/libs/TripReservationUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DynamicTripSummaryPageProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.DYNAMIC_TRIP_SUMMARY>;

function DynamicTripSummaryPage({route}: DynamicTripSummaryPageProps) {
    const {translate} = useLocalize();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.TRAVEL_TRIP_SUMMARY.path);

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(route.params.transactionID)}`);
    const reservationsData: TripReservationUtils.ReservationData[] = TripReservationUtils.getReservationsFromTripReport(report, transaction ? [transaction] : []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            testID="DynamicTripSummaryPage"
            shouldShowOfflineIndicatorInWideScreen
        >
            <FullPageNotFoundView
                shouldForceFullScreen
                shouldShow={reservationsData.length === 0 || !CONFIG.IS_HYBRID_APP}
            >
                <HeaderWithBackButton
                    title={translate('travel.tripDetails')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack(backPath)}
                />
                <ScrollView>
                    {reservationsData.map(({reservation, transactionID, sequenceIndex, isCancelled}) => {
                        return (
                            <OfflineWithFeedback key={`${transactionID}-${sequenceIndex}`}>
                                <ReservationView
                                    reservation={reservation}
                                    transactionID={transactionID}
                                    tripRoomReportID={route.params.reportID}
                                    sequenceIndex={sequenceIndex}
                                    isCancelled={isCancelled}
                                />
                            </OfflineWithFeedback>
                        );
                    })}
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default DynamicTripSummaryPage;
