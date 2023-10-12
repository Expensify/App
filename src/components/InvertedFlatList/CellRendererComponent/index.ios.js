import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';

const propTypes = {
    /** Position index of the list item in a list view */
    index: PropTypes.number.isRequired,

    /** Styles that are passed to the component */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),
};

const defaultProps = {
    style: {},
};

function CellRendererComponent(props) {
    return (
        <View
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            style={[
                props.style,

                /**
                 * To achieve absolute positioning and handle overflows for list items,
                 * it is necessary to assign zIndex values. In the case of inverted lists,
                 * the lower list items will have higher zIndex values compared to the upper
                 * list items. Consequently, lower list items can overflow the upper list items.
                 * See: https://github.com/Expensify/App/issues/20451
                 */
                {zIndex: -props.index},
            ]}
        />
    );
}

CellRendererComponent.propTypes = propTypes;
CellRendererComponent.defaultProps = defaultProps;
CellRendererComponent.displayName = 'CellRendererComponent';

export default CellRendererComponent;
