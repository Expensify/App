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

type FlightTripDetailsProps = {
    transaction: OnyxEntry<Transaction>;
    personalDetails: OnyxEntry<PersonalDetails>;
};

function FlightTripDetails({transaction, personalDetails}: FlightTripDetailsProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    return (
        <>
            <MenuItem
                description={`${transaction?.receipt?.reservationList?.at(0)?.start.longName} (${transaction?.receipt?.reservationList?.at(0)?.start.shortName})`}
                // TODO: blazejkustra - Use the actual duration
                title={`1h 43m ${translate('travel.flightDetails.layover')}`}
                descriptionTextStyle={[styles.textLabelSupporting, styles.lh16]}
                secondaryIcon={Expensicons.Chair}
                wrapperStyle={[styles.taskDescriptionMenuItem]}
                numberOfLinesDescription={2}
                iconHeight={20}
                iconWidth={20}
                iconStyles={[StyleUtils.getTripReservationIconContainer(false), styles.mr3]}
                secondaryIconFill={theme.icon}
                interactive={false}
            />
            <View style={[styles.borderBottom, styles.mh5, styles.mt3, styles.mb6]} />

            {transaction?.receipt?.reservationList?.map((reservation) => {
                const reservationIcon = TripReservationUtils.getTripReservationIcon(reservation.type);
                const startDate = DateUtils.getFormattedTransportDate(new Date(reservation.start.date), true);
                const endDate = DateUtils.getFormattedTransportDate(new Date(reservation.end.date), true);

                return (
                    <>
                        <Text style={[styles.textSupporting, styles.mh5, styles.mb2]}>{translate('travel.flight')}</Text>
                        <Text style={[styles.textHeadlineH1, styles.mh5, styles.mb3]}>
                            {reservation.start.cityName} ({reservation.start.shortName}) {translate('common.conjunctionTo')} {reservation.end.cityName} ({reservation.end.shortName})
                        </Text>
                        <MenuItem
                            // TODO: blazejkustra - Use the actual duration
                            description={`2h 15m ${CONST.DOT_SEPARATOR} ${reservation.end.longName}`}
                            descriptionTextStyle={[styles.textLabelSupporting, styles.lh16]}
                            title={`${reservation.company?.longName} ${CONST.DOT_SEPARATOR} ${reservation.route?.airlineCode}`}
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
                            description={translate('travel.flightDetails.takeOff')}
                            title={startDate}
                            helperText={`${reservation.start.longName} (${reservation.start.shortName})${reservation.arrivalGate?.terminal ? `, ${reservation.arrivalGate?.terminal}` : ''}`}
                            helperTextStyle={styles.mtn2}
                            interactive={false}
                        />
                        <MenuItemWithTopDescription
                            description={translate('travel.flightDetails.landing')}
                            title={endDate}
                            helperText={`${reservation.end.longName} (${reservation.end.shortName})`}
                            helperTextStyle={styles.mtn2}
                            interactive={false}
                        />
                        <View style={[styles.borderBottom, styles.mh5, styles.mt1, styles.mb3]} />
                        <MenuItem
                            label={translate('travel.flightDetails.passenger')}
                            title={personalDetails?.displayName}
                            icon={personalDetails?.avatar ?? Expensicons.FallbackAvatar}
                            iconType={CONST.ICON_TYPE_AVATAR}
                            description={personalDetails?.login}
                            interactive={false}
                        />
                        <View style={[styles.flexRow, styles.flexWrap, styles.mb6]}>
                            {!!reservation.route?.number && (
                                <View style={styles.w50}>
                                    <MenuItemWithTopDescription
                                        description={translate('travel.flightDetails.seat')}
                                        title={reservation.route?.number}
                                        interactive={false}
                                    />
                                </View>
                            )}
                            {!!reservation.route?.class && (
                                <View style={styles.w50}>
                                    <MenuItemWithTopDescription
                                        description={translate('travel.flightDetails.class')}
                                        title={reservation.route.class}
                                        interactive={false}
                                    />
                                </View>
                            )}
                            {!!reservation.confirmations?.at(0)?.value && (
                                <View style={styles.w50}>
                                    <MenuItemWithTopDescription
                                        description={translate('travel.flightDetails.recordLocator')}
                                        title={reservation.confirmations?.at(0)?.value}
                                        interactive={false}
                                    />
                                </View>
                            )}
                        </View>
                    </>
                );
            })}
        </>
    );
}

FlightTripDetails.displayName = 'FlightTripDetails';

export default FlightTripDetails;
