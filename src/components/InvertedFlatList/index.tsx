import React, {useEffect, useRef} from 'react';
import {DeviceEventEmitter} from 'react-native';
import {runOnJS, useAnimatedReaction} from 'react-native-reanimated';
import useKeyboardDismissibleFlatListValues from '@components/KeyboardDismissibleFlatList/useKeyboardDismissibleFlatListValues';
import CONST from '@src/CONST';
import BaseInvertedFlatList from './BaseInvertedFlatList';
import type {BaseInvertedFlatListProps} from './BaseInvertedFlatList/types';
import CellRendererComponent from './CellRendererComponent';

// This is adapted from https://codesandbox.io/s/react-native-dsyse
// It's a HACK alert since FlatList has inverted scrolling on web
function InvertedFlatList<T>({ref, ...props}: BaseInvertedFlatListProps<T>) {
    const lastScrollEvent = useRef<number | null>(null);
    const scrollEndTimeout = useRef<NodeJS.Timeout | null>(null);
    const updateInProgress = useRef<boolean>(false);
    const {scrollY} = useKeyboardDismissibleFlatListValues();

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
     */
    const onScroll = () => {
        if (updateInProgress.current) {
            return;
        }

        updateInProgress.current = true;
        DeviceEventEmitter.emit(CONST.EVENTS.SCROLLING, true);
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
    const handleScroll = () => {
        onScroll();

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

    useAnimatedReaction(
        () => scrollY.get(),
        () => {
            runOnJS(handleScroll)();
        },
    );

    return (
        <BaseInvertedFlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            CellRendererComponent={CellRendererComponent}
        />
    );
}

InvertedFlatList.displayName = 'InvertedFlatList';

export default InvertedFlatList;
