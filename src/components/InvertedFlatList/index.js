import React, {forwardRef, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {DeviceEventEmitter, FlatList, StyleSheet} from 'react-native';
import _ from 'underscore';
import BaseInvertedFlatList from './BaseInvertedFlatList';
import styles from '../../styles/styles';
import CONST from '../../CONST';

const propTypes = {
    /** Passed via forwardRef so we can access the FlatList ref */
    innerRef: PropTypes.shape({
        current: PropTypes.instanceOf(FlatList),
    }).isRequired,

    /** Any additional styles to apply */
    // eslint-disable-next-line react/forbid-prop-types
    contentContainerStyle: PropTypes.any,

    /** Same as for FlatList */
    onScroll: PropTypes.func,
};

// This is adapted from https://codesandbox.io/s/react-native-dsyse
// It's a HACK alert since FlatList has inverted scrolling on web
function InvertedFlatList(props) {
    const {innerRef, contentContainerStyle} = props;
    const listRef = React.createRef();

    const lastScrollEvent = useRef(null);
    const scrollEndTimeout = useRef(null);
    const updateInProgress = useRef(false);
    const eventHandler = useRef(null);

    useEffect(() => {
        if (!_.isFunction(innerRef)) {
            // eslint-disable-next-line no-param-reassign
            innerRef.current = listRef.current;
        } else {
            innerRef(listRef);
        }

        return () => {
            if (scrollEndTimeout.current) {
                clearTimeout(scrollEndTimeout.current);
            }

            if (eventHandler.current) {
                eventHandler.current.remove();
            }
        };
    }, [innerRef, listRef]);

    /**
     * Emits when the scrolling is in progress. Also,
     * invokes the onScroll callback function from props.
     *
     * @param {Event} event - The onScroll event from the FlatList
     */
    const onScroll = (event) => {
        props.onScroll(event);

        if (!updateInProgress.current) {
            updateInProgress.current = true;
            eventHandler.current = DeviceEventEmitter.emit(CONST.EVENTS.SCROLLING, true);
        }
    };

    /**
     * Emits when the scrolling has ended.
     */
    const onScrollEnd = () => {
        eventHandler.current = DeviceEventEmitter.emit(CONST.EVENTS.SCROLLING, false);
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
     * @param {Event} event - The onScroll event from the FlatList
     */
    const handleScroll = (event) => {
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
            ref={listRef}
            shouldMeasureItems
            contentContainerStyle={StyleSheet.compose(contentContainerStyle, styles.justifyContentEnd)}
            onScroll={handleScroll}
            // We need to keep batch size to one to workaround a bug in react-native-web.
            // This can be removed once https://github.com/Expensify/App/pull/24482 is merged.
            maxToRenderPerBatch={1}
        />
    );
}

InvertedFlatList.propTypes = propTypes;
InvertedFlatList.defaultProps = {
    contentContainerStyle: {},
    onScroll: () => {},
};

const InvertedFlatListWithRef = forwardRef((props, ref) => (
    <InvertedFlatList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));

InvertedFlatListWithRef.displayName = 'InvertedFlatListWithRef';

export default InvertedFlatListWithRef;
