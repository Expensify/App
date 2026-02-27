import type {ForwardedRef} from 'react';
import React, {useContext, useMemo} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Text as RNText, StyleSheet} from 'react-native';
import type {TextProps as RNTextProps, TextStyle} from 'react-native';
import useTheme from '@hooks/useTheme';
import {containsOnlyCustomEmoji} from '@libs/EmojiUtils';
import type {FontUtilsType} from '@styles/utils/FontUtils';
import FontUtils from '@styles/utils/FontUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
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

        /** Should apply default line height */
        shouldUseDefaultLineHeight?: boolean;

        /** Reference to the outer element */
        ref?: ForwardedRef<RNText>;
    };

function Text({color, fontSize = variables.fontSizeNormal, textAlign = 'left', children, family = 'EXP_NEUE', style = {}, shouldUseDefaultLineHeight = true, ref, ...props}: TextProps) {
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

    if (!componentStyle.lineHeight && componentStyle.fontSize === variables.fontSizeNormal && shouldUseDefaultLineHeight) {
        componentStyle.lineHeight = variables.fontSizeNormalHeight;
    }

    const isOnlyCustomEmoji = useMemo(() => {
        if (typeof children === 'string') {
            return containsOnlyCustomEmoji(children.replace(CONST.UNICODE.LTR, ''));
        }
        if (Array.isArray(children)) {
            return children.every((child) => {
                return child === null || child === undefined || (typeof child === 'string' && containsOnlyCustomEmoji(child));
            });
        }
        return false;
    }, [children]);

    if (isOnlyCustomEmoji) {
        componentStyle.fontFamily = FontUtils.fontFamily.single.CUSTOM_EMOJI_FONT?.fontFamily;
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

export default Text;
export type {TextProps};
