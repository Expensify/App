import React from 'react';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isTrackingSelector} from '@src/selectors/GPSDraftDetails';

function Waypoints() {
    const styles = useThemeStyles();
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {canBeMissing: true});
    const {translate} = useLocalize();

    const icons = useMemoizedLazyExpensifyIcons(['Location', 'DotIndicatorUnfilled']);

    if (!gpsDraftDetails?.startAddress?.value && !gpsDraftDetails?.endAddress?.value) {
        return null;
    }

    const isTripCaptured = !gpsDraftDetails.isTracking && gpsDraftDetails.gpsPoints.length > 0;

    const shouldShowLoadingEndAddress = isTripCaptured && !gpsDraftDetails.endAddress.value;

    return (
        <View style={[styles.pv6, styles.gap6]}>
            {!!gpsDraftDetails.startAddress.value && (
                <GPSTooltip>
                    <View>
                        <MenuItemWithTopDescription
                            interactive={false}
                            description={translate('gps.start')}
                            title={gpsDraftDetails.startAddress.value}
                            icon={icons.DotIndicatorUnfilled}
                            style={styles.pv0}
                            shouldIconUseAutoWidthStyle
                        />
                    </View>
                </GPSTooltip>
            )}
            {isTripCaptured ? (
                <MenuItemWithTopDescription
                    interactive={false}
                    description={translate('gps.stop')}
                    shouldShowLoadingSpinnerIcon={shouldShowLoadingEndAddress}
                    title={shouldShowLoadingEndAddress ? '...' : gpsDraftDetails.endAddress.value}
                    icon={icons.Location}
                    style={styles.pv0}
                    shouldIconUseAutoWidthStyle
                />
            ) : null}
        </View>
    );
}

export default Waypoints;

const GPS_TOOLTIP_HORIZONTAL_PADDING = 40;

function GPSTooltip({children}: React.PropsWithChildren) {
    const [isTracking = false] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {canBeMissing: true, selector: isTrackingSelector});

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
