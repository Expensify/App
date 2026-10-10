import type {ChartDataPoint} from '@components/Charts/types';

import {useMemo} from 'react';

/** Keep zero inside the Y-axis domain so bars always grow from a visible baseline, also when all values are negative */
function useDynamicYDomain(data: ChartDataPoint[]): [number, number] {
    return useMemo((): [number, number] => {
        const totals = data.map((point) => point.total);
        return [Math.min(0, ...totals), Math.max(0, ...totals)];
    }, [data]);
}

export default useDynamicYDomain;
