import React, {forwardRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import {StyleSheet, Text as RNText} from 'react-native';
import {defaultProps, propTypes} from './baseTextPropTypes';
import fontFamily from '../../styles/fontFamily';
import variables from '../../styles/variables';

// eslint-disable-next-line react/destructuring-assignment
const BaseText = ({
    color,
    fontSize,
    textAlign,
    children,
    family,
    style,
    innerRef,
    ...props
}) => {
    // If the style prop is an array of styles, we need to mix them all together
    const mergedStyles = StyleSheet.flatten(style);
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
        <RNText allowFontScaling={false} ref={innerRef} style={[componentStyle]} {...props}>{children}</RNText>
    );
};

BaseText.propTypes = propTypes;
BaseText.defaultProps = defaultProps;
BaseText.displayName = 'BaseText';

export default forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <BaseText {...props} innerRef={ref} />
));
