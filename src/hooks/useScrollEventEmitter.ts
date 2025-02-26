import {useCallback, useEffect, useRef, useState} from 'react';
import {DeviceEventEmitter} from 'react-native';
import CONST from '@src/CONST';

/**
 * This hook tracks scroll events and emits a "scrolling" event when scrolling starts and ends.
 */
const useScrollEventEmitter = <T extends Object>(additionalEmitData: T) => {
    const isScrollingRef = useRef<boolean>(false);
    let timeout: NodeJS.Timeout | null = null; // Timeout for detecting the end of scrolling

    const triggerScrollEvent = useCallback(() => {
        const emitScrolling = (isScrolling: boolean) => {
            DeviceEventEmitter.emit(CONST.EVENTS.SCROLLING, {
                isScrolling,
                ...additionalEmitData,
            });
        };

        // Start emitting the scrolling event when the scroll begins
        if (!isScrollingRef.current) {
            emitScrolling(true);
            isScrollingRef.current = true;
        }

        // End the scroll and emit after a brief timeout to detect the end of scrolling
        if (timeout) {
            clearTimeout(timeout); // Clear any existing timeout
        }

        timeout = setTimeout(() => {
            emitScrolling(false);
            isScrollingRef.current = false;
        }, 250);
    }, [additionalEmitData]);

    useEffect(() => {
        triggerScrollEvent();
    }, [triggerScrollEvent]);

    return triggerScrollEvent;
};

export default useScrollEventEmitter;
