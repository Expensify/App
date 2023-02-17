import React from 'react';
import PropTypes from 'prop-types';
import Text from './Text';
import styles from '../styles/styles';
import stylePropTypes from '../styles/stylePropTypes';
import * as StyleUtils from '../styles/StyleUtils';

const propTypes = {
    text: PropTypes.string.isRequired,

    /** Text additional style */
    style: stylePropTypes,
};

const defaultProps = {
    style: [],
};

const TextPill = (props) => {
    const propsStyle = StyleUtils.parseStyleAsArray(props.style);

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Text {...props} style={[styles.textPill, ...propsStyle]} numberOfLines={1}>{props.text}</Text>;
};

TextPill.propTypes = propTypes;
TextPill.defaultProps = defaultProps;
TextPill.displayName = 'TextPill';

export default TextPill;
