/** Keeps the content at the bottom edge of the report-actions list in place when the list viewport changes height. */
import type {UseViewportBottomAnchorParams, ViewportBottomAnchor} from './types';

import useViewportBottomScrollCorrection from './useViewportBottomScrollCorrection';

function useViewportBottomAnchor({legendListRef, listData, listID}: UseViewportBottomAnchorParams): ViewportBottomAnchor {
    const scrollCorrection = useViewportBottomScrollCorrection({legendListRef, listData, listID});

    // LegendList renders its own scroll view on web.
    return {...scrollCorrection, renderScrollComponent: undefined};
}

export default useViewportBottomAnchor;
