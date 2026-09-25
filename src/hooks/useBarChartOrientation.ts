import CONST from '@src/CONST';

import usePermissions from './usePermissions';
import useResponsiveLayout from './useResponsiveLayout';

/**
 * Bar chart orientation with the Insights beta on: horizontal on wide, vertical on narrow unless labels don't fit
 * even at 45° (`canFallBackToHorizontalBars`). Everything stays vertical when the beta is off.
 */
function useBarChartOrientation(): {isHorizontal: boolean; canFallBackToHorizontalBars: boolean} {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const isInsightsBeta = isBetaEnabled(CONST.BETAS.INSIGHTS_PAGE);
    const isHorizontal = !shouldUseNarrowLayout && isInsightsBeta;
    const canFallBackToHorizontalBars = shouldUseNarrowLayout && isInsightsBeta;

    return {isHorizontal, canFallBackToHorizontalBars};
}

export default useBarChartOrientation;
