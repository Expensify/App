import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import ExpensifyText from './ExpensifyText';

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
        <ExpensifyText style={[styles.formError, styles.mt1]}>{props.children}</ExpensifyText>
    );
};

InlineErrorText.propTypes = propTypes;
InlineErrorText.defaultProps = defaultProps;
InlineErrorText.displayName = 'InlineErrorText';
export default InlineErrorText;
