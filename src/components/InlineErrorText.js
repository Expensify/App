import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Text from './Text';

const propTypes = {
    /** Text to display */
    children: PropTypes.string,

    /** Styling for inline error text */
    styles: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    children: 'Error',
    styles: [],
};

const InlineErrorText = (props) => {
    if (_.isEmpty(props.children)) {
        return null;
    }

    return (
        <Text style={[...props.styles, styles.formError, styles.mt1]}>{props.children}</Text>
    );
};

InlineErrorText.propTypes = propTypes;
InlineErrorText.defaultProps = defaultProps;
InlineErrorText.displayName = 'InlineErrorText';
export default InlineErrorText;
