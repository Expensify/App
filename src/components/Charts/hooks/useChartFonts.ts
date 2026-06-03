import {useEffect, useSyncExternalStore} from 'react';
import type {ChartFontsValue} from '@components/Charts/types/chartFontsTypes';
import {getChartFontsSnapshot, loadChartFontsOnce, subscribeToChartFonts} from '@components/Charts/utils/chartFontsCache';

function useChartFonts(): ChartFontsValue {
    const fonts = useSyncExternalStore(subscribeToChartFonts, getChartFontsSnapshot, getChartFontsSnapshot);

    useEffect(() => {
        loadChartFontsOnce().catch(() => {
            // Chart consumers null-guard fontMgr and typefaces until load succeeds.
        });
    }, []);

    return fonts;
}

export default useChartFonts;
