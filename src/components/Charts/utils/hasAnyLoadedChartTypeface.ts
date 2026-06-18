import type {ChartDefaultTypeface} from '@components/Charts/types/chartSkiaTypefaceTypes';
import {CHART_FONT_MGR_FROM_TYPEFACES} from './chartFontConstants';

function hasAnyLoadedChartTypeface(typefaces: ChartDefaultTypeface): boolean {
    const fontMgrKeys = Object.values(CHART_FONT_MGR_FROM_TYPEFACES).flat();
    return fontMgrKeys.some((key) => typefaces[key] !== null);
}

export default hasAnyLoadedChartTypeface;
