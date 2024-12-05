import React from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import type {Reservation} from '@src/types/onyx/Transaction';

type HotelTripDetailsProps = {
    reservation: Reservation;
};

function HotelTripDetails({reservation}: HotelTripDetailsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const checkInDate = DateUtils.getFormattedTransportDateAndHour(new Date(reservation.start.date));
    const checkOutDate = DateUtils.getFormattedTransportDateAndHour(new Date(reservation.end.date));
    const cancellationText = reservation.cancellationDeadline
        ? `${translate('travel.hotelDetails.cancellationUntil')} ${DateUtils.getFormattedTransportDateAndHour(new Date(reservation.cancellationDeadline)).date}`
        : reservation.cancellationPolicy;

    return (
        <>
            <Text style={[styles.textHeadlineH1, styles.mh5, styles.mv3]}>{reservation.start.longName}</Text>
            <MenuItemWithTopDescription
                description={translate('common.address')}
                title={reservation.start.address}
                interactive={false}
            />
            <MenuItemWithTopDescription
                description={translate('travel.hotelDetails.checkIn')}
                titleComponent={<Text style={[styles.textLarge, styles.textHeadlineH2]}>{checkInDate.date}</Text>}
                interactive={false}
            />
            <MenuItemWithTopDescription
                description={translate('travel.hotelDetails.checkOut')}
                titleComponent={<Text style={[styles.textLarge, styles.textHeadlineH2]}>{checkOutDate.date}</Text>}
                interactive={false}
            />

            {!!reservation.roomClass && (
                <MenuItemWithTopDescription
                    description={translate('travel.hotelDetails.roomType')}
                    title={reservation.roomClass.trim()}
                    interactive={false}
                />
            )}
            {!!cancellationText && (
                <MenuItemWithTopDescription
                    description={translate('travel.hotelDetails.cancellation')}
                    title={cancellationText}
                    interactive={false}
                />
            )}
            {!!reservation.confirmations?.at(0)?.value && (
                <MenuItemWithTopDescription
                    description={translate('travel.hotelDetails.confirmation')}
                    title={reservation.confirmations?.at(0)?.value}
                    interactive={false}
                />
            )}
            <MenuItem
                label={translate('travel.hotelDetails.guest')}
                title={reservation.travelerPersonalInfo?.name}
                icon={Expensicons.FallbackAvatar}
                iconType={CONST.ICON_TYPE_AVATAR}
                description={reservation.travelerPersonalInfo?.email}
                interactive={false}
                wrapperStyle={styles.pb3}
            />
        </>
    );
}

HotelTripDetails.displayName = 'HotelTripDetails';

export default HotelTripDetails;
