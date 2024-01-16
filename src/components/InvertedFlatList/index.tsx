import type {ForwardedRef} from 'react';
import React, {forwardRef, useRef} from 'react';
import type {FlatList, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {DeviceEventEmitter} from 'react-native';
import CONST from '@src/CONST';
import BaseInvertedFlatList from './BaseInvertedFlatList';
import type {InvertedFlatListProps} from './types';
import CellRendererComponent from './CellRendererComponent';

// This is adapted from https://codesandbox.io/s/react-native-dsyse
// It's a HACK alert since FlatList has inverted scrolling on web
function InvertedFlatList<T>({onScroll: onScrollProp = () => {}, onScrollEnd: onScrollEndProp = () => {}, ...props}: InvertedFlatListProps<T>, ref: ForwardedRef<FlatList>) {
    const updateInProgress = useRef<boolean>(false);

    /**
     * Emits when the scrolling is in progress. Also,
     * invokes the onScroll callback function from props.
     *
     * @param event - The onScroll event from the FlatList
     */
    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        onScrollProp(event);

        if (!updateInProgress.current) {
            updateInProgress.current = true;
            DeviceEventEmitter.emit(CONST.EVENTS.SCROLLING, true);
        }
    };

    /**
     * Emits when the scrolling has ended. Also,
     * invokes the onScrollEnd callback function from props.
     */
    const handleScrollEnd = () => {
        DeviceEventEmitter.emit(CONST.EVENTS.SCROLLING, false);
        updateInProgress.current = false;

        onScrollEndProp();
    };

    return (
        <BaseInvertedFlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            onScroll={handleScroll}
            onScrollEnd={handleScrollEnd}
            CellRendererComponent={CellRendererComponent}
        />
    );
}

InvertedFlatList.displayName = 'InvertedFlatList';

export default forwardRef(InvertedFlatList);
