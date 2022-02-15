import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Text from './Text';

const propTypes = {
    /** Text to display */
    children: PropTypes.string,
};

const defaultProps = {
    children: 'Error',
};

const InlineErrorText = (props) => {
    if (_.isEmpty(props.children)) {
        return null;
    }

    return (
        <Text style={[styles.formError, styles.mt1, styles.ml3]}>{props.children}</Text>
    );
};

InlineErrorText.propTypes = propTypes;
InlineErrorText.defaultProps = defaultProps;
InlineErrorText.displayName = 'InlineErrorText';
export default InlineErrorText;
