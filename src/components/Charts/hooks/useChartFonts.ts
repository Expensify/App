import {useEffect, useSyncExternalStore} from 'react';
import type ChartFontsValue from '@components/Charts/types/chartFontsTypes';
import {getChartFontsSnapshot, loadChartFontsOnce, subscribeToChartFonts} from '@components/Charts/utils/chartFontsCache';

function useChartFonts(): ChartFontsValue {
    const fonts = useSyncExternalStore(subscribeToChartFonts, getChartFontsSnapshot, getChartFontsSnapshot);

    useEffect(() => {
        loadChartFontsOnce();
    }, []);

    return fonts;
}

export default useChartFonts;
