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
    const pickUpDate = DateUtils.getFormattedTransportDateAndHour(new Date(carReservation.start.date));
    const dropOffDate = DateUtils.getFormattedTransportDateAndHour(new Date(carReservation.end.date));
    const cancellationText = carReservation.deadline
        ? `${translate('travel.carDetails.cancellationUntil')} ${DateUtils.getFormattedTransportDateAndHour(new Date(carReservation.deadline)).date}`
        : carReservation.cancellationPolicy;

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
            <MenuItem
                title={carReservation.vendor}
                description={translate('travel.carDetails.rentalCar')}
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
                description={`${translate('travel.carDetails.pickUp')} ${CONST.DOT_SEPARATOR} ${pickUpDate.date}`}
                title={pickUpDate.hour}
                interactive={false}
                helperText={carReservation.start.location}
                helperTextStyle={[styles.pb3, styles.mtn2]}
            />
            <MenuItemWithTopDescription
                description={`${translate('travel.carDetails.dropOff')} ${CONST.DOT_SEPARATOR} ${dropOffDate.date}`}
                title={dropOffDate.hour}
                interactive={false}
                helperText={carReservation.end.location}
                helperTextStyle={[styles.pb3, styles.mtn2]}
            />

            {!!carReservation.carInfo?.name && (
                <View>
                    <MenuItemWithTopDescription
                        description={translate('travel.carDetails.carType')}
                        title={carReservation.carInfo.name}
                        interactive={false}
                    />
                </View>
            )}
            {!!cancellationText && (
                <View>
                    <MenuItemWithTopDescription
                        description={translate('travel.carDetails.cancellation')}
                        title={cancellationText}
                        interactive={false}
                    />
                </View>
            )}
            {!!carReservation.reservationID && (
                <View>
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
