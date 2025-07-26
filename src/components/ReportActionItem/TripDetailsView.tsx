import {differenceInCalendarDays} from 'date-fns';
import {Str} from 'expensify-common';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Icon from '@components/Icon';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';
import SpacerView from '@components/SpacerView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import StringUtils from '@libs/StringUtils';
import variables from '@styles/variables';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import type {ReservationData} from '@src/libs/TripReservationUtils';
import {formatAirportInfo, getPNRReservationDataFromTripReport, getTripReservationCode, getTripReservationIcon} from '@src/libs/TripReservationUtils';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import type {Reservation} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';

type ReservationViewProps = {
    reservation: Reservation;
    transactionID: string;
    tripRoomReportID: string;
    sequenceIndex: number;
};

function ReservationView({reservation, transactionID, tripRoomReportID, sequenceIndex}: ReservationViewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const reservationIcon = getTripReservationIcon(reservation.type);

    const getFormattedDate = () => {
        switch (reservation.type) {
            case CONST.RESERVATION_TYPE.FLIGHT:
                return DateUtils.getFormattedTransportDate(new Date(reservation.start.date));
            case CONST.RESERVATION_TYPE.HOTEL:
            case CONST.RESERVATION_TYPE.CAR:
                return DateUtils.getFormattedReservationRangeDate(new Date(reservation.start.date), new Date(reservation.end.date));
            default:
                return DateUtils.formatToLongDateWithWeekday(new Date(reservation.start.date));
        }
    };

    const formattedDate = getFormattedDate();

    const bottomDescription = useMemo(() => {
        const code = getTripReservationCode(reservation);
        if (reservation.type === CONST.RESERVATION_TYPE.FLIGHT) {
            const longName = reservation.company?.longName ? `${reservation.company?.longName} • ` : '';
            const shortName = reservation?.company?.shortName ? `${reservation?.company?.shortName} ` : '';
            return `${code}${longName}${shortName}${reservation.route?.number}`;
        }
        if (reservation.type === CONST.RESERVATION_TYPE.HOTEL) {
            return `${code}${StringUtils.removeDoubleQuotes(reservation.start.address)}`;
        }
        if (reservation.type === CONST.RESERVATION_TYPE.CAR) {
            const vendor = reservation.vendor ? `${reservation.vendor} • ` : '';
            return `${vendor}${reservation.start.location}`;
        }
        if (reservation.type === CONST.RESERVATION_TYPE.TRAIN) {
            return reservation.route?.name;
        }
        return StringUtils.removeDoubleQuotes(reservation.start.address) ?? reservation.start.location;
    }, [reservation]);

    const titleComponent = () => {
        if (reservation.type === CONST.RESERVATION_TYPE.FLIGHT || reservation.type === CONST.RESERVATION_TYPE.TRAIN) {
            return (
                <View style={styles.gap1}>
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                        <Text style={[styles.textStrong, styles.lh20, shouldUseNarrowLayout && styles.flex1]}>{formatAirportInfo(reservation.start)}</Text>
                        <Icon
                            src={Expensicons.ArrowRightLong}
                            width={variables.iconSizeSmall}
                            height={variables.iconSizeSmall}
                            fill={theme.icon}
                        />
                        <Text style={[styles.textStrong, styles.lh20, shouldUseNarrowLayout && styles.flex1]}>{formatAirportInfo(reservation.end)}</Text>
                    </View>
                    {!!bottomDescription && <Text style={[styles.textSmall, styles.colorMuted, styles.lh14]}>{bottomDescription}</Text>}
                </View>
            );
        }

        return (
            <View style={styles.gap1}>
                <Text
                    numberOfLines={1}
                    style={[styles.textStrong, styles.lh20]}
                >
                    {reservation.type === CONST.RESERVATION_TYPE.CAR ? reservation.carInfo?.name : Str.recapitalize(reservation.start.longName ?? '')}
                </Text>
                {!!bottomDescription && (
                    <Text
                        style={[styles.textSmall, styles.colorMuted, styles.lh14]}
                        testID={CONST.RESERVATION_ADDRESS_TEST_ID}
                    >
                        {bottomDescription}
                    </Text>
                )}
            </View>
        );
    };

    return (
        <MenuItemWithTopDescription
            description={formattedDate}
            descriptionTextStyle={[styles.textLabelSupporting, styles.lh16]}
            titleComponent={titleComponent()}
            titleContainerStyle={[styles.justifyContentStart, styles.gap1]}
            secondaryIcon={reservationIcon}
            isSecondaryIconHoverable
            shouldShowRightIcon
            wrapperStyle={[styles.taskDescriptionMenuItem]}
            shouldGreyOutWhenDisabled={false}
            numberOfLinesTitle={0}
            interactive
            shouldStackHorizontally={false}
            onSecondaryInteraction={() => {}}
            iconHeight={20}
            iconWidth={20}
            iconStyles={[StyleUtils.getTripReservationIconContainer(false), styles.mr3]}
            secondaryIconFill={theme.icon}
            onPress={() =>
                Navigation.navigate(
                    ROUTES.TRAVEL_TRIP_DETAILS.getRoute(tripRoomReportID, transactionID, String(reservation.reservationID), sequenceIndex, Navigation.getReportRHPActiveRoute()),
                )
            }
        />
    );
}

type TripDetailsViewProps = {
    /** The active tripRoomReportID, used for Onyx subscription */
    tripRoomReport: OnyxEntry<Report>;

    /** Whether we should display the horizontal rule below the component */
    shouldShowHorizontalRule: boolean;

    /** Trip transactions associated with the report */
    tripTransactions: Transaction[];
};

function TripDetailsView({tripRoomReport, shouldShowHorizontalRule, tripTransactions}: TripDetailsViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const getTripDescription = useCallback(
        (amount: number, currency: string, reservations: ReservationData[]) => {
            const trips = `${reservations.length} ${reservations.length === 1 ? translate('travel.trip') : translate('travel.trips')}`;
            return `${convertToDisplayString(amount, currency)} • ${trips.toLowerCase()}`;
        },
        [translate],
    );

    const getTripTitle = useCallback(
        (reservations: ReservationData[]) => {
            if (reservations.length === 0) {
                return '';
            }

            const firstReservation = reservations.at(0)?.reservation;
            const lastReservation = reservations.at(reservations.length - 1)?.reservation;

            if (!lastReservation || !firstReservation) {
                return '';
            }

            switch (firstReservation?.type) {
                case CONST.RESERVATION_TYPE.FLIGHT:
                    return `${translate('travel.flightTo')} ${formatAirportInfo(lastReservation.end, true)}`;
                case CONST.RESERVATION_TYPE.TRAIN:
                    return `${translate('travel.trainTo')} ${Str.recapitalize(lastReservation.end.longName ?? '')}`;
                case CONST.RESERVATION_TYPE.HOTEL: {
                    const nights = differenceInCalendarDays(new Date(lastReservation?.end.date), new Date(firstReservation.start.date));
                    return `${nights} ${nights > 1 ? translate('travel.nightsIn') : translate('travel.nightIn')} ${firstReservation.start.longName}`;
                }
                case CONST.RESERVATION_TYPE.CAR: {
                    const days = differenceInCalendarDays(new Date(lastReservation.end.date), new Date(firstReservation.start.date));
                    return `${days} ${days > 1 ? translate('travel.daysCarRental') : translate('travel.dayCarRental')}`;
                }
                default:
                    return '';
            }
        },
        [translate],
    );

    if (!tripRoomReport) {
        return null;
    }

    const reservationsData = getPNRReservationDataFromTripReport(tripRoomReport, tripTransactions);

    return (
        <View>
            <View style={[styles.flexRow, styles.pointerEventsNone, styles.containerWithSpaceBetween, styles.ph5, styles.pv3]}>
                <View style={[styles.flex1, styles.justifyContentCenter]}>
                    <Text
                        style={[styles.textLabelSupporting]}
                        numberOfLines={1}
                    >
                        {translate('travel.tripSummary')}
                    </Text>
                </View>
            </View>
            <>
                {reservationsData.map(({reservations, pnrID, currency, totalFareAmount}) => (
                    <Section
                        key={pnrID}
                        title={getTripTitle(reservations)}
                        subtitle={getTripDescription(totalFareAmount, currency, reservations)}
                        containerStyles={[styles.ph0, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}
                        titleStyles={[styles.textStrong, styles.ph5]}
                        subtitleStyles={[styles.textLabelSupporting, styles.ph5, styles.pb2]}
                        subtitleMuted
                    >
                        {reservations.map(({reservation, transactionID, sequenceIndex}) => {
                            return (
                                <OfflineWithFeedback>
                                    <ReservationView
                                        reservation={reservation}
                                        transactionID={transactionID}
                                        tripRoomReportID={tripRoomReport.reportID}
                                        sequenceIndex={sequenceIndex}
                                    />
                                </OfflineWithFeedback>
                            );
                        })}
                    </Section>
                ))}
                <SpacerView
                    shouldShow={shouldShowHorizontalRule}
                    style={[shouldShowHorizontalRule && styles.reportHorizontalRule]}
                />
            </>
        </View>
    );
}

TripDetailsView.displayName = 'TripDetailsView';

export default TripDetailsView;
export {ReservationView};
