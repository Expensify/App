import {useCallback} from 'react';
import useLocalize from '@hooks/useLocalize';

/**
 * Formats tooltip amounts for VirtualCFO charts using locale-aware number formatting.
 */
function useVictoryChartTooltipFormatter() {
    const {numberFormat} = useLocalize();

    return useCallback((value: number) => `$${numberFormat(Math.round(value))}`, [numberFormat]);
}

export default useVictoryChartTooltipFormatter;
