import {Str} from 'expensify-common';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import StringUtils from '@libs/StringUtils';
import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';
import type {Reservation} from '@src/types/onyx/Transaction';

type HotelTripDetailsProps = {
    reservation: Reservation;
    personalDetails: OnyxEntry<PersonalDetails>;
};

function HotelTripDetails({reservation, personalDetails}: HotelTripDetailsProps) {
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const styles = useThemeStyles();
    const {translate, preferredLocale} = useLocalize();

    const cancellationMapping: Record<string, string> = {
        [CONST.CANCELLATION_POLICY.UNKNOWN]: translate('travel.hotelDetails.cancellationPolicies.unknown'),
        [CONST.CANCELLATION_POLICY.NON_REFUNDABLE]: translate('travel.hotelDetails.cancellationPolicies.nonRefundable'),
        [CONST.CANCELLATION_POLICY.FREE_CANCELLATION_UNTIL]: translate('travel.hotelDetails.cancellationPolicies.freeCancellationUntil'),
        [CONST.CANCELLATION_POLICY.PARTIALLY_REFUNDABLE]: translate('travel.hotelDetails.cancellationPolicies.partiallyRefundable'),
    };

    const checkInDate = DateUtils.getFormattedTransportDateAndHour(new Date(reservation.start.date), preferredLocale);
    const checkOutDate = DateUtils.getFormattedTransportDateAndHour(new Date(reservation.end.date), preferredLocale);
    const cancellationText = reservation.cancellationDeadline
        ? `${translate('travel.hotelDetails.cancellationUntil')} ${DateUtils.getFormattedCancellationDate(new Date(reservation.cancellationDeadline), preferredLocale)}`
        : cancellationMapping[reservation.cancellationPolicy ?? CONST.CANCELLATION_POLICY.UNKNOWN];

    const displayName = personalDetails?.displayName ?? reservation.travelerPersonalInfo?.name;

    return (
        <>
            <Text style={[styles.textHeadlineH1, styles.mh5, styles.mv3]}>{Str.recapitalize(reservation.start.longName ?? '')}</Text>
            <MenuItemWithTopDescription
                description={translate('common.address')}
                title={StringUtils.removeDoubleQuotes(reservation.start.address)}
                numberOfLinesTitle={2}
                pressableTestID={CONST.RESERVATION_ADDRESS_TEST_ID}
                copyValue={reservation.start.address}
                copyable
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
                    numberOfLinesTitle={2}
                />
            )}
            {!!reservation.confirmations?.at(0)?.value && (
                <MenuItemWithTopDescription
                    description={translate('travel.hotelDetails.confirmation')}
                    title={reservation.confirmations?.at(0)?.value}
                    copyValue={reservation.confirmations?.at(0)?.value}
                    copyable
                    interactive={false}
                />
            )}
            {!!displayName && (
                <MenuItem
                    label={translate('travel.hotelDetails.guest')}
                    title={displayName}
                    icon={personalDetails?.avatar ?? icons.FallbackAvatar}
                    iconType={CONST.ICON_TYPE_AVATAR}
                    description={personalDetails?.login ?? reservation.travelerPersonalInfo?.email}
                    interactive={false}
                    wrapperStyle={styles.pb3}
                />
            )}
        </>
    );
}

export default HotelTripDetails;
