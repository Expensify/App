import React, {forwardRef} from 'react';
import PropTypes from 'prop-types';
import BaseInvertedFlatList from './BaseInvertedFlatList';

const propTypes = {
    /** The initial number of items to render */
    initialNumToRender: PropTypes.number.isRequired,
};

const InvertedFlatList = forwardRef((props, ref) => (
    <BaseInvertedFlatList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
        initialNumToRender={props.initialNumToRender}
    />
));

InvertedFlatList.propTypes = propTypes;
export default InvertedFlatList;
