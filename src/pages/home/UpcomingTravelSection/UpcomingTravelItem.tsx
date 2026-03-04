import {differenceInCalendarDays} from 'date-fns';
import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getTripReservationIcon} from '@libs/TripReservationUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Reservation} from '@src/types/onyx/Transaction';
import type {UpcomingReservation} from './useUpcomingTravelReservations';

type UpcomingTravelItemProps = {
    reservation: UpcomingReservation;
};

function getDestinationCity(reservation: Reservation): string {
    const isDestinationType = reservation.type === CONST.RESERVATION_TYPE.FLIGHT || reservation.type === CONST.RESERVATION_TYPE.TRAIN;
    const cityName = isDestinationType ? reservation.end.cityName : reservation.start.cityName;
    return Str.recapitalize(cityName?.split(',')[0].trim() ?? '');
}

function getTitle(translate: ReturnType<typeof useLocalize>['translate'], reservation: Reservation): string {
    const city = getDestinationCity(reservation);
    switch (reservation.type) {
        case CONST.RESERVATION_TYPE.FLIGHT:
            return translate('homePage.upcomingTravelSection.flightTo', {destination: city});
        case CONST.RESERVATION_TYPE.TRAIN:
            return translate('homePage.upcomingTravelSection.trainTo', {destination: city});
        case CONST.RESERVATION_TYPE.HOTEL:
            return translate('homePage.upcomingTravelSection.hotelIn', {destination: city});
        case CONST.RESERVATION_TYPE.CAR:
            return translate('homePage.upcomingTravelSection.carRentalIn', {destination: city});
        default:
            return city;
    }
}

function getRelativeTime(translate: ReturnType<typeof useLocalize>['translate'], startDate: string): string {
    const diffDays = differenceInCalendarDays(new Date(startDate), new Date());

    // Today or in the past (shouldn't happen given the 7-day window filter, but handled for safety)
    if (diffDays <= 0) {
        return translate('homePage.upcomingTravelSection.today');
    }
    if (diffDays === CONST.UPCOMING_TRAVEL_WINDOW_DAYS) {
        return translate('homePage.upcomingTravelSection.inOneWeek');
    }
    return translate('homePage.upcomingTravelSection.inDays', {count: diffDays});
}

function getTypeIdentifier(reservation: Reservation): string {
    switch (reservation.type) {
        case CONST.RESERVATION_TYPE.FLIGHT:
            return [reservation.company?.shortName, reservation.route?.number].filter(Boolean).join(' ');

        case CONST.RESERVATION_TYPE.HOTEL:
            return Str.recapitalize(reservation.start.longName ?? '');

        case CONST.RESERVATION_TYPE.CAR:
        case CONST.RESERVATION_TYPE.TRAIN:
            return reservation.vendor ?? '';

        default:
            return '';
    }
}

function UpcomingTravelItem({reservation: upcomingReservation}: UpcomingTravelItemProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Plane', 'Bed', 'CarWithKey', 'Train', 'Luggage', 'ArrowRight']);

    const {reservation, reportID, transactionID, sequenceIndex} = upcomingReservation;
    const reservationIcon = getTripReservationIcon(expensifyIcons, reservation.type);
    const title = getTitle(translate, reservation);
    const relativeTime = getRelativeTime(translate, reservation.start.date);
    const typeId = getTypeIdentifier(reservation);
    const subtitle = typeId ? `${relativeTime} ${CONST.DOT_SEPARATOR} ${typeId}` : relativeTime;

    const handlePress = () => {
        Navigation.navigate(ROUTES.TRAVEL_TRIP_DETAILS.getRoute(reportID, transactionID, reservation.reservationID, sequenceIndex));
    };

    return (
        <MenuItemWithTopDescription
            description={subtitle}
            title={title}
            titleStyle={styles.textBold}
            onPress={handlePress}
            shouldShowRightIcon
            leftComponent={
                <View style={[styles.homeWidgetIconContainer, StyleUtils.getBackgroundColorStyle(theme.border)]}>
                    <Icon
                        src={reservationIcon}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                        fill={theme.icon}
                    />
                </View>
            }
            wrapperStyle={[styles.alignItemsCenter, shouldUseNarrowLayout ? styles.ph5 : styles.ph8]}
            hasSubMenuItems
            viewMode={CONST.OPTION_MODE.COMPACT}
            rightIconWrapperStyle={styles.pl2}
            shouldCheckActionAllowedOnPress={false}
        />
    );
}

export default UpcomingTravelItem;
