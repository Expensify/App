import React, {useState} from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

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
    const [hasUserClosedTooltip, setHasUserClosedTooltip] = useState(false);

    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {canBeMissing: true});
    const [firstCreatedGPSExpenseDate] = useOnyx(ONYXKEYS.NVP_FIRST_CREATED_GPS_EXPENSE_DATE_NEW_DOT, {canBeMissing: true});

    const styles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Close', 'Lightbulb']);

    const showEducationalTooltip = !hasUserClosedTooltip && !firstCreatedGPSExpenseDate && gpsDraftDetails?.isTracking;

    const renderTooltipContent = () => (
        <View style={[styles.ph1, styles.pv2, styles.flexRow, styles.overflowHidden, styles.gap3, styles.alignItemsCenter]}>
            <Icon
                src={icons.Lightbulb}
                fill={theme.tooltipHighlightText}
                small
            />
            <Text style={[styles.fontSizeLabel, styles.flexShrink1, styles.productTrainingTooltipText, styles.fontWeightNormal]}>{translate('gps.tooltip')}</Text>

            <PressableWithoutFeedback
                onPress={() => setHasUserClosedTooltip(true)}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={translate('common.close')}
            >
                <Icon
                    fill={theme.icon}
                    src={icons.Close}
                    extraSmall
                />
            </PressableWithoutFeedback>
        </View>
    );

    return (
        <EducationalTooltip
            wrapperStyle={styles.productTrainingTooltipWrapper}
            shiftVertical={-12}
            maxWidth={windowWidth - GPS_TOOLTIP_HORIZONTAL_PADDING}
            renderTooltipContent={renderTooltipContent}
            shouldRender={showEducationalTooltip}
        >
            {children}
        </EducationalTooltip>
    );
}
