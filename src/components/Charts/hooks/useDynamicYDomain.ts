import type {ChartDataPoint} from '@components/Charts/types';

import {useMemo} from 'react';

/** Keep zero inside the Y-axis domain so bars always grow from a visible baseline, also when all values are negative */
function useDynamicYDomain(data: ChartDataPoint[]): [number, number] {
    return useMemo((): [number, number] => {
        const values = data.flatMap((point) => Object.values(point.values).filter((value) => value !== undefined));
        return [Math.min(0, ...values), Math.max(0, ...values)];
    }, [data]);
}

export default useDynamicYDomain;
