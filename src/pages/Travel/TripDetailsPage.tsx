import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import {getTripIDFromTransactionParentReportID} from '@libs/ReportUtils';
import {getReservationDetailsFromSequence, getReservationsFromTripReport} from '@libs/TripReservationUtils';
import {openTravelDotLink} from '@userActions/Link';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList} from '@src/types/onyx';
import type {Reservation} from '@src/types/onyx/Transaction';
import CarTripDetails from './CarTripDetails';
import FlightTripDetails from './FlightTripDetails';
import HotelTripDetails from './HotelTripDetails';
import TrainTripDetails from './TrainTripDetails';

function pickTravelerPersonalDetails(personalDetails: OnyxEntry<PersonalDetailsList>, reservation: Reservation | undefined) {
    return Object.values(personalDetails ?? {})?.find((personalDetail) => personalDetail?.login === reservation?.travelerPersonalInfo?.email);
}

type TripDetailsPageProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.TRIP_DETAILS>;

function TripDetailsPage({route}: TripDetailsPageProps) {
    const icons = useMemoizedLazyExpensifyIcons(['NewWindow'] as const);
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const isBlockedFromSpotnanaTravel = isBetaEnabled(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL);
    const {isOffline} = useNetwork();

    const [isModifyTripLoading, setIsModifyTripLoading] = useState(false);
    const [isTripSupportLoading, setIsTripSupportLoading] = useState(false);

    const {transactionID, sequenceIndex, pnr, reportID} = route.params;

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`, {canBeMissing: true});
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`, {canBeMissing: true});
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID ?? reportID}`, {canBeMissing: true});

    const tripID = getTripIDFromTransactionParentReportID(parentReport?.reportID);
    // If pnr is not passed and transaction is present, we want to use transaction to get the trip reservations as the provided sequenceIndex now refers to the position of trip reservation in transaction's reservation list
    const tripReservations = getReservationsFromTripReport(!Number(pnr) && transaction ? undefined : parentReport, transaction ? [transaction] : []);

    const {reservation, prevReservation, reservationType, reservationIcon} = getReservationDetailsFromSequence(tripReservations, Number(sequenceIndex));
    const travelerPersonalDetailsSelector = useCallback((personalDetails: OnyxEntry<PersonalDetailsList>) => pickTravelerPersonalDetails(personalDetails, reservation), [reservation]);

    const [travelerPersonalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: travelerPersonalDetailsSelector, canBeMissing: true}, [travelerPersonalDetailsSelector]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            testID={TripDetailsPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
        >
            <FullPageNotFoundView
                shouldForceFullScreen
                shouldShow={!reservation || (!CONFIG.IS_HYBRID_APP && isBlockedFromSpotnanaTravel)}
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
                            prevReservation={prevReservation}
                            reservation={reservation}
                            personalDetails={travelerPersonalDetails}
                        />
                    )}
                    {!!reservation && reservationType === CONST.RESERVATION_TYPE.HOTEL && (
                        <HotelTripDetails
                            reservation={reservation}
                            personalDetails={travelerPersonalDetails}
                        />
                    )}
                    {!!reservation && reservationType === CONST.RESERVATION_TYPE.CAR && (
                        <CarTripDetails
                            reservation={reservation}
                            personalDetails={travelerPersonalDetails}
                        />
                    )}
                    {!!reservation && reservationType === CONST.RESERVATION_TYPE.TRAIN && (
                        <TrainTripDetails
                            reservation={reservation}
                            personalDetails={travelerPersonalDetails}
                        />
                    )}
                    <MenuItem
                        title={translate('travel.modifyTrip')}
                        icon={Expensicons.Pencil}
                        iconRight={icons.NewWindow}
                        shouldShowRightIcon
                        onPress={() => {
                            setIsModifyTripLoading(true);
                            openTravelDotLink(activePolicyID, CONST.TRIP_ID_PATH(tripID))?.finally(() => {
                                setIsModifyTripLoading(false);
                            });
                        }}
                        wrapperStyle={styles.mt3}
                        shouldShowLoadingSpinnerIcon={isModifyTripLoading}
                        disabled={isModifyTripLoading || isOffline}
                    />
                    <MenuItem
                        title={translate('travel.tripSupport')}
                        icon={Expensicons.Phone}
                        iconRight={icons.NewWindow}
                        shouldShowRightIcon
                        onPress={() => {
                            setIsTripSupportLoading(true);
                            openTravelDotLink(activePolicyID, CONST.TRIP_SUPPORT)?.finally(() => {
                                setIsTripSupportLoading(false);
                            });
                        }}
                        shouldShowLoadingSpinnerIcon={isTripSupportLoading}
                        disabled={isTripSupportLoading || isOffline}
                    />
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

TripDetailsPage.displayName = 'TripDetailsPage';

export default TripDetailsPage;
