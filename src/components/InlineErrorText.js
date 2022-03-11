import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Text from './Text';

const propTypes = {
    /** Text to display */
    children: PropTypes.string,

    /** Customized styles applied on a single InlineErrorText component  */
    style: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    children: 'Error',
    style: [],
};

const InlineErrorText = (props) => {
    if (_.isEmpty(props.children)) {
        return null;
    }

    return (
        <Text style={[styles.formError, styles.mt1, ...props.style]}>{props.children}</Text>
    );
};

InlineErrorText.propTypes = propTypes;
InlineErrorText.defaultProps = defaultProps;
InlineErrorText.displayName = 'InlineErrorText';
export default InlineErrorText;
