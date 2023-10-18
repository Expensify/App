import React, {ForwardedRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Text as RNText, StyleProp} from 'react-native';
import type {TextStyle} from 'react-native';
import fontFamily from '../styles/fontFamily';
import themeColors from '../styles/themes/default';
import variables from '../styles/variables';

type TextProps = {
    /** The color of the text */
    color?: string;

    /** The size of the text */
    fontSize?: number;

    /** The alignment of the text */
    textAlign?: 'left' | 'right' | 'auto' | 'center' | 'justify' | undefined;

    /** Any children to display */
    children: React.ReactNode;

    /** The family of the font to use */
    family?: keyof typeof fontFamily;

    /** Any additional styles to apply */
    // eslint-disable-next-line react/forbid-prop-types
    style?: StyleProp<TextStyle>;
};

function Text(
    {color = themeColors.text, fontSize = variables.fontSizeNormal, textAlign = 'left', children = null, family = 'EXP_NEUE', style = {}, ...props}: TextProps,
    ref: ForwardedRef<RNText>,
) {
    // If the style prop is an array of styles, we need to mix them all together
    const mergedStyles = !Array.isArray(style)
        ? style
        : style.reduce(
              (finalStyles: TextStyle, s) => ({
                  ...finalStyles,
                  ...(s as TextStyle),
              }),
              {},
          );
    const componentStyle: TextStyle = {
        color,
        fontSize,
        textAlign,
        fontFamily: fontFamily[family],
        ...(typeof mergedStyles === 'object' ? mergedStyles : {}),
    };

    if (!componentStyle.lineHeight && componentStyle.fontSize === variables.fontSizeNormal) {
        componentStyle.lineHeight = variables.fontSizeNormalHeight;
    }

    return (
        <RNText
            allowFontScaling={false}
            ref={ref}
            style={[componentStyle]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            {children}
        </RNText>
    );
}

Text.displayName = 'Text';

export default React.forwardRef(Text);
