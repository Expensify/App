import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';
import type {Reservation} from '@src/types/onyx/Transaction';

type FlightTripDetailsProps = {
    reservation: Reservation;
    prevReservation: Reservation | undefined;
    personalDetails: OnyxEntry<PersonalDetails>;
};

function FlightTripDetails({reservation, prevReservation, personalDetails}: FlightTripDetailsProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    const startDate = DateUtils.getFormattedTransportDateAndHour(new Date(reservation.start.date));
    const endDate = DateUtils.getFormattedTransportDateAndHour(new Date(reservation.end.date));

    const prevFlightEndDate = prevReservation?.end.date;
    const layover = prevFlightEndDate && DateUtils.getFormattedDurationBetweenDates(translate, new Date(prevFlightEndDate), new Date(reservation.start.date));
    const flightDuration = DateUtils.getFormattedDuration(translate, reservation.duration);
    const flightRouteDescription = `${reservation.start.cityName} (${reservation.start.shortName}) ${translate('common.conjunctionTo')} ${reservation.end.cityName} (${
        reservation.end.shortName
    })`;

    const displayName = personalDetails?.displayName ?? reservation.travelerPersonalInfo?.name;

    return (
        <>
            <Text style={[styles.textHeadlineH1, styles.mh5, styles.mv3]}>{flightRouteDescription}</Text>

            {!!layover && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mh5, styles.mv3, styles.gap2]}>
                    <Icon
                        src={Expensicons.Hourglass}
                        height={variables.iconSizeNormal}
                        width={variables.iconSizeNormal}
                        fill={theme.icon}
                    />
                    <RenderHTML html={translate('travel.flightDetails.layover', {layover})} />
                </View>
            )}
            <MenuItemWithTopDescription
                description={`${translate('travel.flight')} ${CONST.DOT_SEPARATOR} ${flightDuration}`}
                title={`${reservation.company?.longName} ${CONST.DOT_SEPARATOR} ${reservation.route?.airlineCode}`}
                interactive={false}
            />
            <MenuItemWithTopDescription
                description={translate('common.date')}
                title={startDate.date}
                interactive={false}
            />

            <MenuItemWithTopDescription
                description={translate('travel.flightDetails.takeOff')}
                descriptionTextStyle={[styles.textLabelSupporting, styles.mb1]}
                titleComponent={<Text style={[styles.textLarge, styles.textHeadlineH2]}>{startDate.hour}</Text>}
                helperText={`${reservation.start.longName} (${reservation.start.shortName})${reservation.arrivalGate?.terminal ? `, ${reservation.arrivalGate?.terminal}` : ''}`}
                helperTextStyle={[styles.pb3, styles.mtn2]}
                interactive={false}
            />
            <MenuItemWithTopDescription
                description={translate('travel.flightDetails.landing')}
                descriptionTextStyle={[styles.textLabelSupporting, styles.mb1]}
                titleComponent={<Text style={[styles.textLarge, styles.textHeadlineH2]}>{endDate.hour}</Text>}
                helperText={`${reservation.end.longName} (${reservation.end.shortName})`}
                helperTextStyle={[styles.pb3, styles.mtn2]}
                interactive={false}
            />

            <View style={[styles.flexRow, styles.flexWrap]}>
                {!!reservation.route?.number && (
                    <View style={styles.w50}>
                        <MenuItemWithTopDescription
                            description={translate('travel.flightDetails.seat')}
                            title={reservation.route?.number}
                            interactive={false}
                        />
                    </View>
                )}
                {!!reservation.route?.class && (
                    <View style={styles.w50}>
                        <MenuItemWithTopDescription
                            description={translate('travel.flightDetails.class')}
                            title={reservation.route.class}
                            interactive={false}
                        />
                    </View>
                )}
                {!!reservation.confirmations?.at(0)?.value && (
                    <View style={styles.w50}>
                        <MenuItemWithTopDescription
                            description={translate('travel.flightDetails.recordLocator')}
                            title={reservation.confirmations?.at(0)?.value}
                            interactive={false}
                        />
                    </View>
                )}
            </View>
            {!!displayName && (
                <MenuItem
                    label={translate('travel.flightDetails.passenger')}
                    title={displayName}
                    icon={personalDetails?.avatar ?? Expensicons.FallbackAvatar}
                    iconType={CONST.ICON_TYPE_AVATAR}
                    description={personalDetails?.login ?? reservation.travelerPersonalInfo?.email}
                    interactive={false}
                    wrapperStyle={styles.pb3}
                />
            )}
        </>
    );
}

FlightTripDetails.displayName = 'FlightTripDetails';

export default FlightTripDetails;
