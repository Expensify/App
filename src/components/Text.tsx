import React, {ForwardedRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Text as RNText, TextProps as RNTextProps, StyleSheet} from 'react-native';
import type {TextStyle} from 'react-native';
import fontFamily from '@styles/fontFamily';
import themeColors from '@styles/themes/default';
import variables from '@styles/variables';

type TextProps = RNTextProps & {
    /** The color of the text */
    color?: string;

    /** The size of the text */
    fontSize?: number;
    /** The alignment of the text */
    textAlign?: 'left' | 'right' | 'auto' | 'center' | 'justify';
    /** Any children to display */
    children: React.ReactNode;

    /** The family of the font to use */
    family?: keyof typeof fontFamily;
};

function Text(
    {color = themeColors.text, fontSize = variables.fontSizeNormal, textAlign = 'left', children = null, family = 'EXP_NEUE', style = {}, ...props}: TextProps,
    ref: ForwardedRef<RNText>,
) {
    const componentStyle: TextStyle = {
        color,
        fontSize,
        textAlign,
        fontFamily: fontFamily[family],
        ...StyleSheet.flatten(style),
    };

    if (!componentStyle.lineHeight && componentStyle.fontSize === variables.fontSizeNormal) {
        componentStyle.lineHeight = variables.fontSizeNormalHeight;
    }
    return (
        <RNText
            allowFontScaling={false}
            ref={ref}
            style={componentStyle}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            {children}
        </RNText>
    );
}

Text.displayName = 'Text';

export default React.forwardRef(Text);
