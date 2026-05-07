import React from 'react';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import variables from '@styles/variables';
import {isTripCaptured as isTripCapturedUtil} from '@src/libs/GPSDraftDetailsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Unit} from '@src/types/onyx/Policy';

type WaypointsProps = {
    /** Distance unit of the ongoing GPS trip */
    unit: Unit;

    /** Whether the screen is in landscape mode */
    isInLandscapeMode: boolean;
};

function Waypoints({unit, isInLandscapeMode}: WaypointsProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);
    const {translate} = useLocalize();

    const icons = useMemoizedLazyExpensifyIcons(['Location', 'Crosshair', 'DotIndicatorUnfilled']);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const isTripNotInitialized = (gpsDraftDetails?.gpsPoints?.length ?? 0) === 0 && !gpsDraftDetails?.isTracking;

    if (isTripNotInitialized) {
        return null;
    }

    const isTripCaptured = isTripCapturedUtil(gpsDraftDetails);

    const shouldShowLoadingEndAddress = isTripCaptured && !gpsDraftDetails?.endAddress?.value;
    const shouldShowLoadingStartAddress = !gpsDraftDetails?.startAddress?.value;

    const distance = DistanceRequestUtils.convertDistanceUnit(gpsDraftDetails?.distanceInMeters ?? 0, unit).toFixed(1);

    const Wrapper = isInLandscapeMode ? ScrollView : View;

    const getEndAddressTitle = () => {
        if (shouldShowLoadingEndAddress) {
            return '...';
        }

        if (isTripCaptured) {
            return gpsDraftDetails?.endAddress?.value;
        }

        return translate('gps.trackingDistance');
    };

    return (
        <Wrapper style={[styles.pt2, styles.pb4]}>
            <MenuItemWithTopDescription
                interactive={false}
                description={translate('common.distance')}
                titleComponent={
                    <Text style={[styles.iouAmountTextInput, styles.textXLarge, styles.colorMuted, styles.ml3]}>
                        <Text style={[styles.iouAmountTextInput, styles.textXLarge]}>{distance}</Text>
                        {` ${unit}`}
                    </Text>
                }
                icon={icons.Crosshair}
                style={styles.pv3}
                shouldIconUseAutoWidthStyle
                descriptionTextStyle={StyleUtils.getFontSizeStyle(variables.fontSizeLabel)}
            />

            <MenuItemWithTopDescription
                interactive={false}
                description={translate('gps.start')}
                shouldShowLoadingSpinnerIcon={shouldShowLoadingStartAddress}
                title={shouldShowLoadingStartAddress ? '...' : gpsDraftDetails?.startAddress?.value}
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
