import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import TripDetailsMenuItem from '@components/TripDetailsMenuItem';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import * as TripReservationUtils from '@libs/TripReservationUtils';
import variables from '@styles/variables';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {ReservationType} from '@src/types/onyx/Transaction';

type TravelDetailsProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.TRAVEL_DETAILS>;

function TravelDetails({route}: TravelDetailsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();

    const reportID = route.params.reportID;
    const transactionID = route.params.transactionID;

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID || -1}`);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID ?? '-1'}`);

    const testDetails = {
        date: 'Thursday, Jan 18, 2024',
        from: 'Philadelphia (PHL)',
        to: 'San Francisco (SFO)',
        confirmationNo: 'ESKDK',
        type: CONST.RESERVATION_TYPE.FLIGHT,
    };

    type HeaderReservationType = Exclude<ReservationType, 'car'>;

    const headerTranslationPaths: Record<HeaderReservationType | 'DEFAULT', TranslationPaths> = {
        [CONST.RESERVATION_TYPE.FLIGHT]: 'travel.flight',
        [CONST.RESERVATION_TYPE.HOTEL]: 'travel.hotel',
        DEFAULT: 'travel.travel',
    };

    const headerTranslationPath = (type: HeaderReservationType): TranslationPaths => headerTranslationPaths[type] || headerTranslationPaths.DEFAULT;

    const reservationIcon = TripReservationUtils.getTripReservationIcon(CONST.RESERVATION_TYPE.FLIGHT);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={TravelDetails.displayName}
        >
            <HeaderWithBackButton
                title={`${translate(headerTranslationPath(testDetails.type))} ${translate('travel.details')}`}
                onBackButtonPress={() => Navigation.goBack()}
                icon={reservationIcon}
                iconWidth={variables.iconSizeNormal}
                iconHeight={variables.iconSizeNormal}
                iconStyles={[StyleUtils.getTripReservationIconContainer(false), styles.mr3]}
            />
            <MenuItemWithTopDescription
                title={`${testDetails.from} \u279C ${testDetails.to}`}
                titleStyle={styles.textBold}
                description={testDetails.date}
                interactive={false}
            />
            <MenuItemWithTopDescription
                title={testDetails.confirmationNo}
                titleStyle={styles.textBold}
                description={translate('travel.confirmationNo')}
                interactive={false}
            />
            <TripDetailsMenuItem />
            <MenuItem
                title={translate('travel.tripSupport')}
                onPress={() => Link.openExternalLink('www.google.pl')}
                icon={Expensicons.Phone}
                shouldShowRightIcon
            />
        </ScreenWrapper>
    );
}

TravelDetails.displayName = 'TravelDetails';

export default TravelDetails;
