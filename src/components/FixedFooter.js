import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';

const propTypes = {
    /** Children to wrap in FixedFooter. */
    children: PropTypes.node.isRequired,

    /** Styles to be assigned to Container */
    style: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    style: [],
};

const FixedFooter = props => (
    <View style={[styles.ph5, styles.pb5, styles.flexShrink0, ...props.style]}>
        {props.children}
    </View>
);

FixedFooter.propTypes = propTypes;
FixedFooter.defaultProps = defaultProps;
FixedFooter.displayName = 'FixedFooter';
export default FixedFooter;
