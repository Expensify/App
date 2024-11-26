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

type CarTripDetailsProps = {
    transaction: OnyxEntry<Transaction>;
    personalDetails: OnyxEntry<PersonalDetails>;
};

function CarTripDetails({transaction, personalDetails}: CarTripDetailsProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const carReservation = transaction?.receipt?.reservationList?.at(0);

    if (!transaction || !carReservation) {
        return null;
    }

    const reservationIcon = TripReservationUtils.getTripReservationIcon(carReservation.type);
    const checkInDate = DateUtils.getFormattedTransportDate(new Date(carReservation.start.date), true);
    const checkOutDate = DateUtils.getFormattedTransportDate(new Date(carReservation.end.date), true);

    return (
        <>
            <MenuItem
                label={translate('travel.carDetails.driver')}
                title={personalDetails?.displayName}
                icon={personalDetails?.avatar ?? Expensicons.FallbackAvatar}
                iconType={CONST.ICON_TYPE_AVATAR}
                description={personalDetails?.login}
                interactive={false}
                wrapperStyle={styles.pb3}
            />
            <Text style={[styles.textSupporting, styles.mh5, styles.mt3, styles.mb2]}>{translate('travel.carDetails.rentalCar')}</Text>
            <Text style={[styles.textHeadlineH1, styles.mh5, styles.mb3]}>{carReservation.vendor}</Text>
            <MenuItem
                description={carReservation.start.location}
                descriptionTextStyle={[styles.textLabelSupporting, styles.lh16]}
                title={carReservation.vendor}
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
                description={translate('travel.carDetails.pickUp')}
                title={checkInDate}
                interactive={false}
                helperText={carReservation.start.location}
                helperTextStyle={[styles.pb3, styles.mtn2]}
            />
            <MenuItemWithTopDescription
                description={translate('travel.carDetails.dropOff')}
                title={checkOutDate}
                interactive={false}
                helperText={carReservation.end.location}
                helperTextStyle={[styles.pb3, styles.mtn2]}
            />

            {!!carReservation.carInfo?.name && (
                <View style={styles.w50}>
                    <MenuItemWithTopDescription
                        description={translate('travel.carDetails.carType')}
                        title={carReservation.carInfo.name}
                        interactive={false}
                    />
                </View>
            )}
            {!!carReservation.reservationID && (
                <View style={styles.w50}>
                    <MenuItemWithTopDescription
                        description={translate('travel.carDetails.confirmation')}
                        title={carReservation.reservationID}
                        interactive={false}
                    />
                </View>
            )}
        </>
    );
}

CarTripDetails.displayName = 'FlightTripDetails';

export default CarTripDetails;
