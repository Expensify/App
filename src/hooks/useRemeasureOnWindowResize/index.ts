import useWindowDimensions from '@hooks/useWindowDimensions';

import CONST from '@src/CONST';

import {useEffect, useEffectEvent} from 'react';

import type {UseRemeasureOnWindowResize} from './types';

/**
 * Keeps something anchored to an element in place while the browser window is resized, e.g. a pop-over under a row in
 * the RHP, which follows the window's right edge. The RHP only takes the new width after its own layout pass, so a
 * measurement on the same frame still sees the element a step behind: it keeps the pop-over close while the window is
 * dragged, and the element is measured once more after the resize settles. The first run also happens as soon as the
 * hook turns active.
 */
const useRemeasureOnWindowResize: UseRemeasureOnWindowResize = (isActive, remeasure) => {
    const {windowWidth, windowHeight} = useWindowDimensions();
    const onRemeasure = useEffectEvent(remeasure);

    useEffect(() => {
        if (!isActive) {
            return;
        }
        let isStale = false;
        onRemeasure(() => isStale);
        const settledRemeasureTimeout = setTimeout(() => onRemeasure(() => isStale), CONST.TIMING.RESIZE_DEBOUNCE_TIME);
        return () => {
            isStale = true;
            clearTimeout(settledRemeasureTimeout);
        };
    }, [isActive, windowWidth, windowHeight]);
};

export default useRemeasureOnWindowResize;
