import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';
import type {Reservation} from '@src/types/onyx/Transaction';

type CarTripDetailsProps = {
    reservation: Reservation;
    personalDetails: OnyxEntry<PersonalDetails>;
};

function CarTripDetails({reservation, personalDetails}: CarTripDetailsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const pickUpDate = DateUtils.getFormattedTransportDateAndHour(new Date(reservation.start.date));
    const dropOffDate = DateUtils.getFormattedTransportDateAndHour(new Date(reservation.end.date));
    const cancellationText = reservation.cancellationDeadline
        ? `${translate('travel.carDetails.cancellationUntil')} ${DateUtils.getFormattedTransportDateAndHour(new Date(reservation.cancellationDeadline)).date}`
        : reservation.cancellationPolicy;

    const displayName = personalDetails?.displayName ?? reservation.travelerPersonalInfo?.name;

    return (
        <>
            <Text style={[styles.textHeadlineH1, styles.mh5, styles.mv3]}>{reservation.vendor}</Text>
            <MenuItemWithTopDescription
                description={translate('travel.carDetails.pickUp')}
                titleComponent={
                    <Text style={[styles.textLarge, styles.textHeadlineH2]}>
                        {pickUpDate.date} {CONST.DOT_SEPARATOR} {pickUpDate.hour}
                    </Text>
                }
                interactive={false}
                helperText={reservation.start.location}
                helperTextStyle={[styles.pb3, styles.mtn2]}
            />
            <MenuItemWithTopDescription
                description={translate('travel.carDetails.dropOff')}
                titleComponent={
                    <Text style={[styles.textLarge, styles.textHeadlineH2]}>
                        {dropOffDate.date} {CONST.DOT_SEPARATOR} {dropOffDate.hour}
                    </Text>
                }
                interactive={false}
                helperText={reservation.end.location}
                helperTextStyle={[styles.pb3, styles.mtn2]}
            />
            {!!reservation.carInfo?.name && (
                <MenuItemWithTopDescription
                    description={translate('travel.carDetails.carType')}
                    title={reservation.carInfo.name}
                    interactive={false}
                />
            )}
            {!!cancellationText && (
                <MenuItemWithTopDescription
                    description={translate('travel.carDetails.cancellation')}
                    title={cancellationText}
                    interactive={false}
                />
            )}
            {!!reservation.reservationID && (
                <MenuItemWithTopDescription
                    description={translate('travel.carDetails.confirmation')}
                    title={reservation.reservationID}
                    interactive={false}
                />
            )}
            {!!displayName && (
                <MenuItem
                    label={translate('travel.carDetails.driver')}
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

CarTripDetails.displayName = 'CarTripDetails';

export default CarTripDetails;
