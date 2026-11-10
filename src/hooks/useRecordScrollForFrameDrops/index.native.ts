import {recordScroll} from '@libs/telemetry/frameDrops/frameDropTimeline';

import CONST from '@src/CONST';

import {useEffect, useRef} from 'react';

/**
 * Records scrolling of a list that doesn't emit CONST.EVENTS.SCROLLING on native (the report chat), so frames dropped
 * while it scrolls are attributed to the scroll. It calls the frame drop timeline directly: emitting the global event
 * would also change how other components behave while scrolling (e.g. educational tooltips hide).
 * Returns a function to call from the list's onScroll.
 */
function useRecordScrollForFrameDrops() {
    const scrollEndTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    useEffect(
        () => () => {
            if (!scrollEndTimeoutRef.current) {
                return;
            }
            clearTimeout(scrollEndTimeoutRef.current);
            recordScroll(false);
        },
        [],
    );

    return () => {
        if (scrollEndTimeoutRef.current) {
            clearTimeout(scrollEndTimeoutRef.current);
        } else {
            recordScroll(true);
        }
        scrollEndTimeoutRef.current = setTimeout(() => {
            scrollEndTimeoutRef.current = undefined;
            recordScroll(false);
        }, CONST.TELEMETRY.FRAME_DROPS.SCROLL_END_DELAY_MS);
    };
}

export default useRecordScrollForFrameDrops;
