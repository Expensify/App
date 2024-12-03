import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {NativeModules} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import * as TripReservationUtils from '@libs/TripReservationUtils';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import CarTripDetails from './CarTripDetails';
import FlightTripDetails from './FlightTripDetails';
import HotelTripDetails from './HotelTripDetails';
import TrainTripDetails from './TrainTripDetails';

type TripDetailsPageProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.TRIP_DETAILS>;

function TripDetailsPage({route}: TripDetailsPageProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {canUseSpotnanaTravel} = usePermissions();

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${route.params.transactionID}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`);

    const tripID = ReportUtils.getTripIDFromTransactionParentReportID(report?.parentReportID);
    const accountID = Object.keys(report?.participants ?? {}).at(0) ?? '-1';
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: (data) => data?.[accountID]});
    const reservationType = transaction?.receipt?.reservationList?.at(route.params.reservationIndex ?? 0)?.type;
    const reservation = transaction?.receipt?.reservationList?.at(route.params.reservationIndex ?? 0);
    const reservationIcon = TripReservationUtils.getTripReservationIcon(reservation?.type);

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
                    icon={reservationIcon}
                    iconHeight={20}
                    iconWidth={20}
                    iconStyles={[StyleUtils.getTripReservationIconContainer(false), styles.mr3]}
                    iconFill={theme.icon}
                />
                <ScrollView>
                    {!!reservation && reservationType === CONST.RESERVATION_TYPE.FLIGHT && (
                        <FlightTripDetails
                            reservation={reservation}
                            personalDetails={personalDetails}
                        />
                    )}
                    {!!reservation && reservationType === CONST.RESERVATION_TYPE.HOTEL && (
                        <HotelTripDetails
                            reservation={reservation}
                            personalDetails={personalDetails}
                        />
                    )}
                    {!!reservation && reservationType === CONST.RESERVATION_TYPE.CAR && (
                        <CarTripDetails
                            reservation={reservation}
                            personalDetails={personalDetails}
                        />
                    )}
                    {!!reservation && reservationType === CONST.RESERVATION_TYPE.TRAIN && (
                        <TrainTripDetails
                            reservation={reservation}
                            personalDetails={personalDetails}
                        />
                    )}
                    <MenuItem
                        title={translate('travel.modifyTrip')}
                        icon={Expensicons.Pencil}
                        iconFill={theme.iconSuccessFill}
                        iconRight={Expensicons.NewWindow}
                        shouldShowRightIcon
                        onPress={() => {
                            Link.openTravelDotLink(activePolicyID, CONST.TRIP_ID_PATH(tripID));
                        }}
                        wrapperStyle={styles.mt3}
                    />
                    <MenuItem
                        title={translate('travel.tripSupport')}
                        icon={Expensicons.Phone}
                        iconFill={theme.iconSuccessFill}
                        iconRight={Expensicons.NewWindow}
                        shouldShowRightIcon
                        onPress={() => {
                            Link.openTravelDotLink(activePolicyID, CONST.TRIP_ID_PATH(tripID));
                        }}
                    />
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

TripDetailsPage.displayName = 'TripDetailsPage';

export default TripDetailsPage;
