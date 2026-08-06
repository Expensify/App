import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScrollView from '@components/ScrollView';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';

import {getEffectiveEndPoint, getFirstGpsPoint, getTotalGpsTripPoints, isTripStopped as isTripStoppedUtil} from '@src/libs/GPSDraftDetailsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Unit} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

import DiscardGPSTripButton from './DiscardGPSTripButton';
import DistanceCounter from './DistanceCounter';
import EditGPSTripButton from './EditGPSTripButton';

type WaypointsProps = {
    /** Distance unit of the ongoing GPS trip */
    unit: Unit;

    /** Whether the screen is in landscape mode */
    isInLandscapeMode: boolean;
} & MoneyRequestNavigatorParamList[typeof SCREENS.MONEY_REQUEST.GPS_TRIP_EDIT];

function Waypoints({unit, isInLandscapeMode, action, iouType, transactionID, reportID, backToReport}: WaypointsProps) {
    const styles = useThemeStyles();
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);
    const {translate} = useLocalize();

    const icons = useMemoizedLazyExpensifyIcons(['Location', 'DotIndicatorUnfilled']);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const isTripNotInitialized = getTotalGpsTripPoints(gpsDraftDetails) === 0 && !gpsDraftDetails?.isTracking;

    if (isTripNotInitialized) {
        return null;
    }

    const firstPoint = getFirstGpsPoint(gpsDraftDetails);
    const effectiveEndPoint = getEffectiveEndPoint(gpsDraftDetails);

    const isTripStopped = isTripStoppedUtil(gpsDraftDetails);

    const shouldShowLoadingEndAddress = isTripStopped && !effectiveEndPoint?.address?.value;
    const shouldShowLoadingStartAddress = !firstPoint?.address?.value;

    const getEndAddressTitle = () => {
        if (shouldShowLoadingEndAddress) {
            return '...';
        }

        if (isTripStopped) {
            return effectiveEndPoint?.address?.value;
        }

        return translate('gps.trackingDistance');
    };

    const Wrapper = isInLandscapeMode ? ScrollView : View;

    return (
        <Wrapper style={[styles.pt2, styles.pb4]}>
            <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.gap3, styles.ph5]}>
                <View style={[styles.flex1]}>
                    <DistanceCounter unit={unit} />
                </View>

                <DiscardGPSTripButton />
                <EditGPSTripButton
                    action={action}
                    iouType={iouType}
                    transactionID={transactionID}
                    reportID={reportID}
                    backToReport={backToReport}
                />
            </View>

            <MenuItemWithTopDescription
                interactive={false}
                description={translate('gps.start')}
                shouldShowLoadingSpinnerIcon={shouldShowLoadingStartAddress}
                title={shouldShowLoadingStartAddress ? '...' : firstPoint?.address?.value}
                icon={icons.DotIndicatorUnfilled}
                style={styles.pv3}
                shouldIconUseAutoWidthStyle
            />

            <MenuItemWithTopDescription
                interactive={false}
                description={translate('gps.stop')}
                shouldShowLoadingSpinnerIcon={shouldShowLoadingEndAddress}
                title={getEndAddressTitle()}
                icon={icons.Location}
                style={styles.pv3}
                shouldIconUseAutoWidthStyle
            />
        </Wrapper>
    );
}

export default Waypoints;
