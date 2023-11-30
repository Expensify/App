import PropTypes from 'prop-types';
import React, {forwardRef} from 'react';
import FlatList from '@components/FlatList';

const AUTOSCROLL_TO_TOP_THRESHOLD = 128;

const propTypes = {
    /** Same as FlatList can be any array of anything */
    // eslint-disable-next-line react/forbid-prop-types
    data: PropTypes.arrayOf(PropTypes.any),

    /** Same as FlatList although we wrap it in a measuring helper before passing to the actual FlatList component */
    renderItem: PropTypes.func.isRequired,
};

const defaultProps = {
    data: [],
};

const BaseInvertedFlatList = forwardRef((props, ref) => (
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
    />
));

BaseInvertedFlatList.propTypes = propTypes;
BaseInvertedFlatList.defaultProps = defaultProps;
BaseInvertedFlatList.displayName = 'BaseInvertedFlatList';

export default BaseInvertedFlatList;
