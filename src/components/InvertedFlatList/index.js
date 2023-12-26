import React, {forwardRef, useEffect, useRef} from 'react';
import {DeviceEventEmitter} from 'react-native';
import CONST from '@src/CONST';
import BaseInvertedFlatList from './BaseInvertedFlatList';
import * as baseInvertedFlatListPropTypes from './baseInvertedFlatListPropTypes';

// This is adapted from https://codesandbox.io/s/react-native-dsyse
// It's a HACK alert since FlatList has inverted scrolling on web
function InvertedFlatList(props) {
    const {innerRef, contentContainerStyle} = props;

    const updateInProgress = useRef(false);
    const eventHandler = useRef(null);

    useEffect(
        () => () => {
            if (!eventHandler.current) {
                return;
            }

            eventHandler.current.remove();
        },
        [innerRef],
    );

    /**
     * Emits when the scrolling is in progress. Also,
     * invokes the onScroll callback function from props.
     *
     * @param {Event} event - The onScroll event from the FlatList
     */
    const handleScroll = (event) => {
        props.onScroll(event);

        if (!updateInProgress.current) {
            updateInProgress.current = true;
            eventHandler.current = DeviceEventEmitter.emit(CONST.EVENTS.SCROLLING, true);
        }
    };

    /**
     * Emits when the scrolling has ended. Also,
     * invokes the onScrollEnd callback function from props.
     */
    const handleScrollEnd = () => {
        eventHandler.current = DeviceEventEmitter.emit(CONST.EVENTS.SCROLLING, false);
        updateInProgress.current = false;

        props.onScrollEnd();
    };

    return (
        <BaseInvertedFlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={innerRef}
            contentContainerStyle={contentContainerStyle}
            onScroll={handleScroll}
            onScrollEnd={handleScrollEnd}
        />
    );
}

InvertedFlatList.propTypes = baseInvertedFlatListPropTypes.propTypes;
InvertedFlatList.defaultProps = baseInvertedFlatListPropTypes.defaultProps;
InvertedFlatList.displayName = 'InvertedFlatList';

const InvertedFlatListWithRef = forwardRef((props, ref) => (
    <InvertedFlatList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));

InvertedFlatListWithRef.displayName = 'InvertedFlatListWithRef';

export default InvertedFlatListWithRef;
