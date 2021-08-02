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

        // Remove clipped subviews helps prevent avatars and attachments from eating up excess memory on Android. When
        // we run out of memory images stop appearing without any warning.
        // eslint-disable-next-line react/jsx-props-no-multi-spaces
        shouldRemoveClippedSubviews
    />
));

InvertedFlatList.propTypes = propTypes;
export default InvertedFlatList;
