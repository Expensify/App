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

    const startDate = DateUtils.getFormattedTransportDateAndHour(translate, dateFnsLocale, new Date(reservation.start.date));
    const endDate = DateUtils.getFormattedTransportDateAndHour(translate, dateFnsLocale, new Date(reservation.end.date));
    const trainRouteDescription = `${formatTransitLocationLabel(reservation.start)} ${translate('common.conjunctionTo')} ${formatTransitLocationLabel(reservation.end)}`;
    const trainDuration = DateUtils.getFormattedDurationBetweenDates(translate, new Date(reservation.start.date), new Date(reservation.end.date));

    const displayName = personalDetails?.displayName ?? reservation.travelerPersonalInfo?.name;

    return (
        <>
            <Text style={[styles.textHeadlineH1, styles.mh5, styles.mv3]}>{trainRouteDescription}</Text>

            <MenuItemWithTopDescription
                description={`${translate('travel.train')} ${trainDuration ? `${CONST.DOT_SEPARATOR} ${trainDuration}` : ''}`}
                title={reservation.route?.name}
                copyValue={reservation.route?.name}
                copyable
                interactive={false}
            />
            <MenuItemField description={translate('common.date')}>{!!startDate.date && <MenuItem.TitleBasic>{startDate.date}</MenuItem.TitleBasic>}</MenuItemField>

            <MenuItemWithTopDescription
                description={translate('travel.trainDetails.departs')}
                descriptionTextStyle={[styles.textLabelSupporting, styles.mb1]}
                titleComponent={<Text style={[styles.textLarge, styles.textHeadlineH2]}>{startDate.hour}</Text>}
                helperText={formatTransitLocationLabel(reservation.start)}
                helperTextStyle={[styles.pb3, styles.mtn2]}
                interactive={false}
            />
            <MenuItemWithTopDescription
                description={translate('travel.trainDetails.arrives')}
                descriptionTextStyle={[styles.textLabelSupporting, styles.mb1]}
                titleComponent={<Text style={[styles.textLarge, styles.textHeadlineH2]}>{endDate.hour}</Text>}
                helperText={formatTransitLocationLabel(reservation.end)}
                helperTextStyle={[styles.pb3, styles.mtn2]}
                interactive={false}
            />

            <View style={[styles.flexRow, styles.flexWrap]}>
                {!!reservation.coachNumber && (
                    <View style={styles.w50}>
                        <MenuItemField description={translate('travel.trainDetails.coachNumber')}>
                            {!!reservation.coachNumber && <MenuItem.TitleBasic>{reservation.coachNumber}</MenuItem.TitleBasic>}
                        </MenuItemField>
                    </View>
                )}
                {!!reservation.seatNumber && (
                    <View style={styles.w50}>
                        <MenuItemField description={translate('travel.trainDetails.seat')}>
                            {!!reservation.seatNumber && <MenuItem.TitleBasic>{reservation.seatNumber}</MenuItem.TitleBasic>}
                        </MenuItemField>
                    </View>
                )}
            </View>
            {!!reservation.confirmations?.at(0)?.value && (
                <MenuItemWithTopDescription
                    description={translate('travel.trainDetails.confirmation')}
                    title={reservation.confirmations?.at(0)?.value}
                    copyValue={reservation.confirmations?.at(0)?.value}
                    interactive={false}
                    copyable
                />
            )}

            {!!displayName && (
                <MenuItemWithTopDescription
                    description={translate('travel.trainDetails.passenger')}
                    descriptionTextStyle={styles.fontSizeLabel}
                    interactive={false}
                    accessibilityLabel={`${translate('travel.trainDetails.passenger')} ${displayName}`}
                    titleComponent={
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
                    }
                />
            )}
        </>
    );
}

export default TrainTripDetails;
