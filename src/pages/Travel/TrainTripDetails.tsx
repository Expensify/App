import React from 'react';
import {View} from 'react-native';
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

type TrainTripDetailsProps = {
    reservation: Reservation;
    personalDetails: OnyxEntry<PersonalDetails>;
};

function TrainTripDetails({reservation, personalDetails}: TrainTripDetailsProps) {
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const startDate = DateUtils.getFormattedTransportDateAndHour(new Date(reservation.start.date));
    const endDate = DateUtils.getFormattedTransportDateAndHour(new Date(reservation.end.date));
    const trainRouteDescription = `${reservation.start.longName} (${reservation.start.shortName}) ${translate('common.conjunctionTo')} ${reservation.end.longName} (${
        reservation.end.shortName
    })`;
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
            <MenuItemWithTopDescription
                description={translate('common.date')}
                title={startDate.date}
                interactive={false}
            />

            <MenuItemWithTopDescription
                description={translate('travel.trainDetails.departs')}
                descriptionTextStyle={[styles.textLabelSupporting, styles.mb1]}
                titleComponent={<Text style={[styles.textLarge, styles.textHeadlineH2]}>{startDate.hour}</Text>}
                helperText={`${reservation.start.longName} (${reservation.start.shortName})`}
                helperTextStyle={[styles.pb3, styles.mtn2]}
                interactive={false}
            />
            <MenuItemWithTopDescription
                description={translate('travel.trainDetails.arrives')}
                descriptionTextStyle={[styles.textLabelSupporting, styles.mb1]}
                titleComponent={<Text style={[styles.textLarge, styles.textHeadlineH2]}>{endDate.hour}</Text>}
                helperText={`${reservation.end.longName} (${reservation.end.shortName})`}
                helperTextStyle={[styles.pb3, styles.mtn2]}
                interactive={false}
            />

            <View style={[styles.flexRow, styles.flexWrap]}>
                {!!reservation.coachNumber && (
                    <View style={styles.w50}>
                        <MenuItemWithTopDescription
                            description={translate('travel.trainDetails.coachNumber')}
                            title={reservation.coachNumber}
                            interactive={false}
                        />
                    </View>
                )}
                {!!reservation.seatNumber && (
                    <View style={styles.w50}>
                        <MenuItemWithTopDescription
                            description={translate('travel.trainDetails.seat')}
                            title={reservation.seatNumber}
                            interactive={false}
                        />
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
                <MenuItem
                    label={translate('travel.trainDetails.passenger')}
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

export default TrainTripDetails;
