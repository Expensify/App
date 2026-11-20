/**
 * Keeps something positioned from a one-off measurement attached to what it was measured against, by remeasuring as
 * the page scrolls. A capture phase listener is used because scroll events do not bubble, so this covers the inner
 * scroll containers a screen is built from as well as the document itself.
 */
import CONST from '@src/CONST';

import throttle from 'lodash/throttle';
import {useEffect} from 'react';

import type UseRemeasureOnScroll from './types';

const useRemeasureOnScroll: UseRemeasureOnScroll = ({isActive, remeasure}) => {
    useEffect(() => {
        if (!isActive) {
            return;
        }

        // Listening hands the scroll event to whatever it calls, and a remeasure takes an argument of its own
        const handleScroll = throttle(() => remeasure(), CONST.TIMING.MIN_SMOOTH_SCROLL_EVENT_THROTTLE);
        document.addEventListener('scroll', handleScroll, true);

        return () => {
            document.removeEventListener('scroll', handleScroll, true);
            handleScroll.cancel();
        };
    }, [isActive, remeasure]);
};

export default useRemeasureOnScroll;
