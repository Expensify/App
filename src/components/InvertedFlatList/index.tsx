import React, {ForwardedRef, forwardRef, useRef} from 'react';
import {DeviceEventEmitter, FlatList, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import CONST from '@src/CONST';
import BaseInvertedFlatList from './BaseInvertedFlatList';
import  {InvertedFlatListProps} from './types'

// This is adapted from https://codesandbox.io/s/react-native-dsyse
// It's a HACK alert since FlatList has inverted scrolling on web
function InvertedFlatList<T>({onScroll: onScrollProp = () => {}, onScrollEnd: onScrollEndProp = () => {}, contentContainerStyle, ...props}: InvertedFlatListProps<T>, ref: ForwardedRef<FlatList>) {
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
            contentContainerStyle={contentContainerStyle}
            onScroll={handleScroll}
            onScrollEnd={handleScrollEnd}
        />
    );
}

InvertedFlatList.displayName = 'InvertedFlatList';

export default forwardRef(InvertedFlatList);