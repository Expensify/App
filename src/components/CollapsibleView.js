import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';

const propTypes = {
    /** Main Content */
    children: PropTypes.func.isRequired,

    /** Whether the content is visible. */
    isVisible: PropTypes.bool,
};

const defaultProps = {
    isVisible: false,
};

const CollapsibleView = props => (
    <View style={!props.isVisible && styles.visuallyHidden}>
        {props.children(props.isVisible)}
    </View>
);

CollapsibleView.propTypes = propTypes;
CollapsibleView.defaultProps = defaultProps;
CollapsibleView.displayName = 'CollapsibleView';

export default CollapsibleView;
