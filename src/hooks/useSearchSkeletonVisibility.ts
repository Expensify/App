import CONST from '@src/CONST';

import {useEffect, useState} from 'react';

/**
 * Keeps the search skeleton rendered for one fade after its query resolves, so it can animate out over the results
 * that replaced it.
 *
 * Reanimated's `exiting` would do this too, but on web it fades an element by detaching its DOM node, and this
 * skeleton is the one on screen during a cold start — navigating away mid-animation left React removing a node that
 * had moved, throwing NotFoundError.
 */
function useSearchSkeletonVisibility(isLoading: boolean) {
    const [shouldRender, setShouldRender] = useState(isLoading);

    // Adjusted during rendering because the value is consumed in the same render; the guard bounds it to one pass.
    if (isLoading && !shouldRender) {
        setShouldRender(true);
    }

    useEffect(() => {
        if (isLoading || !shouldRender) {
            return;
        }

        const timeoutID = setTimeout(() => setShouldRender(false), CONST.SEARCH.ANIMATION.FADE_DURATION);
        return () => clearTimeout(timeoutID);
    }, [isLoading, shouldRender]);

    return shouldRender;
}

export default useSearchSkeletonVisibility;
