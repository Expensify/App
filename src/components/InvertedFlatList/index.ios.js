import React, {forwardRef} from 'react';
import PropTypes from 'prop-types';
import BaseInvertedFlatList from './BaseInvertedFlatList';

const propTypes = {
    onScrollToTop: PropTypes.func.isRequired,
};

const InvertedFlatList = forwardRef((props, ref) => (
    <BaseInvertedFlatList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
        shouldMeasureItems={false}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
            props.onScrollToTop();
        }}
    />
));

InvertedFlatList.displayName = 'InvertedFlatList';
InvertedFlatList.propTypes = propTypes;
export default InvertedFlatList;
