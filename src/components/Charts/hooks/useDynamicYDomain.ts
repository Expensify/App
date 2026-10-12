import type {ChartDataPoint} from '@components/Charts/types';
import {getPointValues} from '@components/Charts/utils';

import {useMemo} from 'react';

/** Keep zero inside the Y-axis domain so bars always grow from a visible baseline, also when all values are negative */
function useDynamicYDomain(data: ChartDataPoint[]): [number, number] {
    return useMemo((): [number, number] => {
        const values = data.flatMap(getPointValues);
        return [Math.min(0, ...values), Math.max(0, ...values)];
    }, [data]);
}

export default useDynamicYDomain;
