import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
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
    const checkInDate = DateUtils.getFormattedTransportDate(new Date(hotelReservation.start.date), true);
    const checkOutDate = DateUtils.getFormattedTransportDate(new Date(hotelReservation.end.date), true);

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
            <Text style={[styles.textSupporting, styles.mh5, styles.mt3, styles.mb2]}>{translate('travel.hotel')}</Text>
            <Text style={[styles.textHeadlineH1, styles.mh5, styles.mb3]}>{hotelReservation.start.longName}</Text>
            <MenuItem
                description={hotelReservation.start.address}
                descriptionTextStyle={[styles.textLabelSupporting, styles.lh16]}
                title={hotelReservation.start.longName}
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
                description={translate('travel.hotelDetails.checkIn')}
                title={checkInDate}
                interactive={false}
            />
            <MenuItemWithTopDescription
                description={translate('travel.hotelDetails.checkOut')}
                title={checkOutDate}
                interactive={false}
            />
            {!!hotelReservation.confirmations?.at(0)?.value && (
                <View style={styles.w50}>
                    <MenuItemWithTopDescription
                        description={translate('travel.flightDetails.recordLocator')}
                        title={hotelReservation.confirmations?.at(0)?.value}
                        interactive={false}
                    />
                </View>
            )}
        </>
    );
}

HotelTripDetails.displayName = 'FlightTripDetails';

export default HotelTripDetails;
