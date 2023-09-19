import React, {forwardRef, useEffect} from 'react';
import PropTypes from 'prop-types';
import {FlatList} from 'react-native';
import _ from 'underscore';
import BaseInvertedFlatList from './BaseInvertedFlatList';

const propTypes = {
    /** Passed via forwardRef so we can access the FlatList ref */
    innerRef: PropTypes.shape({
        current: PropTypes.instanceOf(FlatList),
    }).isRequired,

    /** Any additional styles to apply */
    // eslint-disable-next-line react/forbid-prop-types
    contentContainerStyle: PropTypes.any,
};

// This is adapted from https://codesandbox.io/s/react-native-dsyse
// It's a HACK alert since FlatList has inverted scrolling on web
function InvertedFlatList(props) {
    const {innerRef, contentContainerStyle} = props;
    const listRef = React.createRef();

    useEffect(() => {
        if (!_.isFunction(innerRef)) {
            // eslint-disable-next-line no-param-reassign
            innerRef.current = listRef.current;
        } else {
            innerRef(listRef);
        }
    }, [innerRef, listRef]);

    return (
        <BaseInvertedFlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            inverted
            ref={listRef}
            shouldMeasureItems
            contentContainerStyle={contentContainerStyle}
        />
    );
}

InvertedFlatList.propTypes = propTypes;
InvertedFlatList.defaultProps = {
    contentContainerStyle: {},
};

export default forwardRef((props, ref) => (
    <InvertedFlatList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));
