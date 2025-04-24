import type {ForwardedRef} from 'react';
import React, {forwardRef, useEffect, useRef} from 'react';
import type {FlatList, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {DeviceEventEmitter} from 'react-native';
import CONST from '@src/CONST';
import BaseInvertedFlatList from './BaseInvertedFlatList';
import type {BaseInvertedFlatListProps} from './BaseInvertedFlatList';
import CellRendererComponent from './CellRendererComponent';

// This is adapted from https://codesandbox.io/s/react-native-dsyse
// It's a HACK alert since FlatList has inverted scrolling on web
function InvertedFlatList<T>({onScroll: onScrollProp = () => {}, ...props}: BaseInvertedFlatListProps<T>, ref: ForwardedRef<FlatList>) {
    const lastScrollEvent = useRef<number | null>(null);
    const scrollEndTimeout = useRef<NodeJS.Timeout | null>(null);
    const updateInProgress = useRef<boolean>(false);

    useEffect(
        () => () => {
            if (!scrollEndTimeout.current) {
                return;
            }
            clearTimeout(scrollEndTimeout.current);
        },
        [ref],
    );

    /**
     * Emits when the scrolling is in progress. Also,
     * invokes the onScroll callback function from props.
     *
     * @param event - The onScroll event from the FlatList
     */
    const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        onScrollProp(event);

        if (!updateInProgress.current) {
            updateInProgress.current = true;
            DeviceEventEmitter.emit(CONST.EVENTS.SCROLLING, true);
        }
    };

    /**
     * Emits when the scrolling has ended.
     */
    const onScrollEnd = () => {
        DeviceEventEmitter.emit(CONST.EVENTS.SCROLLING, false);
        updateInProgress.current = false;
    };

    /**
     * Decides whether the scrolling has ended or not. If it has ended,
     * then it calls the onScrollEnd function. Otherwise, it calls the
     * onScroll function and pass the event to it.
     *
     * This is a temporary work around, since react-native-web doesn't
     * support onScrollBeginDrag and onScrollEndDrag props for FlatList.
     * More info:
     * https://github.com/necolas/react-native-web/pull/1305
     *
     * This workaround is taken from below and refactored to fit our needs:
     * https://github.com/necolas/react-native-web/issues/1021#issuecomment-984151185
     *
     */
    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        onScroll(event);
        const timestamp = Date.now();

        if (scrollEndTimeout.current) {
            clearTimeout(scrollEndTimeout.current);
        }

        if (lastScrollEvent.current) {
            scrollEndTimeout.current = setTimeout(() => {
                if (lastScrollEvent.current !== timestamp) {
                    return;
                }
                // Scroll has ended
                lastScrollEvent.current = null;
                onScrollEnd();
            }, 250);
        }

        lastScrollEvent.current = timestamp;
    };

    return (
        <BaseInvertedFlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            onScroll={handleScroll}
            CellRendererComponent={CellRendererComponent}
        />
    );
}

InvertedFlatList.displayName = 'InvertedFlatList';

export default forwardRef(InvertedFlatList);
