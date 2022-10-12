import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import Text from './Text';
import styles from '../styles/styles';
import stylePropTypes from '../styles/stylePropTypes';

const propTypes = {
    /** Text to show */
    children: PropTypes.string,

    /** Text additional style */
    style: stylePropTypes,
};

const defaultProps = {
    children: '',
    style: [],
};

const TextPill = (props) => {
    const mergedStyles = !_.isArray(props.style) ? props.style : _.reduce(props.style, (finalStyles, s) => ({
        ...finalStyles,
        ...s,
    }), {});

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Text {...props} style={[styles.textPill, mergedStyles]} numberOfLines={1}>{props.children}</Text>;
};

TextPill.propTypes = propTypes;
TextPill.defaultProps = defaultProps;
TextPill.displayName = 'TextPill';

export default TextPill;
