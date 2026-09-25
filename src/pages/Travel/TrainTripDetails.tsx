import FormHelpMessage from '@components/FormHelpMessage';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
import UserPills from '@components/UserPills';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';
import {formatTransitLocationLabel} from '@libs/TripReservationUtils';

import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';
import type {Reservation} from '@src/types/onyx/Transaction';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

type TrainTripDetailsProps = {
    reservation: Reservation;
    personalDetails: OnyxEntry<PersonalDetails>;
};

function TrainTripDetails({reservation, personalDetails}: TrainTripDetailsProps) {
    const styles = useThemeStyles();
    const {translate, dateFnsLocale} = useLocalize();

    const startDate = DateUtils.getFormattedTransportDateAndHour(new Date(reservation.start.date), dateFnsLocale);
    const endDate = DateUtils.getFormattedTransportDateAndHour(new Date(reservation.end.date), dateFnsLocale);
    const trainRouteDescription = `${formatTransitLocationLabel(reservation.start)} ${translate('common.conjunctionTo')} ${formatTransitLocationLabel(reservation.end)}`;
    const trainDuration = DateUtils.getFormattedDurationBetweenDates(translate, new Date(reservation.start.date), new Date(reservation.end.date));

    const displayName = personalDetails?.displayName ?? reservation.travelerPersonalInfo?.name;
    const routeName = reservation.route?.name;
    const confirmationNumber = reservation.confirmations?.at(0)?.value;

    return (
        <>
            <Text style={[styles.textHeadlineH1, styles.mh5, styles.mv3]}>{trainRouteDescription}</Text>

            <MenuItemField
                name={`${translate('travel.train')} ${trainDuration ? `${CONST.DOT_SEPARATOR} ${trainDuration}` : ''}`}
                value={routeName}
            >
                {!!routeName && <MenuItem.Copy value={routeName} />}
            </MenuItemField>
            <MenuItemField
                name={translate('common.date')}
                value={startDate.date}
            />

            <MenuItem.Root>
                <MenuItem.Row>
                    <MenuItemField.Content name={translate('travel.trainDetails.departs')}>
                        <Text style={[styles.textLarge, styles.textHeadlineH2]}>{startDate.hour}</Text>
                    </MenuItemField.Content>
                </MenuItem.Row>
            </MenuItem.Root>
            <FormHelpMessage
                isError={false}
                shouldShowRedDotIndicator={false}
                message={formatTransitLocationLabel(reservation.start)}
                style={[styles.mtn2, styles.mb0, styles.ph5, styles.pb3]}
            />
            <MenuItem.Root>
                <MenuItem.Row>
                    <MenuItemField.Content name={translate('travel.trainDetails.arrives')}>
                        <Text style={[styles.textLarge, styles.textHeadlineH2]}>{endDate.hour}</Text>
                    </MenuItemField.Content>
                </MenuItem.Row>
            </MenuItem.Root>
            <FormHelpMessage
                isError={false}
                shouldShowRedDotIndicator={false}
                message={formatTransitLocationLabel(reservation.end)}
                style={[styles.mtn2, styles.mb0, styles.ph5, styles.pb3]}
            />

            <View style={[styles.flexRow, styles.flexWrap]}>
                {!!reservation.coachNumber && (
                    <View style={styles.w50}>
                        <MenuItemField
                            name={translate('travel.trainDetails.coachNumber')}
                            value={reservation.coachNumber}
                        />
                    </View>
                )}
                {!!reservation.seatNumber && (
                    <View style={styles.w50}>
                        <MenuItemField
                            name={translate('travel.trainDetails.seat')}
                            value={reservation.seatNumber}
                        />
                    </View>
                )}
            </View>
            {!!confirmationNumber && (
                <MenuItemField
                    name={translate('travel.trainDetails.confirmation')}
                    value={confirmationNumber}
                >
                    <MenuItem.Copy value={confirmationNumber} />
                </MenuItemField>
            )}

            {!!displayName && (
                <MenuItem.Root accessibilityLabel={`${translate('travel.trainDetails.passenger')} ${displayName}`}>
                    <MenuItem.Row>
                        <MenuItemField.Content name={translate('travel.trainDetails.passenger')}>
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

export default TrainTripDetails;
