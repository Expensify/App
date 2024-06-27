import React from 'react';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import * as Link from '@userActions/Link';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as TripReservationUtils from '@libs/TripReservationUtils';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import CONST from '@src/CONST';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';

type TravelDetailsProps = {
    /* TransactionID of the transaction the Travel Details correspond to */
    transactionID: string;
};

function TravelDetails({transactionID}: TravelDetailsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID ?? '-1'}`);

    const testDetails = {
        date: 'Thursday, Jan 18, 2024',
        from: 'Philadelphia (PHL)',
        to: 'San Francisco (SFO)',
        confirmationNo: 'ESKDK',
        type: CONST.RESERVATION_TYPE.FLIGHT,
    };

    const reservationIcon = TripReservationUtils.getTripReservationIcon(CONST.RESERVATION_TYPE.FLIGHT);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={TravelDetails.displayName}
        >
            <HeaderWithBackButton
                title={`${translate('travel.travel')} ${translate('travel.details')}`}
                onBackButtonPress={() => Navigation.goBack()}
                icon={reservationIcon}
                iconWidth={variables.iconSizeNormal}
                iconHeight={variables.iconSizeNormal}
                iconStyles={[StyleUtils.getTripReservationIconContainer(false), styles.mr3]}
            />
            <MenuItemWithTopDescription
                title={`${testDetails.from} \u279C ${testDetails.to}`}
                description={testDetails.date}
                interactive={false}
            />
            <MenuItemWithTopDescription
                title={testDetails.confirmationNo}
                description={translate('travel.confirmationNo')}
                interactive={false}
            />
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
