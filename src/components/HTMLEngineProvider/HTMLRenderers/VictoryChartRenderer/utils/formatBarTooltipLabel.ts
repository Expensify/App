import type {RawChartData} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

/**
 * Formats a fallback tooltip label when no explicit `labels` entry exists for a bar.
 */
function formatBarTooltipLabel(point: RawChartData, isHorizontal: boolean): string {
    const formattedAmount = `$${Math.round(point.y).toLocaleString()}`;

    if (isHorizontal && typeof point.x === 'string') {
        return `${point.x} • ${formattedAmount}`;
    }

    return formattedAmount;
}

export default formatBarTooltipLabel;
