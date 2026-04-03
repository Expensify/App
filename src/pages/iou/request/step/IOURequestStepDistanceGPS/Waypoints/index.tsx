import React from 'react';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import Text from '@components/Text';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isTrackingSelector} from '@src/selectors/GPSDraftDetails';
import type {Unit} from '@src/types/onyx/Policy';

type WaypointsProps = {
    /** Distance unit of the ongoing GPS trip */
    unit: Unit;
};

function Waypoints({unit}: WaypointsProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);
    const {translate} = useLocalize();

    const icons = useMemoizedLazyExpensifyIcons(['Location', 'Crosshair', 'DotIndicatorUnfilled']);

    const tripInProgressOrStopped = (gpsDraftDetails?.gpsPoints?.length ?? 0) > 0 || gpsDraftDetails?.isTracking;

    if (!tripInProgressOrStopped) {
        return null;
    }

    const isTripCaptured = !gpsDraftDetails?.isTracking && (gpsDraftDetails?.gpsPoints?.length ?? 0) > 0;

    const shouldShowLoadingEndAddress = isTripCaptured && !gpsDraftDetails?.endAddress?.value;
    const shouldShowLoadingStartAddress = gpsDraftDetails?.isTracking && !gpsDraftDetails?.startAddress?.value;

    const distance = DistanceRequestUtils.convertDistanceUnit(gpsDraftDetails?.distanceInMeters ?? 0, unit).toFixed(1);

    return (
        <View style={[styles.pt2, styles.pb4]}>
            <MenuItemWithTopDescription
                interactive={false}
                description={translate('common.distance')}
                titleComponent={
                    <Text style={[styles.iouAmountTextInput, styles.textXLarge, styles.colorMuted, styles.ml3]}>
                        <Text style={[styles.iouAmountTextInput, styles.textXLarge, !tripInProgressOrStopped && styles.colorMuted]}>{distance}</Text>
                        {` ${unit}`}
                    </Text>
                }
                icon={icons.Crosshair}
                style={styles.pv3}
                shouldIconUseAutoWidthStyle
                descriptionTextStyle={StyleUtils.getFontSizeStyle(variables.fontSizeLabel)}
            />
            {(!!gpsDraftDetails?.isTracking || !!gpsDraftDetails?.startAddress?.value) && (
                <GPSTooltip>
                    <View>
                        <MenuItemWithTopDescription
                            interactive={false}
                            description={translate('gps.start')}
                            shouldShowLoadingSpinnerIcon={shouldShowLoadingStartAddress}
                            title={shouldShowLoadingStartAddress ? '...' : gpsDraftDetails?.startAddress?.value}
                            icon={icons.DotIndicatorUnfilled}
                            style={styles.pv3}
                            shouldIconUseAutoWidthStyle
                        />
                    </View>
                </GPSTooltip>
            )}
            {isTripCaptured || gpsDraftDetails?.isTracking ? (
                <MenuItemWithTopDescription
                    interactive={false}
                    description={translate('gps.stop')}
                    shouldShowLoadingSpinnerIcon={shouldShowLoadingEndAddress}
                    // eslint-disable-next-line no-nested-ternary
                    title={gpsDraftDetails?.isTracking ? translate('gps.trackingDistance') : shouldShowLoadingEndAddress ? '...' : gpsDraftDetails?.endAddress?.value}
                    icon={icons.Location}
                    style={styles.pv3}
                    shouldIconUseAutoWidthStyle
                />
            ) : null}
        </View>
    );
}

export default Waypoints;

const GPS_TOOLTIP_HORIZONTAL_PADDING = 40;

function GPSTooltip({children}: React.PropsWithChildren) {
    const [isTracking = false] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {selector: isTrackingSelector});

    const styles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();

    const {renderProductTrainingTooltip, shouldShowProductTrainingTooltip} = useProductTrainingContext(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.GPS_TOOLTIP, !!isTracking);

    return (
        <EducationalTooltip
            wrapperStyle={styles.productTrainingTooltipWrapper}
            shiftVertical={-12}
            maxWidth={windowWidth - GPS_TOOLTIP_HORIZONTAL_PADDING}
            renderTooltipContent={renderProductTrainingTooltip}
            shouldRender={shouldShowProductTrainingTooltip}
        >
            {children}
        </EducationalTooltip>
    );
}
