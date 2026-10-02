import CONST from '@src/CONST';

import usePermissions from './usePermissions';
import useResponsiveLayout from './useResponsiveLayout';

/**
 * Determines the bar chart orientation: horizontal on wide layouts with the Insights beta, vertical otherwise.
 */
function useBarChartOrientation(): {isHorizontal: boolean} {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const isHorizontal = !shouldUseNarrowLayout && isBetaEnabled(CONST.BETAS.INSIGHTS_PAGE);

    return {isHorizontal};
}

export default useBarChartOrientation;
