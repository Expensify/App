import type {ForwardedRef} from 'react';
import React, {useContext} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Text as RNText, StyleSheet} from 'react-native';
import type {TextProps as RNTextProps, TextStyle} from 'react-native';
import useTheme from '@hooks/useTheme';
import type {FontUtilsType} from '@styles/utils/FontUtils';
import FontUtils from '@styles/utils/FontUtils';
import variables from '@styles/variables';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {CustomStylesForChildrenContext} from './CustomStylesForChildrenProvider';

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
        family?: keyof FontUtilsType['fontFamily']['platform'];
    };

function Text({color, fontSize = variables.fontSizeNormal, textAlign = 'left', children, family = 'EXP_NEUE', style = {}, ...props}: TextProps, ref: ForwardedRef<RNText>) {
    const theme = useTheme();
    const customStyle = useContext(CustomStylesForChildrenContext);

    const componentStyle: TextStyle = {
        color: color ?? theme.text,
        fontSize,
        textAlign,
        ...FontUtils.fontFamily.platform[family],
        ...StyleSheet.flatten(style),
        ...StyleSheet.flatten(customStyle),
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
