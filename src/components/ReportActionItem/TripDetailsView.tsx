import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import AnimatedEmptyStateBackground from '@pages/home/report/AnimatedEmptyStateBackground';
import variables from '@styles/variables';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import * as ReportUtils from '@src/libs/ReportUtils';
import * as TripReservationUtils from '@src/libs/TripReservationUtils';
import type {Reservation, ReservationTimeDetails} from '@src/types/onyx/Transaction';

type TripDetailsViewProps = {
    /** The active IOUReport, used for Onyx subscription */
    iouReportID?: string;
};

type ReservationViewProps = {
    reservation: Reservation;
};

function ReservationView({reservation}: ReservationViewProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();

    const reservationIcon = TripReservationUtils.getTripReservationIcon(reservation.type);

    const formatAirportInfo = (reservationTimeDetails: ReservationTimeDetails) => `${reservationTimeDetails.longName} (${reservationTimeDetails.shortName})`;

    const titleComponent = (
        <View style={styles.gap2}>
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
                    {reservation.start.address}
                </Text>
            )}
            <Text style={[styles.textSupportingSmallSize, styles.lh14]}>DDPNOF • American Airlines • AA 2661</Text>
        </View>
    );

    return (
        <MenuItemWithTopDescription
            description={translate(`travel.${reservation.type}`)}
            descriptionTextStyle={[styles.textLabelSupporting, styles.lh16, styles.tripDescriptionMargin]}
            titleComponent={titleComponent}
            titleContainerStyle={styles.justifyContentStart}
            secondaryIcon={reservationIcon}
            shouldShowRightIcon
            wrapperStyle={[styles.taskDescriptionMenuItem]}
            shouldGreyOutWhenDisabled={false}
            numberOfLinesTitle={0}
            interactive
            shouldStackHorizontally={false}
            onSecondaryInteraction={() => {}}
            iconHeight={20}
            iconWidth={20}
            iconStyles={[styles.tripReservationIconContainer(true), styles.mr2]}
            secondaryIconFill={theme.icon}
        />
    );
}

function TripDetailsView({iouReportID}: TripDetailsViewProps) {
    const StyleUtils = useStyleUtils();
    const {isSmallScreenWidth} = useWindowDimensions();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const tripTransactions = ReportUtils.getTripTransactions(iouReportID);

    const reservations: Reservation[] = TripReservationUtils.getReservationsFromTripTransactions(tripTransactions);

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
                </>
            </View>
        </View>
    );
}

TripDetailsView.displayName = 'TripDetailsView';

export default TripDetailsView;
