import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import SpacerView from '@components/SpacerView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import DateUtils from '@libs/DateUtils';
import AnimatedEmptyStateBackground from '@pages/home/report/AnimatedEmptyStateBackground';
import variables from '@styles/variables';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import * as ReportUtils from '@src/libs/ReportUtils';
import * as TripReservationUtils from '@src/libs/TripReservationUtils';
import type {Reservation, ReservationTimeDetails} from '@src/types/onyx/Transaction';

// TODO: to be removed once backend is ready
const testReservationsList: Reservation[] = [
    {
        company: {
            longName: 'American Airlines',
            shortName: 'AA',
        },
        confirmations: [
            {
                name: 'Confirmation Number',
                value: 'DDPNOF',
            },
        ],
        start: {
            address: 'AA Address',
            date: '2022-08-21 21:36',
            longName: 'Philadelphia',
            shortName: 'PHL',
            timezoneOffset: -360,
        },
        end: {
            address: 'BB Address',
            date: '2022-11-10 12:36',
            longName: 'San Francisco',
            shortName: 'SFO',
            timezoneOffset: -360,
        },
        numPassengers: 2,
        route: {
            class: '',
            number: '2579',
        },
        type: CONST.RESERVATION_TYPE.FLIGHT,
    },
    {
        company: {
            longName: 'W San Francisco',
        },
        confirmations: [
            {
                name: 'Booking Number',
                value: 'SUDMBE',
            },
            {
                name: 'Confirmation Number',
                value: 'GGGGGGG-HHHHHH-IIIIII',
            },
        ],
        start: {
            address: '181 3rd St, San Francisco, CA 94103',
            date: '2023-01-22 21:40',
            longName: 'SFO123',
            shortName: 'SFO',
            timezoneOffset: -420,
        },
        end: {
            address: 'DD Address',
            date: '2023-02-10 12:00',
            longName: 'Denver-Denver Intl',
            shortName: 'DEN',
            timezoneOffset: -420,
        },
        numberOfRooms: 3,
        route: {
            class: '',
            number: '46564',
        },
        type: CONST.RESERVATION_TYPE.HOTEL,
    },
];

type TripDetailsViewProps = {
    /** The active IOUReport, used for Onyx subscription */
    iouReportID?: string;

    /** Whether we should display the horizontal rule below the component */
    shouldShowHorizontalRule: boolean;
};

type ReservationViewProps = {
    reservation: Reservation;
};

function ReservationView({reservation}: ReservationViewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    const reservationIcon = TripReservationUtils.getTripReservationIcon(reservation.type);

    const formatAirportInfo = (reservationTimeDetails: ReservationTimeDetails) => `${reservationTimeDetails.longName} (${reservationTimeDetails.shortName})`;

    const getFormattedDate = () => {
        switch (reservation.type) {
            case CONST.RESERVATION_TYPE.FLIGHT:
            case CONST.RESERVATION_TYPE.RAIL:
                return DateUtils.getFormattedTransportDate(new Date(reservation.start.date));
            case CONST.RESERVATION_TYPE.HOTEL:
                return DateUtils.getFormattedReservationRangeDate(new Date(reservation.start.date), new Date(reservation.end.date));
            default:
                return DateUtils.formatToLongDateWithWeekday(new Date(reservation.start.date));
        }
    };

    const formattedDate = getFormattedDate();

    const bottomDescription = `${reservation.confirmations?.length > 0 ? `${reservation.confirmations[0].value} • ` : ''}${
        reservation.type === CONST.RESERVATION_TYPE.FLIGHT
            ? `${reservation.company?.longName} • ${reservation?.company?.shortName ?? ''} ${reservation.route?.number}`
            : reservation.start.address
    }`;

    const titleComponent = (
        <View style={styles.gap1}>
            {reservation.type === CONST.RESERVATION_TYPE.FLIGHT ? (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                    <Text style={[styles.textNormalBold, styles.lh20]}>{formatAirportInfo(reservation.start)}</Text>
                    <Icon
                        src={Expensicons.ArrowRightLong}
                        width={variables.iconSizeSmall}
                        height={variables.iconSizeSmall}
                        fill={theme.icon}
                    />
                    <Text style={[styles.textNormalBold, styles.lh20]}>{formatAirportInfo(reservation.end)}</Text>
                </View>
            ) : (
                <Text
                    numberOfLines={1}
                    style={[styles.textNormalBold, styles.lh20]}
                >
                    {reservation.company?.longName}
                </Text>
            )}
            <Text style={[styles.textSupportingSmallSize, styles.lh14]}>{bottomDescription}</Text>
        </View>
    );

    return (
        <MenuItemWithTopDescription
            description={formattedDate}
            descriptionTextStyle={[styles.textLabelSupporting, styles.lh16]}
            titleComponent={titleComponent}
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
            iconStyles={[styles.tripReservationIconContainer(true), styles.mr3]}
            secondaryIconFill={theme.icon}
        />
    );
}

function TripDetailsView({iouReportID, shouldShowHorizontalRule}: TripDetailsViewProps) {
    const StyleUtils = useStyleUtils();
    const {isSmallScreenWidth} = useWindowDimensions();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // TODO: once backend is ready uncomment lines below and remove test data
    const reservations = testReservationsList;
    // const tripTransactions = ReportUtils.getTripTransactions(iouReportID);

    // const reservations: Reservation[] = TripReservationUtils.getReservationsFromTripTransactions(tripTransactions);

    return (
        <View style={[StyleUtils.getReportWelcomeContainerStyle(isSmallScreenWidth, true)]}>
            <AnimatedEmptyStateBackground />
            <View style={[StyleUtils.getReportWelcomeTopMarginStyle(isSmallScreenWidth, true)]}>
                <View style={[styles.flexRow, styles.pointerEventsNone, styles.containerWithSpaceBetween, styles.ph5, styles.pv2]}>
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
                    {reservations.map((reservation) => (
                        <OfflineWithFeedback>
                            <ReservationView reservation={reservation} />
                        </OfflineWithFeedback>
                    ))}
                    <SpacerView
                        shouldShow={shouldShowHorizontalRule}
                        style={[shouldShowHorizontalRule && styles.reportHorizontalRule]}
                    />
                </>
            </View>
        </View>
    );
}

TripDetailsView.displayName = 'TripDetailsView';

export default TripDetailsView;
