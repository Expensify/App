import type {ProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

/** Left inset used by `<victorylabel>` titles in chart XML fixtures. */
const CHART_TITLE_LEFT_MARGIN = 32;

/**
 * Victory-native expands the x-range for built-in Y-axis category labels.
 * Horizontal Victory XML also sets `padding.left` for the same labels, which
 * double-counts the gutter and leaves a large gap before the bars.
 */
function adjustHorizontalChartPadding({isHorizontal, padding, yAxis}: ProcessNodeResult): ProcessNodeResult['padding'] {
    if (!isHorizontal || !padding || typeof padding !== 'object') {
        return padding;
    }

    const categoryAxis = yAxis?.at(0);
    const hasBuiltInCategoryLabels = Boolean(categoryAxis?.font) && ((categoryAxis?.tickCount ?? 0) > 0 || (categoryAxis?.tickValues?.length ?? 0) > 0);

    if (!hasBuiltInCategoryLabels || (categoryAxis?.tickCount ?? 0) === 0) {
        return padding;
    }

    // victory-native adds labelWidth + labelOffset to xMin only when tickCount > 0.
    // Collapse XML padding.left only in that case to avoid double-counting the gutter.
    return {
        ...padding,
        left: CHART_TITLE_LEFT_MARGIN,
    };
}

export default adjustHorizontalChartPadding;
