import PropTypes from 'prop-types';
import React, {forwardRef, useEffect, useRef} from 'react';
import {FlatList} from 'react-native';
import useThemeStyles from '@styles/useThemeStyles';
import BaseInvertedFlatList from './BaseInvertedFlatList';
import CellRendererComponent from './CellRendererComponent';

const propTypes = {
    /** Passed via forwardRef so we can access the FlatList ref */
    innerRef: PropTypes.shape({
        current: PropTypes.instanceOf(FlatList),
    }).isRequired,

    /** Same as for FlatList */
    onScroll: PropTypes.func,

    /** Handler called when the scroll actions ends */
    onScrollEnd: PropTypes.func,
};

const BaseInvertedFlatListWithRef = forwardRef((props, ref) => {
    const styles = useThemeStyles();
    const lastScrollEvent = useRef(null);
    const scrollEndTimeout = useRef(null);

    useEffect(
        () => () => {
            if (!scrollEndTimeout.current) {
                return;
            }

            clearTimeout(scrollEndTimeout.current);
        },
        [props.innerRef],
    );

    /**
     * Emits when the scrolling is in progress. Also,
     * invokes the onScroll callback function from props.
     *
     * @param {Event} event - The onScroll event from the FlatList
     */
    const onScroll = (event) => {
        props.onScroll(event);
    };

    /**
     * Emits when the scrolling has ended. Also,
     * invokes the onScrollEnd callback function from props.
     */
    const onScrollEnd = () => {
        props.onScrollEnd();
    };

    /**
     * Decides whether the scrolling has ended or not. If it has ended,
     * then it calls the onScrollEnd function. Otherwise, it calls the
     * onScroll function and pass the event to it.
     *
     * @param {Event} event - The onScroll event from the FlatList
     */
    const handleScroll = (event) => {
        onScroll(event);

        const timestamp = Date.now();

        // console.log('=> handleScroll', {timestamp, 'lastScrollEvent.current': lastScrollEvent.current})

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
        <BaseInvertedFlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            contentContainerStyle={styles.justifyContentEnd}
            CellRendererComponent={CellRendererComponent}
            /**
             * To achieve absolute positioning and handle overflows for list items, the property must be disabled
             * for Android native builds.
             * Source: https://reactnative.dev/docs/0.71/optimizing-flatlist-configuration#removeclippedsubviews
             */
            removeClippedSubviews={false}
            onScroll={handleScroll}
        />
    );
});

BaseInvertedFlatListWithRef.propTypes = propTypes;
BaseInvertedFlatListWithRef.defaultProps = {
    onScroll: () => {},
    onScrollEnd: () => {},
};
BaseInvertedFlatListWithRef.displayName = 'BaseInvertedFlatListWithRef';

export default BaseInvertedFlatListWithRef;
