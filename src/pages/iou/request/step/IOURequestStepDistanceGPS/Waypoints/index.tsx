import React from 'react';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScrollView from '@components/ScrollView';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFirstGpsPoint, getLastGpsPoint, getTotalGpsTripPoints, isTripStopped as isTripStoppedUtil} from '@src/libs/GPSDraftDetailsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Unit} from '@src/types/onyx/Policy';
import DiscardGPSTripButton from './DiscardGPSTripButton';
import DistanceCounter from './DistanceCounter';

type WaypointsProps = {
    /** Distance unit of the ongoing GPS trip */
    unit: Unit;

    /** Whether the screen is in landscape mode */
    isInLandscapeMode: boolean;
};

function Waypoints({unit, isInLandscapeMode}: WaypointsProps) {
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
    const lastPoint = getLastGpsPoint(gpsDraftDetails);

    const isTripStopped = isTripStoppedUtil(gpsDraftDetails);

    const shouldShowLoadingEndAddress = isTripStopped && !lastPoint?.address?.value;
    const shouldShowLoadingStartAddress = !firstPoint?.address?.value;

    const getEndAddressTitle = () => {
        if (shouldShowLoadingEndAddress) {
            return '...';
        }

        if (isTripStopped) {
            return lastPoint?.address?.value;
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
