import type {YKey} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import getBarTooltipKey from './getBarTooltipKey';

type BarPointValues = {
    xValue: string | number | null | undefined;
    yValue: string | number | null | undefined;
};

/**
 * Resolves a parsed tooltip index from a Victory-generated bar point.
 */
function resolveBarTooltipIndex(yKey: YKey, point: BarPointValues, isHorizontal: boolean, categories: string[] | undefined, tooltipKeyToIndex: Record<string, number>): number | undefined {
    const candidates: Array<string | number> = [];

    if (isHorizontal) {
        if (point.yValue !== null && point.yValue !== undefined) {
            candidates.push(point.yValue);
            const categoryName = categories?.[Number(point.yValue)];
            if (categoryName) {
                candidates.push(categoryName);
            }
        }
        if (point.xValue !== null && point.xValue !== undefined) {
            candidates.push(point.xValue);
        }
    } else if (point.xValue !== null && point.xValue !== undefined) {
        candidates.push(point.xValue);
    }

    for (const candidate of candidates) {
        const tooltipIndex = tooltipKeyToIndex[getBarTooltipKey(yKey, candidate)];
        if (tooltipIndex !== undefined) {
            return tooltipIndex;
        }
    }

    return undefined;
}

export default resolveBarTooltipIndex;
