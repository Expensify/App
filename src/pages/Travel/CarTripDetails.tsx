import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
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
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const pickUpDate = DateUtils.getFormattedTransportDateAndHour(new Date(reservation.start.date));
    const dropOffDate = DateUtils.getFormattedTransportDateAndHour(new Date(reservation.end.date));

    let cancellationText = reservation.cancellationPolicy;
    if (reservation.cancellationDeadline) {
        cancellationText = `${translate('travel.carDetails.cancellationUntil')} ${DateUtils.getFormattedCancellationDate(new Date(reservation.cancellationDeadline))}`;
    }

    if (reservation.cancellationPolicy === null && reservation.cancellationDeadline === null) {
        cancellationText = translate('travel.carDetails.freeCancellation');
    }

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
                    numberOfLinesTitle={2}
                />
            )}
            {!!reservation.reservationID && (
                <MenuItemWithTopDescription
                    description={translate('travel.carDetails.confirmation')}
                    title={reservation.confirmations?.at(0)?.value ?? reservation.reservationID}
                    interactive={false}
                    copyValue={reservation.confirmations?.at(0)?.value ?? reservation.reservationID}
                    copyable
                />
            )}
            {!!displayName && (
                <MenuItem
                    label={translate('travel.carDetails.driver')}
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

export default CarTripDetails;
