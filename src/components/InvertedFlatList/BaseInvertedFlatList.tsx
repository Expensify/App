import type {ForwardedRef} from 'react';
import React, {forwardRef, useEffect, useRef} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import FlatList from '@components/FlatList';
import type {InvertedFlatListProps} from './types';

const WINDOW_SIZE = 15;
const AUTOSCROLL_TO_TOP_THRESHOLD = 128;

function BaseInvertedFlatList<T>({onScroll: onScrollProp = () => {}, onScrollEnd: onScrollEndProp = () => {}, ...props}: InvertedFlatListProps<T>, ref: ForwardedRef<FlatList>) {
    const lastScrollEvent = useRef<number | null>(null);
    const scrollEndTimeout = useRef<NodeJS.Timeout | null>(null);

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
    const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        onScrollProp(event);
    };

    /**
     * Emits when the scrolling has ended. Also,
     * invokes the onScrollEnd callback function from props.
     */
    const onScrollEnd = () => {
        onScrollEndProp();
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

        scrollEndTimeout.current = setTimeout(() => {
            if (lastScrollEvent.current !== timestamp) {
                return;
            }
            // Scroll has ended
            lastScrollEvent.current = null;
            onScrollEnd();
        }, 250);

        lastScrollEvent.current = timestamp;
    };

    return (
        <FlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            windowSize={WINDOW_SIZE}
            maintainVisibleContentPosition={{
                minIndexForVisible: 0,
                autoscrollToTopThreshold: AUTOSCROLL_TO_TOP_THRESHOLD,
            }}
            inverted
            onScroll={handleScroll}
        />
    );
}

BaseInvertedFlatList.displayName = 'BaseInvertedFlatList';

export default forwardRef(BaseInvertedFlatList);
