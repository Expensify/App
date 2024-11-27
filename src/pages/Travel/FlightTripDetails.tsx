import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import * as TripReservationUtils from '@libs/TripReservationUtils';
import CONST from '@src/CONST';
import type {PersonalDetails, Transaction} from '@src/types/onyx';

type FlightTripDetailsProps = {
    transaction: OnyxEntry<Transaction>;
    personalDetails: OnyxEntry<PersonalDetails>;
    reservationIndex: number;
};

function FlightTripDetails({transaction, personalDetails, reservationIndex}: FlightTripDetailsProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const flightReservation = transaction?.receipt?.reservationList?.at(reservationIndex);

    if (!flightReservation) {
        return null;
    }

    const reservationIcon = TripReservationUtils.getTripReservationIcon(flightReservation.type);
    const startDate = DateUtils.getFormattedTransportDateAndHour(new Date(flightReservation.start.date));
    const endDate = DateUtils.getFormattedTransportDateAndHour(new Date(flightReservation.end.date));

    const prevFlightStartDate = reservationIndex > 0 && transaction?.receipt?.reservationList?.at(reservationIndex - 1)?.end.date;
    const layover = prevFlightStartDate && DateUtils.getFormattedDurationBetweenDates(new Date(prevFlightStartDate), new Date(flightReservation.start.date));

    return (
        <>
            <MenuItem
                label={translate('travel.flightDetails.passenger')}
                title={personalDetails?.displayName}
                icon={personalDetails?.avatar ?? Expensicons.FallbackAvatar}
                iconType={CONST.ICON_TYPE_AVATAR}
                description={personalDetails?.login}
                interactive={false}
                wrapperStyle={styles.pb3}
            />

            {!!layover && (
                <>
                    <MenuItem
                        description={`${transaction?.receipt?.reservationList?.at(0)?.start.longName} (${transaction?.receipt?.reservationList?.at(0)?.start.shortName})`}
                        title={`${layover} ${translate('travel.flightDetails.layover')}`}
                        descriptionTextStyle={[styles.textLabelSupporting, styles.lh16]}
                        secondaryIcon={Expensicons.Chair}
                        wrapperStyle={[styles.taskDescriptionMenuItem]}
                        numberOfLinesDescription={2}
                        iconHeight={20}
                        iconWidth={20}
                        iconStyles={[StyleUtils.getTripReservationIconContainer(false), styles.mr3]}
                        secondaryIconFill={theme.icon}
                        interactive={false}
                    />
                    <View style={[styles.borderBottom, styles.mh5, styles.mv3]} />
                </>
            )}

            <MenuItem
                title={`${flightReservation.start.cityName} (${flightReservation.start.shortName}) ${translate('common.conjunctionTo')} ${flightReservation.end.cityName} (${
                    flightReservation.end.shortName
                })`}
                description={`${flightReservation.company?.longName} ${CONST.DOT_SEPARATOR} ${flightReservation.route?.airlineCode}`}
                descriptionTextStyle={[styles.textLabelSupporting, styles.lh16]}
                secondaryIcon={reservationIcon}
                wrapperStyle={[styles.taskDescriptionMenuItem]}
                numberOfLinesDescription={2}
                iconHeight={20}
                iconWidth={20}
                iconStyles={[StyleUtils.getTripReservationIconContainer(false), styles.mr3]}
                secondaryIconFill={theme.icon}
                interactive={false}
            />
            <MenuItemWithTopDescription
                description={`${translate('travel.flightDetails.takeOff')} ${CONST.DOT_SEPARATOR} ${startDate.date}`}
                title={startDate.hour}
                helperText={`${flightReservation.start.longName} (${flightReservation.start.shortName})${
                    flightReservation.arrivalGate?.terminal ? `, ${flightReservation.arrivalGate?.terminal}` : ''
                }`}
                helperTextStyle={[styles.pb3, styles.mtn2]}
                interactive={false}
            />
            <MenuItemWithTopDescription
                description={`${translate('travel.flightDetails.landing')} ${CONST.DOT_SEPARATOR} ${endDate.date}`}
                title={endDate.hour}
                helperText={`${flightReservation.end.longName} (${flightReservation.end.shortName})`}
                helperTextStyle={[styles.pb3, styles.mtn2]}
                interactive={false}
            />

            <View style={[styles.flexRow, styles.flexWrap]}>
                {!!flightReservation.route?.number && (
                    <View style={styles.w50}>
                        <MenuItemWithTopDescription
                            description={translate('travel.flightDetails.seat')}
                            title={flightReservation.route?.number}
                            interactive={false}
                        />
                    </View>
                )}
                {!!flightReservation.route?.class && (
                    <View style={styles.w50}>
                        <MenuItemWithTopDescription
                            description={translate('travel.flightDetails.class')}
                            title={flightReservation.route.class}
                            interactive={false}
                        />
                    </View>
                )}
                {!!flightReservation.confirmations?.at(0)?.value && (
                    <View style={styles.w50}>
                        <MenuItemWithTopDescription
                            description={translate('travel.flightDetails.recordLocator')}
                            title={flightReservation.confirmations?.at(0)?.value}
                            interactive={false}
                        />
                    </View>
                )}
            </View>
        </>
    );
}

FlightTripDetails.displayName = 'FlightTripDetails';

export default FlightTripDetails;
