import type {ProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

/** Extra gap below the tallest x-axis category label. */
const CATEGORY_LABEL_BOTTOM_GAP = 8;

/**
 * Vertical Victory XML often over-reserves `padding.bottom` for built-in x-axis
 * category labels. Trim the excess while keeping room for one label line.
 */
function adjustVerticalChartPadding({isHorizontal, padding, xAxis, legendItems}: ProcessNodeResult): ProcessNodeResult['padding'] {
    if (isHorizontal || !padding || typeof padding !== 'object') {
        return padding;
    }

    const hasBuiltInCategoryLabels = !!xAxis?.font && (xAxis?.tickValues?.length ?? 0) > 0;

    if (!hasBuiltInCategoryLabels || legendItems.length > 0) {
        return padding;
    }

    const fontSize = xAxis?.font?.getSize?.() ?? 0;
    const labelOffset = xAxis?.labelOffset ?? 0;
    const targetBottom = fontSize + labelOffset + CATEGORY_LABEL_BOTTOM_GAP;

    if (typeof padding.bottom !== 'number' || padding.bottom <= targetBottom) {
        return padding;
    }

    return {
        ...padding,
        bottom: targetBottom,
    };
}

export default adjustVerticalChartPadding;
