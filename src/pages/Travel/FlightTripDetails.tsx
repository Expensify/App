import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import UserPills from '@components/UserPills';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';
import type {Reservation} from '@src/types/onyx/Transaction';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

type FlightTripDetailsProps = {
    reservation: Reservation;
    prevReservation: Reservation | undefined;
    personalDetails: OnyxEntry<PersonalDetails>;
};

function FlightTripDetails({reservation, prevReservation, personalDetails}: FlightTripDetailsProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, dateFnsLocale} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Hourglass']);

    const cabinClassMapping: Record<string, string> = {
        UNKNOWN_CABIN: translate('travel.flightDetails.cabinClasses.unknown'),
        ECONOMY: translate('travel.flightDetails.cabinClasses.economy'),
        PREMIUM_ECONOMY: translate('travel.flightDetails.cabinClasses.premiumEconomy'),
        BUSINESS: translate('travel.flightDetails.cabinClasses.business'),
        FIRST: translate('travel.flightDetails.cabinClasses.first'),
    };

    const startDate = DateUtils.getFormattedTransportDateAndHour(translate, dateFnsLocale, new Date(reservation.start.date));
    const endDate = DateUtils.getFormattedTransportDateAndHour(translate, dateFnsLocale, new Date(reservation.end.date));

    const prevFlightEndDate = prevReservation?.end.date;
    const layover = prevFlightEndDate && DateUtils.getFormattedDurationBetweenDates(translate, new Date(prevFlightEndDate), new Date(reservation.start.date));
    const flightDuration = reservation.duration ? DateUtils.getFormattedDuration(translate, reservation.duration) : '';
    const flightRouteDescription = `${reservation.start.cityName} (${reservation.start.shortName}) ${translate('common.conjunctionTo')} ${reservation.end.cityName} (${
        reservation.end.shortName
    })`;

    const displayName = personalDetails?.displayName ?? reservation.travelerPersonalInfo?.name;
    const airline = `${reservation.company?.longName} ${CONST.DOT_SEPARATOR} ${reservation.route?.airlineCode}`;
    const cabinClass = reservation.route?.class ? cabinClassMapping[reservation.route.class] || reservation.route.class : '';
    const recordLocator = reservation.confirmations?.at(0)?.value;

    return (
        <>
            <Text style={[styles.textHeadlineH1, styles.mh5, styles.mv3]}>{flightRouteDescription}</Text>

            {!!layover && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mh5, styles.mv3, styles.gap2]}>
                    <Icon
                        src={expensifyIcons.Hourglass}
                        height={variables.iconSizeNormal}
                        width={variables.iconSizeNormal}
                        fill={theme.icon}
                    />
                    <RenderHTML html={translate('travel.flightDetails.layover', layover)} />
                </View>
            )}
            <MenuItemField
                name={`${translate('travel.flight')} ${CONST.DOT_SEPARATOR} ${flightDuration}`}
                value={airline}
            >
                <MenuItem.Copy value={airline} />
            </MenuItemField>
            <MenuItemField
                name={translate('common.date')}
                value={startDate.date}
            >
                <MenuItem.Copy value={startDate.date} />
            </MenuItemField>

            <MenuItemWithTopDescription
                description={translate('travel.flightDetails.takeOff')}
                descriptionTextStyle={[styles.textLabelSupporting, styles.mb1]}
                titleComponent={<Text style={[styles.textLarge, styles.textHeadlineH2]}>{startDate.hour}</Text>}
                helperText={`${reservation.start.longName} (${reservation.start.shortName})${reservation.arrivalGate?.terminal ? `, ${reservation.arrivalGate?.terminal}` : ''}`}
                helperTextStyle={[styles.pb3, styles.mtn2]}
                interactive={false}
                copyValue={`${startDate.hour} ${reservation.start.longName} (${reservation.start.shortName})${reservation.arrivalGate?.terminal ? `, ${reservation.arrivalGate?.terminal}` : ''}`}
                copyable
            />
            <MenuItemWithTopDescription
                description={translate('travel.flightDetails.landing')}
                descriptionTextStyle={[styles.textLabelSupporting, styles.mb1]}
                titleComponent={<Text style={[styles.textLarge, styles.textHeadlineH2]}>{endDate.hour}</Text>}
                helperText={`${reservation.end.longName} (${reservation.end.shortName})`}
                helperTextStyle={[styles.pb3, styles.mtn2]}
                interactive={false}
                copyValue={`${endDate.hour} ${reservation.end.longName} (${reservation.end.shortName})`}
                copyable
            />

            <View style={[styles.flexRow, styles.flexWrap]}>
                {!!reservation.seatNumber && (
                    <View style={styles.w50}>
                        <MenuItemField
                            name={translate('travel.flightDetails.seat')}
                            value={reservation.seatNumber}
                            testID={CONST.FLIGHT_SEAT_TEST_ID}
                        >
                            <MenuItem.Copy value={reservation.seatNumber} />
                        </MenuItemField>
                    </View>
                )}
                {!!reservation.route?.class && (
                    <View style={styles.w50}>
                        <MenuItemField
                            name={translate('travel.flightDetails.class')}
                            value={cabinClass}
                        >
                            <MenuItem.Copy value={cabinClass} />
                        </MenuItemField>
                    </View>
                )}
                {!!recordLocator && (
                    <View style={styles.w100}>
                        <MenuItemField
                            name={translate('travel.flightDetails.recordLocator')}
                            value={recordLocator}
                        >
                            <MenuItem.Copy value={recordLocator} />
                        </MenuItemField>
                    </View>
                )}
            </View>
            {!!displayName && (
                <MenuItemWithTopDescription
                    description={translate('travel.flightDetails.passenger')}
                    descriptionTextStyle={styles.fontSizeLabel}
                    interactive={false}
                    accessibilityLabel={`${translate('travel.flightDetails.passenger')} ${displayName}`}
                    titleComponent={
                        <UserPills
                            users={[
                                {
                                    avatar: personalDetails?.avatar,
                                    displayName,
                                    accountID: personalDetails?.accountID,
                                    email: personalDetails?.login ?? reservation.travelerPersonalInfo?.email,
                                },
                            ]}
                        />
                    }
                />
            )}
        </>
    );
}

export default FlightTripDetails;
