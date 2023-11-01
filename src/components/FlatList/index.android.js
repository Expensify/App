import React, {forwardRef, useCallback, useState} from 'react';
import {FlatList} from 'react-native';
import PropTypes from 'prop-types';
import {useFocusEffect} from '@react-navigation/native';

const propTypes = {
    /** Same as for FlatList */
    onScroll: PropTypes.func,

    /** Same as for FlatList */
    onLayout: PropTypes.func,

    /** Same as for FlatList */
    // eslint-disable-next-line react/forbid-prop-types
    maintainVisibleContentPosition: PropTypes.object,

    /** Passed via forwardRef so we can access the FlatList ref */
    innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.instanceOf(FlatList)})]).isRequired,
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
    const [scrollPosition, setScrollPosition] = useState({});

    const onScreenFocus = useCallback(() => {
        if (!props.innerRef.current || !scrollPosition.offset) {
            return;
        }
        if (props.innerRef.current && scrollPosition.offset) {
            props.innerRef.current.scrollToOffset({offset: scrollPosition.offset, animated: false});
        }
    }, [scrollPosition.offset, props.innerRef]);

    useFocusEffect(
        useCallback(() => {
            onScreenFocus();
        }, [onScreenFocus]),
    );

    return (
        <FlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onScroll={(event) => props.onScroll(event)}
            onMomentumScrollEnd={(event) => {
                setScrollPosition({offset: event.nativeEvent.contentOffset.y});
            }}
            ref={props.innerRef}
        />
    );
}

CustomFlatList.propTypes = propTypes;
CustomFlatList.defaultProps = defaultProps;

const CustomFlatListWithRef = forwardRef((props, ref) => (
    <CustomFlatList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));

CustomFlatListWithRef.displayName = 'CustomFlatListWithRef';

export default CustomFlatListWithRef;
