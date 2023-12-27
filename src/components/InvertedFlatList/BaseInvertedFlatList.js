import PropTypes from 'prop-types';
import React, {forwardRef, useEffect, useRef} from 'react';
import FlatList from '@components/FlatList';

const AUTOSCROLL_TO_TOP_THRESHOLD = 128;

const propTypes = {
    /** Same as FlatList can be any array of anything */
    // eslint-disable-next-line react/forbid-prop-types
    data: PropTypes.arrayOf(PropTypes.any),

    /** Same as FlatList although we wrap it in a measuring helper before passing to the actual FlatList component */
    renderItem: PropTypes.func.isRequired,

    /** Passed via forwardRef so we can access the FlatList ref */
    innerRef: PropTypes.shape({
        current: PropTypes.instanceOf(FlatList),
    }).isRequired,

    /** Same as for FlatList */
    onScroll: PropTypes.func,

    /** Handler called when the scroll actions ends */
    onScrollEnd: PropTypes.func,
};

const defaultProps = {
    data: [],
    onScroll: () => {},
    onScrollEnd: () => {},
};

const BaseInvertedFlatList = forwardRef((props, ref) => {
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
            windowSize={15}
            maintainVisibleContentPosition={{
                minIndexForVisible: 0,
                autoscrollToTopThreshold: AUTOSCROLL_TO_TOP_THRESHOLD,
            }}
            inverted
            onScroll={handleScroll}
        />
    );
});

BaseInvertedFlatList.propTypes = propTypes;
BaseInvertedFlatList.defaultProps = defaultProps;
BaseInvertedFlatList.displayName = 'BaseInvertedFlatList';

export default BaseInvertedFlatList;
