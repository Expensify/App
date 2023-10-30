import PropTypes from 'prop-types';
import React from 'react';
import stylePropTypes from '@styles/stylePropTypes';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import Text from './Text';

const propTypes = {
    text: PropTypes.string.isRequired,

    /** Text additional style */
    style: stylePropTypes,
};

const defaultProps = {
    style: [],
};

function TextPill(props) {
    const styles = useThemeStyles();
    const propsStyle = StyleUtils.parseStyleAsArray(props.style);

    return (
        <Text
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            style={[styles.textPill, ...propsStyle]}
            numberOfLines={1}
        >
            {props.text}
        </Text>
    );
}

TextPill.propTypes = propTypes;
TextPill.defaultProps = defaultProps;
TextPill.displayName = 'TextPill';

export default TextPill;
