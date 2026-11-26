import CONST from '@src/CONST';

import {useEffect, useRef} from 'react';
import {DeviceEventEmitter} from 'react-native';

/**
 * This hook tracks scroll events and emits a "scrolling" event when scrolling starts and ends.
 */
const useScrollEventEmitter = () => {
    const isScrollingRef = useRef<boolean>(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const triggerScrollEvent = () => {
        const emitScrolling = (isScrolling: boolean) => {
            DeviceEventEmitter.emit(CONST.EVENTS.SCROLLING, isScrolling);
        };

        // Start emitting the scrolling event when the scroll begins
        if (!isScrollingRef.current) {
            emitScrolling(true);
            isScrollingRef.current = true;
        }

        // End the scroll and emit after a brief timeout to detect the end of scrolling
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            emitScrolling(false);
            isScrollingRef.current = false;
        }, 250);
    };

    // The pending timeout is what would emit the scroll end, so clearing it on unmount emits that end right away.
    // Otherwise listeners would treat the scroll as ongoing.
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (!isScrollingRef.current) {
                return;
            }
            isScrollingRef.current = false;
            DeviceEventEmitter.emit(CONST.EVENTS.SCROLLING, false);
        };
    }, []);

    return triggerScrollEvent;
};

export default useScrollEventEmitter;
