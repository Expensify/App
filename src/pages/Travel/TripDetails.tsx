import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {NativeModules} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type TripDetailsProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.TRIP_DETAILS>;

function TripDetails({route}: TripDetailsProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {canUseSpotnanaTravel} = usePermissions();

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${route.params.transactionID}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID ?? '-1'}`);
    const tripID = ReportUtils.getTripIDFromTransactionParentReportID(parentReport?.parentReportID);

    console.log(`transaction = `, transaction);
    console.log(`report = `, report);
    console.log(`parentReport = `, parentReport);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            testID={TripDetails.displayName}
            shouldShowOfflineIndicatorInWideScreen
        >
            <FullPageNotFoundView
                shouldForceFullScreen
                shouldShow={!canUseSpotnanaTravel && !NativeModules.HybridAppModule}
            >
                <HeaderWithBackButton
                    title={translate('common.details')}
                    shouldShowBackButton
                />
                <MenuItem
                    title={translate('travel.flightDetails.modifyTrip')}
                    icon={Expensicons.Pencil}
                    iconFill={theme.iconSuccessFill}
                    iconRight={Expensicons.NewWindow}
                    shouldShowRightIcon
                    onPress={() => {
                        Link.openTravelDotLink(activePolicyID, CONST.TRIP_ID_PATH(tripID));
                    }}
                />
                <MenuItem
                    title={translate('travel.tripSupport')}
                    icon={Expensicons.Phone}
                    iconFill={theme.iconSuccessFill}
                    iconRight={Expensicons.NewWindow}
                    shouldShowRightIcon
                    onPress={() => {
                        Link.openTravelDotLink(activePolicyID, CONST.TRIP_ID_PATH(tripID));
                    }}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

TripDetails.displayName = 'TripDetails';

export default TripDetails;
