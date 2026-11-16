import useTheme from '@hooks/useTheme';

import {isMobileWebKit, isSafari} from '@libs/Browser';
import {containsOnlyCustomEmoji} from '@libs/CustomEmojiUtils';
import StringUtils from '@libs/StringUtils';

import type {TextVariant} from '@styles/typography';
import {textVariants} from '@styles/typography';
import type {FontUtilsType} from '@styles/utils/FontUtils';
import FontUtils from '@styles/utils/FontUtils';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {WithSentryLabelWhenPressable} from '@src/types/utils/SentryLabel';

import type {ComponentRef, ForwardedRef} from 'react';
import type {TextProps as RNTextProps, TextStyle} from 'react-native';

import React, {useContext} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Platform, Text as RNText, StyleSheet} from 'react-native';

import {CustomStylesForChildrenContext} from './CustomStylesForChildrenProvider';

// Pressable text, such as a link, doesn't go through a pressable component, so it takes the label itself.
type TextProps = RNTextProps &
    ChildrenProps &
    WithSentryLabelWhenPressable<'onPress' | 'onLongPress'> & {
        /** The color of the text */
        color?: string;

        /** Semantic type style from src/styles/typography.ts. Sets font family, size, and line height */
        variant?: TextVariant;

        /**
         * The size of the text
         *
         * @deprecated Pass `variant` or a `styles.text*` style instead of a raw size
         */
        fontSize?: number;

        textAlign?: TextStyle['textAlign'];
        children: React.ReactNode;
        family?: keyof FontUtilsType['fontFamily']['platform'];
        shouldUseDefaultLineHeight?: boolean;
        ref?: ForwardedRef<ComponentRef<typeof RNText>>;
    };

function Text({
    color,
    variant,
    fontSize = variables.fontSizeNormal,
    textAlign = 'left',
    children,
    family = 'EXP_NEUE',
    style = {},
    shouldUseDefaultLineHeight = true,
    ref,
    sentryLabel,
    dataSet,
    ...props
}: TextProps) {
    const theme = useTheme();
    const customStyle = useContext(CustomStylesForChildrenContext);

    const componentStyle: TextStyle = {
        color: color ?? theme.text,
        fontSize,
        textAlign,
        ...FontUtils.fontFamily.platform[family],
        ...(variant ? textVariants[variant] : undefined),
        ...StyleSheet.flatten(style),
        ...StyleSheet.flatten(customStyle),
    };

    if (!componentStyle.lineHeight && componentStyle.fontSize === variables.fontSizeNormal && shouldUseDefaultLineHeight) {
        componentStyle.lineHeight = variables.fontSizeNormalHeight;
    }

    const isOnlyCustomEmoji =
        typeof children === 'string'
            ? containsOnlyCustomEmoji(children.replace(CONST.UNICODE.LTR, ''))
            : Array.isArray(children) &&
              children.every((child) => {
                  return child === null || child === undefined || (typeof child === 'string' && containsOnlyCustomEmoji(child));
              });

    if (isOnlyCustomEmoji) {
        componentStyle.fontFamily = FontUtils.fontFamily.single.CUSTOM_EMOJI_FONT?.fontFamily;
    }

    // WebKit (desktop Safari and every iOS browser) shows only the ellipsis for very long single-line texts, so we pass at most MAX_SINGLE_LINE_TEXT_LENGTH characters there.
    const shouldTruncateChildren = (isSafari() || isMobileWebKit()) && props.numberOfLines === 1 && typeof children === 'string';
    const displayedChildren = shouldTruncateChildren ? StringUtils.truncate(children, CONST.MAX_SINGLE_LINE_TEXT_LENGTH) : children;

    return (
        <RNText
            allowFontScaling={false}
            ref={ref}
            style={componentStyle}
            // On Android, TalkBack reads style metadata (e.g. color codes) along with text content.
            // Setting accessibilityLabel explicitly causes TalkBack to read only the label, skipping style info.
            accessibilityLabel={typeof children === 'string' && !!children && Platform.OS === 'android' ? children : undefined}
            // On web, the label becomes `data-sentry-label`. Text isn't a pressable, so it also asks Sentry for the label
            // alone instead of the CSS path to it. On native, Sentry reads the `sentryLabel` prop of this component.
            dataSet={sentryLabel ? {sentryLabel, sentryLabelExact: true, ...dataSet} : dataSet}
            {...props}
        >
            {displayedChildren}
        </RNText>
    );
}

export default Text;
export type {TextProps};
