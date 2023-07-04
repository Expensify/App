import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';

const propTypes = {
    /** Position index of the list item in a list view */
    index: PropTypes.number.isRequired,
};

function CellRendererComponent(props) {
    return (
        <View
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            style={[styles.invert, { zIndex: -props.index }]}
        />
    );
}

CellRendererComponent.propTypes = propTypes;
CellRendererComponent.displayName = 'CellRendererComponent';

export default CellRendererComponent;
