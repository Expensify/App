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
import variables from '@styles/variables';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import * as ReportUtils from '@src/libs/ReportUtils';
import * as TripReservationUtils from '@src/libs/TripReservationUtils';
import type {Reservation, ReservationTimeDetails} from '@src/types/onyx/Transaction';

type TripDetailsViewProps = {
    /** The active tripRoomReportID, used for Onyx subscription */
    tripRoomReportID?: string;

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

    const formatAirportInfo = (reservationTimeDetails: ReservationTimeDetails) =>
        `${reservationTimeDetails?.longName ? `${reservationTimeDetails?.longName} ` : ''}${reservationTimeDetails?.shortName}`;
    const getFormattedDate = () => {
        switch (reservation.type) {
            case CONST.RESERVATION_TYPE.FLIGHT:
            case CONST.RESERVATION_TYPE.RAIL:
                return DateUtils.getFormattedTransportDate(new Date(reservation.start.date));
            case CONST.RESERVATION_TYPE.HOTEL:
            case CONST.RESERVATION_TYPE.CAR:
                return DateUtils.getFormattedReservationRangeDate(new Date(reservation.start.date), new Date(reservation.end.date));
            default:
                return DateUtils.formatToLongDateWithWeekday(new Date(reservation.start.date));
        }
    };

    const formattedDate = getFormattedDate();

    const bottomDescription = `${reservation.confirmations?.length > 0 ? `${reservation.confirmations[0].value} • ` : ''}${
        reservation.type === CONST.RESERVATION_TYPE.FLIGHT
            ? `${reservation.company?.longName} • ${reservation?.company?.shortName ?? ''} ${reservation.route?.number}`
            : reservation.start.address ?? reservation.start.location
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

function TripDetailsView({tripRoomReportID, shouldShowHorizontalRule}: TripDetailsViewProps) {
    const StyleUtils = useStyleUtils();
    const {isSmallScreenWidth} = useWindowDimensions();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const tripTransactions = ReportUtils.getTripTransactions(tripRoomReportID);
    const reservations: Reservation[] = TripReservationUtils.getReservationsFromTripTransactions(tripTransactions);

    return (
        <View style={[StyleUtils.getReportWelcomeContainerStyle(isSmallScreenWidth, true)]}>
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
    );
}

TripDetailsView.displayName = 'TripDetailsView';

export default TripDetailsView;
