import React from 'react';
import _ from 'underscore';
// eslint-disable-next-line no-restricted-imports
import {Text as RNText} from 'react-native';
import fontFamily from '../../styles/fontFamily';
import variables from '../../styles/variables';
import {propTypes, defaultProps} from './baseTextPropTypes';


const Text = React.forwardRef(({
    color,
    fontSize,
    textAlign,
    children,
    family,
    style,
    ...props
}, ref) => {
    // If the style prop is an array of styles, we need to mix them all together
    const mergedStyles = !_.isArray(style) ? style : _.reduce(style, (finalStyles, s) => ({
        ...finalStyles,
        ...s,
    }), {});
    const componentStyle = {
        color,
        fontSize,
        textAlign,
        fontFamily: fontFamily[family],
        ...mergedStyles,
    };

    if (!componentStyle.lineHeight && componentStyle.fontSize === variables.fontSizeNormal) {
        componentStyle.lineHeight = variables.fontSizeNormalHeight;
    }

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <RNText ref={ref} style={[componentStyle]} {...props}>{children}</RNText>
    );
});

Text.propTypes = propTypes;
Text.defaultProps = defaultProps;
Text.displayName = 'Text';

export default Text;
