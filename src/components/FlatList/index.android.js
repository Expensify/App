import React, {forwardRef} from 'react';
import {FlatList} from 'react-native';
import PropTypes from 'prop-types';

const propTypes = {
    /** Same as for FlatList */
    onScroll: PropTypes.func,

    /** Same as for FlatList */
    onLayout: PropTypes.func,

    /** Same as for FlatList */
    // eslint-disable-next-line react/forbid-prop-types
    maintainVisibleContentPosition: PropTypes.object,

    /** Passed via forwardRef so we can access the FlatList ref */
    innerRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({current: PropTypes.instanceOf(FlatList)}),
    ]).isRequired,
};

const defaultProps = {
    /** Same as for FlatList */
    onScroll: undefined,

    /** Same as for FlatList */
    onLayout: undefined,

    /** Same as for FlatList */
    maintainVisibleContentPosition: undefined,
};

// FlatList wrapped with the freeze component will lose its scroll state when frozen (only for Android).
// CustomFlatList saves the offset and use it for scrollToOffset() when unfrozen.
function CustomFlatList(props) {
    const contentOffsetRef = React.useRef(null);
    const isHidden = React.useRef(false);
    const [ready, setReady] = React.useState(true);

    const handleOnScroll = (event) => {
        props.onScroll(event);

        // The last onScroll event happens after freezing the FlatList and it's called with offset: 0.
        // Don't save this value because it's incorrect.
        if (!isHidden.current) {
            contentOffsetRef.current = event.nativeEvent.contentOffset;
        }
    };
    const handleOnLayout = (event) => {
        props.onLayout(event);

        if (event.nativeEvent.layout.height === 0) {
            // If the layout height is equal to 0, we can assume that this flatList is frozen.
            isHidden.current = true;

            // The maintainVisibleContentPosition prop causes glitches with animations and scrollToOffset.
            // Use ready state to decide if this prop should be undefined to avoid glitching.
            setReady(false);
        } else {
            isHidden.current = false;
            if (props.innerRef.current && contentOffsetRef.current) {
                props.innerRef.current.scrollToOffset({offset: contentOffsetRef.current.y, animated: false});
                setReady(true);
            }
        }
    };

    return (
        <FlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={props.innerRef}
            onScroll={handleOnScroll}
            onLayout={handleOnLayout}
            maintainVisibleContentPosition={ready ? props.maintainVisibleContentPosition : undefined}
        />
    );
}

CustomFlatList.propTypes = propTypes;
CustomFlatList.defaultProps = defaultProps;

// eslint-disable-next-line react/jsx-props-no-spreading
export default forwardRef((props, ref) => <CustomFlatList {...props} innerRef={ref} />);
