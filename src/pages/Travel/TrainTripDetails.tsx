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

type TrainTripDetailsProps = {
    transaction: OnyxEntry<Transaction>;
    personalDetails: OnyxEntry<PersonalDetails>;
    reservationIndex: number;
};

function TrainTripDetails({transaction, personalDetails, reservationIndex}: TrainTripDetailsProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const trainReservation = transaction?.receipt?.reservationList?.at(reservationIndex);

    if (!trainReservation) {
        return null;
    }

    const reservationIcon = TripReservationUtils.getTripReservationIcon(trainReservation.type);
    const startDate = DateUtils.getFormattedTransportDateAndHour(new Date(trainReservation.start.date));
    const endDate = DateUtils.getFormattedTransportDateAndHour(new Date(trainReservation.end.date));

    return (
        <>
            <MenuItem
                label={translate('travel.trainDetails.passenger')}
                title={personalDetails?.displayName}
                icon={personalDetails?.avatar ?? Expensicons.FallbackAvatar}
                iconType={CONST.ICON_TYPE_AVATAR}
                description={personalDetails?.login}
                interactive={false}
                wrapperStyle={styles.pb3}
            />

            <MenuItem
                title={`${trainReservation.start.longName} (${trainReservation.start.shortName}) ${translate('common.conjunctionTo')} ${trainReservation.end.longName} (${
                    trainReservation.end.shortName
                })`}
                description={`${trainReservation.company?.longName} ${CONST.DOT_SEPARATOR} ${trainReservation.route?.name}`}
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
                description={`${translate('travel.trainDetails.departs')} ${CONST.DOT_SEPARATOR} ${startDate.date}`}
                title={startDate.hour}
                helperText={`${trainReservation.start.longName} (${trainReservation.start.shortName})`}
                helperTextStyle={[styles.pb3, styles.mtn2]}
                interactive={false}
            />
            <MenuItemWithTopDescription
                description={`${translate('travel.trainDetails.arrives')} ${CONST.DOT_SEPARATOR} ${endDate.date}`}
                title={endDate.hour}
                helperText={`${trainReservation.end.longName} (${trainReservation.end.shortName})`}
                helperTextStyle={[styles.pb3, styles.mtn2]}
                interactive={false}
            />

            <View style={[styles.flexRow, styles.flexWrap]}>
                {!!trainReservation.coachNumber && (
                    <View style={styles.w50}>
                        <MenuItemWithTopDescription
                            description={translate('travel.trainDetails.coachNumber')}
                            title={trainReservation.coachNumber}
                            interactive={false}
                        />
                    </View>
                )}
                {!!trainReservation.seatNumber && (
                    <View style={styles.w50}>
                        <MenuItemWithTopDescription
                            description={translate('travel.trainDetails.seat')}
                            title={trainReservation.seatNumber}
                            interactive={false}
                        />
                    </View>
                )}
            </View>

            {!!trainReservation.confirmations?.at(0)?.value && (
                <MenuItemWithTopDescription
                    description={translate('travel.trainDetails.confirmation')}
                    title={trainReservation.confirmations?.at(0)?.value}
                    interactive={false}
                />
            )}
        </>
    );
}

TrainTripDetails.displayName = 'TrainTripDetails';

export default TrainTripDetails;
