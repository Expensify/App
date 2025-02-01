import {useCallback, useEffect, useRef, useState} from 'react';
import {DeviceEventEmitter} from 'react-native';
import CONST from '@src/CONST';

/**
 * This hook tracks scroll events and emits a "scrolling" event when scrolling starts and ends.
 */
const useScrollEventEmitter = <T extends Object>(additinalEmitData: T) => {
    const [lastScrollEvent, setLastScrollEvent] = useState<number | null>(null);
    const isScrollingRef = useRef<boolean>(false);

    const triggerScrollEvent = useCallback(() => {
        setLastScrollEvent(Date.now());
    }, []);

    useEffect(() => {
        const emitScrolling = (isScrolling: boolean) => {
            DeviceEventEmitter.emit(CONST.EVENTS.SCROLLING, {
                isScrolling,
                ...additinalEmitData,
            });
        };

        // Start emitting the scrolling event when the scroll begins
        if (!isScrollingRef.current) {
            emitScrolling(true);
            isScrollingRef.current = true;
        }

        // End the scroll and emit after a brief timeout to detect the end of scrolling
        const timeout = setTimeout(() => {
            emitScrolling(false);
            isScrollingRef.current = false;
        }, 250);

        return () => clearTimeout(timeout);
    }, [lastScrollEvent]);

    return triggerScrollEvent;
};

export default useScrollEventEmitter;
