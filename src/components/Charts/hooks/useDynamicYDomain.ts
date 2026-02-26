import {useMemo} from 'react';
import type {ChartDataPoint} from '@components/Charts/types';

/**
 * Anchor Y-axis at zero so the baseline is always visible.
 * When negative values are present, let victory-native auto-calculate the domain to avoid clipping.
 */
function useDynamicYDomain(data: ChartDataPoint[]): [number] | undefined {
    return useMemo((): [number] | undefined => (data.some((point) => point.total < 0) ? undefined : [0]), [data]);
}

export default useDynamicYDomain;
