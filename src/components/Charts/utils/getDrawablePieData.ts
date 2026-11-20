/** Selects visible pie slices by their plotted share, keeping their original row indices. */
import type {ChartDataPoint} from '@components/Charts/types';

import {isShareWorthDrawing} from '@libs/PercentageUtils';

import getPrimaryValue from './getPrimaryValue';

function getDrawablePieData(data: ChartDataPoint[], primarySeriesKey: string) {
    const slices = data.map((point, originalIndex) => ({
        label: point.label,
        color: point.color,
        absTotal: Math.abs(getPrimaryValue(point, primarySeriesKey)),
        originalIndex,
    }));
    const total = slices.reduce((sum, slice) => sum + slice.absTotal, 0);
    if (total === 0) {
        return [];
    }

    // Top groups can omit most spend, so the reported share does not describe a slice's size.
    return slices.filter((slice) => isShareWorthDrawing((slice.absTotal / total) * 100)).sort((first, second) => second.absTotal - first.absTotal);
}

export default getDrawablePieData;
