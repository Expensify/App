import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import Text from '@components/Text';
import UserPills from '@components/UserPills';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';
import type {Reservation} from '@src/types/onyx/Transaction';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

type CarTripDetailsProps = {
    reservation: Reservation;
    personalDetails: OnyxEntry<PersonalDetails>;
};

function CarTripDetails({reservation, personalDetails}: CarTripDetailsProps) {
    const styles = useThemeStyles();
    const {translate, dateFnsLocale} = useLocalize();

    const pickUpDate = DateUtils.getFormattedTransportDateAndHour(new Date(reservation.start.date), dateFnsLocale);
    const dropOffDate = DateUtils.getFormattedTransportDateAndHour(new Date(reservation.end.date), dateFnsLocale);

    let cancellationText = reservation.cancellationPolicy;
    if (reservation.cancellationDeadline) {
        cancellationText = `${translate('travel.carDetails.cancellationUntil')} ${DateUtils.getFormattedCancellationDate(reservation.cancellationDeadline, dateFnsLocale)}`;
    }

    if (reservation.cancellationPolicy === null && reservation.cancellationDeadline === null) {
        cancellationText = translate('travel.carDetails.freeCancellation');
    }

    const displayName = personalDetails?.displayName ?? reservation.travelerPersonalInfo?.name;
    const confirmationNumber = reservation.confirmations?.at(0)?.value ?? reservation.reservationID;

    return (
        <>
            <Text style={[styles.textHeadlineH1, styles.mh5, styles.mv3]}>{reservation.vendor}</Text>
            <View>
                <MenuItem.Root>
                    <MenuItem.Row>
                        <MenuItem.Content>
                            {/* Legacy titleComponent rows have no gap between the label and heading. */}
                            <View>
                                <MenuItem.FieldName style={styles.textNormal}>{translate('travel.carDetails.pickUp')}</MenuItem.FieldName>
                                <MenuItem.FieldValue
                                    style={[styles.textLarge, styles.textHeadlineH2]}
                                    numberOfLines={0}
                                >
                                    {`${pickUpDate.date} ${CONST.DOT_SEPARATOR} ${pickUpDate.hour}`}
                                </MenuItem.FieldValue>
                            </View>
                        </MenuItem.Content>
                    </MenuItem.Row>
                </MenuItem.Root>
                {!!reservation.start.location && <Text style={[styles.mutedNormalTextLabel, styles.ph5, styles.pb3, styles.mtn2]}>{reservation.start.location}</Text>}
            </View>
            <View>
                <MenuItem.Root>
                    <MenuItem.Row>
                        <MenuItem.Content>
                            <View>
                                <MenuItem.FieldName style={styles.textNormal}>{translate('travel.carDetails.dropOff')}</MenuItem.FieldName>
                                <MenuItem.FieldValue
                                    style={[styles.textLarge, styles.textHeadlineH2]}
                                    numberOfLines={0}
                                >
                                    {`${dropOffDate.date} ${CONST.DOT_SEPARATOR} ${dropOffDate.hour}`}
                                </MenuItem.FieldValue>
                            </View>
                        </MenuItem.Content>
                    </MenuItem.Row>
                </MenuItem.Root>
                {!!reservation.end.location && <Text style={[styles.mutedNormalTextLabel, styles.ph5, styles.pb3, styles.mtn2]}>{reservation.end.location}</Text>}
            </View>
            {!!reservation.carInfo?.name && (
                <MenuItemField
                    name={translate('travel.carDetails.carType')}
                    value={reservation.carInfo.name}
                />
            )}
            {!!cancellationText && (
                <MenuItemField
                    name={translate('travel.carDetails.cancellation')}
                    value={cancellationText}
                    numberOfLinesValue={2}
                />
            )}
            {!!confirmationNumber && (
                <MenuItemField
                    name={translate('travel.carDetails.confirmation')}
                    value={confirmationNumber}
                >
                    <MenuItem.Copy value={confirmationNumber} />
                </MenuItemField>
            )}
            {!!displayName && (
                <MenuItem.Root accessibilityLabel={`${translate('travel.carDetails.driver')} ${displayName}`}>
                    <MenuItem.Row>
                        <MenuItemField.Content name={translate('travel.carDetails.driver')}>
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
                        </MenuItemField.Content>
                    </MenuItem.Row>
                </MenuItem.Root>
            )}
        </>
    );
}

export default CarTripDetails;
