import React, {ForwardedRef} from 'react';
import {Text as RNText, TextProps as RNTextProps, StyleSheet} from 'react-native';
import type {TextStyle} from 'react-native';
import useTheme from '@hooks/useTheme';
import fontFamily from '@styles/utils/fontFamily';
import variables from '@styles/variables';
import ChildrenProps from '@src/types/utils/ChildrenProps';

type TextProps = RNTextProps &
    ChildrenProps & {
        /** The color of the text */
        color?: string;

        /** The size of the text */
        fontSize?: number;

        /** The alignment of the text */
        textAlign?: TextStyle['textAlign'];

        /** Any children to display */
        children: React.ReactNode;

        /** The family of the font to use */
        family?: keyof typeof fontFamily;
    };

function Text({color, fontSize = variables.fontSizeNormal, textAlign = 'left', children, family = 'EXP_NEUE', style = {}, ...props}: TextProps, ref: ForwardedRef<RNText>) {
    const theme = useTheme();

    const componentStyle: TextStyle = {
        color: color ?? theme.text,
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
export type {TextProps};
