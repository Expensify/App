import {useMemo} from 'react';
import {useLHNTooltipContext} from '@components/LHNOptionsList/LHNTooltipContext';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import CONST from '@src/CONST';

/**
 * Resolves the product-training tooltip state (CONCIERGE_LHN_GBR) for an LHN row.
 * Used by both OptionRowTooltipLayerInner (render the tooltip) and OptionRowPressable (hide on press).
 */
function useLHNRowProductTrainingTooltip() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isFullscreenVisible, isScreenFocused, isReportsSplitNavigatorLast} = useLHNTooltipContext();

    const {tooltipToRender, shouldShowTooltip} = useMemo(() => {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        const tooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.CONCIERGE_LHN_GBR;
        const shouldTooltipBeVisible = shouldUseNarrowLayout ? isScreenFocused && isReportsSplitNavigatorLast : isReportsSplitNavigatorLast && !isFullscreenVisible;

        return {
            tooltipToRender: tooltip,
            shouldShowTooltip: shouldTooltipBeVisible,
        };
    }, [isScreenFocused, shouldUseNarrowLayout, isReportsSplitNavigatorLast, isFullscreenVisible]);

    return useProductTrainingContext(tooltipToRender, shouldShowTooltip);
}

export default useLHNRowProductTrainingTooltip;
