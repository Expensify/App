import React, {useMemo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import {useLHNTooltipContext} from './LHNTooltipContext';

type OptionRowTooltipLayerProps = {
    /** Whether the row qualifies to show the RBR/GBR tooltip */
    shouldShowRBRorGBRTooltip: boolean;

    /** Whether the row qualifies to show the onboarding "Get started" tooltip */
    shouldShowGetStartedTooltip: boolean;

    /** Press handler forwarded to EducationalTooltip's onTooltipPress and exposed to children via renderChildren */
    onOptionPress: (event: GestureResponderEvent | KeyboardEvent | undefined) => void;

    /** Renders the row content. Receives a press handler that hides the product training tooltip before invoking onOptionPress. */
    renderChildren: (onPress: (event: GestureResponderEvent | KeyboardEvent | undefined) => void) => React.ReactNode;
};

function OptionRowTooltipLayer({shouldShowRBRorGBRTooltip, shouldShowGetStartedTooltip, onOptionPress, renderChildren}: OptionRowTooltipLayerProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isFullscreenVisible, isScreenFocused, isReportsSplitNavigatorLast} = useLHNTooltipContext();

    const {tooltipToRender, shouldShowTooltip} = useMemo(() => {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        const tooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.CONCIERGE_LHN_GBR;
        const shouldShowTooltips = shouldShowRBRorGBRTooltip || shouldShowGetStartedTooltip;
        const shouldTooltipBeVisible = shouldUseNarrowLayout ? isScreenFocused && isReportsSplitNavigatorLast : isReportsSplitNavigatorLast && !isFullscreenVisible;

        return {
            tooltipToRender: tooltip,
            shouldShowTooltip: shouldShowTooltips && shouldTooltipBeVisible,
        };
    }, [shouldShowRBRorGBRTooltip, shouldShowGetStartedTooltip, isScreenFocused, shouldUseNarrowLayout, isReportsSplitNavigatorLast, isFullscreenVisible]);

    const {shouldShowProductTrainingTooltip, renderProductTrainingTooltip, hideProductTrainingTooltip} = useProductTrainingContext(tooltipToRender, shouldShowTooltip);

    const onPress = (event: GestureResponderEvent | KeyboardEvent | undefined) => {
        hideProductTrainingTooltip();
        onOptionPress(event);
    };

    return (
        <EducationalTooltip
            shouldRender={shouldShowProductTrainingTooltip}
            renderTooltipContent={renderProductTrainingTooltip}
            anchorAlignment={{
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
            }}
            shiftHorizontal={variables.gbrTooltipShiftHorizontal}
            shiftVertical={variables.gbrTooltipShiftVertical}
            wrapperStyle={styles.productTrainingTooltipWrapper}
            onTooltipPress={onPress}
            shouldHideOnScroll
        >
            {renderChildren(onPress)}
        </EducationalTooltip>
    );
}

OptionRowTooltipLayer.displayName = 'OptionRowTooltipLayer';

export default OptionRowTooltipLayer;
