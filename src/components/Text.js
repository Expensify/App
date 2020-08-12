import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {Text as RNText} from 'react-native';
import fontFamily from '../style/fontFamily';

const propTypes = {
    // The color of the text
    color: PropTypes.string,

    // The size of the text
    fontSize: PropTypes.number,

    // The alignment of the text
    textAlign: PropTypes.any,

    // Any children to display
    children: PropTypes.node,

    // The family of the font to use
    family: PropTypes.string,

    // Any additional styles to apply
    style: PropTypes.any,
};
const defaultProps = {
    color: '#4A5960',
    fontSize: 15,
    family: 'GTA',
    textAlign: null,
    children: null,
    style: {},
};

const Text = ({
    color,
    fontSize,
    textAlign,
    children,
    family,
    style,
    ...props
}) => {
    // If the style prop is an array of styles, we need to mix them all together
    const mergedStyles = !_.isArray(style) ? style : _.reduce(style, (finalStyles, s) => ({
        ...finalStyles,
        ...s
    }), {});

    const componentStyle = {
        color,
        fontSize,
        lineHeight: '1.4',
        textAlign,
        ...fontFamily[family],
        ...mergedStyles,
    };

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <RNText style={[componentStyle]} {...props}>{children}</RNText>
    );
};

Text.propTypes = propTypes;
Text.defaultProps = defaultProps;
Text.displayName = 'Text';

export default Text;
