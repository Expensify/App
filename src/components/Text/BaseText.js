import React from 'react';
import _ from 'underscore';
// eslint-disable-next-line no-restricted-imports
import {Text as RNText} from 'react-native';
import {defaultProps, propTypes} from './baseTextPropTypes';
import fontFamily from '../../styles/fontFamily';
import variables from '../../styles/variables';

const BaseText = React.forwardRef(({
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
        <RNText allowFontScaling={false} ref={ref} style={[componentStyle]} {...props}>{children}</RNText>
    );
});

BaseText.propTypes = propTypes;
BaseText.defaultProps = defaultProps;
BaseText.displayName = 'BaseText';

export default BaseText;
