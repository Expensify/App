import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import * as TripReservationUtils from '@libs/TripReservationUtils';
import variables from '@styles/variables';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {ReservationTimeDetails, ReservationType} from '@src/types/onyx/Transaction';

type TravelDetailsProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.TRAVEL_DETAILS>;

/**
 * Due to there being no backend data yet for more specific trip details,
 * this implementation uses whatever info we already receive to show the most basic
 * and fallback sort of information about the trip details. After the backends for the
 * trip details get merged, the current impelmentation will become a fallback for when data
 * isn't loaded, and a new way of showing more detailed info will be implemented.
 *
 * Please refer to the conversation below for more details:
 * https://swmansion.slack.com/archives/C05S5EV2JTX/p1721062807563259
 */
function TravelDetails({route}: TravelDetailsProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();

    const transactionID = route.params.transactionID;
    const reservationIndex = route.params.reservationIndex;

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID ?? '-1'}`);
    const reservation = transaction?.receipt?.reservationList?.[reservationIndex];

    const formatAirportInfo = (reservationTimeDetails: ReservationTimeDetails) => {
        const longName = reservationTimeDetails?.longName ? `${reservationTimeDetails?.longName} ` : '';
        let shortName = reservationTimeDetails?.shortName ? `${reservationTimeDetails?.shortName}` : '';

        shortName = longName && shortName ? `(${shortName})` : shortName;

        return `${longName}${shortName}`;
    };

    const getFormattedDate = () => {
        switch (reservation?.type) {
            case CONST.RESERVATION_TYPE.HOTEL:
            case CONST.RESERVATION_TYPE.CAR:
                return DateUtils.getFormattedReservationRangeDate(new Date(reservation?.start.date), new Date(reservation?.end.date));
            default:
                return DateUtils.formatToLongDateWithWeekday(new Date(reservation?.start.date ?? ''));
        }
    };

    const titleComponent = () => {
        if (reservation?.type === CONST.RESERVATION_TYPE.FLIGHT) {
            return (
                <View style={styles.gap1}>
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                        <Text style={[styles.textStrong, styles.lh20]}>{formatAirportInfo(reservation.start)}</Text>
                        <Icon
                            src={Expensicons.ArrowRightLong}
                            width={variables.iconSizeSmall}
                            height={variables.iconSizeSmall}
                            fill={theme.icon}
                        />
                        <Text style={[styles.textStrong, styles.lh20]}>{formatAirportInfo(reservation.end)}</Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.gap1}>
                <Text
                    numberOfLines={1}
                    style={[styles.textStrong, styles.lh20]}
                >
                    {reservation?.type === CONST.RESERVATION_TYPE.CAR ? reservation?.carInfo?.name : reservation?.start.longName}
                </Text>
            </View>
        );
    };

    const reservationIcon = TripReservationUtils.getTripReservationIcon(reservation?.type);

    const confirmationNo = `${reservation?.confirmations && reservation?.confirmations?.length > 0 ? `${reservation?.confirmations[0].value}` : ''}`;

    const headerTranslationPaths: Record<ReservationType | 'DEFAULT', TranslationPaths> = {
        [CONST.RESERVATION_TYPE.FLIGHT]: 'travel.flight',
        [CONST.RESERVATION_TYPE.HOTEL]: 'travel.hotel',
        [CONST.RESERVATION_TYPE.CAR]: 'travel.travel',
        DEFAULT: 'travel.travel',
    };

    const headerTranslationPath = (type: ReservationType | undefined): TranslationPaths => headerTranslationPaths[type ?? 'DEFAULT'];

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={TravelDetails.displayName}
        >
            <HeaderWithBackButton
                title={translate('travel.details', {type: translate(headerTranslationPath(reservation?.type))})}
                onBackButtonPress={() => Navigation.goBack()}
                shouldUseCentralPaneSettings={false}
                icon={reservationIcon}
                iconWidth={variables.iconSizeNormal}
                iconHeight={variables.iconSizeNormal}
                iconStyles={[StyleUtils.getTripReservationIconContainer(false), styles.mr3]}
            />
            <MenuItemWithTopDescription
                description={getFormattedDate()}
                descriptionTextStyle={[styles.textLabelSupporting, styles.lh16]}
                titleComponent={titleComponent()}
                titleContainerStyle={[styles.justifyContentStart, styles.gap1]}
                wrapperStyle={[styles.taskDescriptionMenuItem]}
                interactive={false}
            />
            <MenuItemWithTopDescription
                title={confirmationNo}
                titleStyle={styles.textBold}
                description={reservation?.type === CONST.RESERVATION_TYPE.FLIGHT ? translate('travel.confirmationNo') : translate('travel.itineraryNo')}
                interactive={false}
            />
            <MenuItem
                title={translate('travel.tripSupport')}
                onPress={() => Link.openExternalLink('https://travel.expensify.com/support')}
                icon={Expensicons.Phone}
                shouldShowRightIcon
            />
        </ScreenWrapper>
    );
}

TravelDetails.displayName = 'TravelDetails';

export default TravelDetails;
