import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import compose from '../libs/compose';
import styles from '../styles/styles';

const propTypes = {
    /** Styles for container element */
    containerStyles: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    containerStyles: [],
};

const FormAlertWrapper = (props) => {
    return (
        <View style={[styles.mh5, styles.mb5, styles.flex1, styles.justifyContentEnd, ...props.containerStyles]}>
        </View>
    );
};

FormAlertWrapper.propTypes = propTypes;
FormAlertWrapper.defaultProps = defaultProps;
FormAlertWrapper.displayName = 'FormAlertWrapper';

export default compose(
)(FormAlertWrapper);
