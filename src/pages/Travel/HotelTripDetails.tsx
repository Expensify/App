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

type HotelTripDetailsProps = {
    transaction: OnyxEntry<Transaction>;
    personalDetails: OnyxEntry<PersonalDetails>;
};

function HotelTripDetails({transaction, personalDetails}: HotelTripDetailsProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const hotelReservation = transaction?.receipt?.reservationList?.at(0);

    if (!transaction || !hotelReservation) {
        return null;
    }

    const reservationIcon = TripReservationUtils.getTripReservationIcon(hotelReservation.type);
    const checkInDate = DateUtils.getFormattedTransportDateAndHour(new Date(hotelReservation.start.date));
    const checkOutDate = DateUtils.getFormattedTransportDateAndHour(new Date(hotelReservation.end.date));

    return (
        <>
            <MenuItem
                label={translate('travel.hotelDetails.guest')}
                title={personalDetails?.displayName}
                icon={personalDetails?.avatar ?? Expensicons.FallbackAvatar}
                iconType={CONST.ICON_TYPE_AVATAR}
                description={personalDetails?.login}
                interactive={false}
                wrapperStyle={styles.pb3}
            />
            <MenuItem
                title={hotelReservation.start.longName}
                description={translate('travel.hotel')}
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
                description={translate('common.address')}
                title={hotelReservation.start.address}
                interactive={false}
            />
            <MenuItemWithTopDescription
                description={`${translate('travel.hotelDetails.checkIn')} ${CONST.DOT_SEPARATOR} ${checkInDate.date}`}
                title={checkInDate.hour}
                interactive={false}
            />
            <MenuItemWithTopDescription
                description={`${translate('travel.hotelDetails.checkOut')} ${CONST.DOT_SEPARATOR} ${checkOutDate.date}`}
                title={checkOutDate.hour}
                interactive={false}
            />
            {!!hotelReservation.confirmations?.at(0)?.value && (
                <View style={styles.w50}>
                    <MenuItemWithTopDescription
                        description={translate('travel.hotelDetails.confirmation')}
                        title={hotelReservation.confirmations?.at(0)?.value}
                        interactive={false}
                    />
                </View>
            )}
        </>
    );
}

HotelTripDetails.displayName = 'HotelTripDetails';

export default HotelTripDetails;
