/**
 * TextLinkBlock component splits a given text into individual words and displays
 * each word within a TextLink component so the link text wraps naturally.
 */
import React, {memo, useMemo} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import Text from './Text';
import TextLink from './TextLink';
import type {LinkProps, PressProps} from './TextLink';

type TextLinkBlockProps = (LinkProps | PressProps) & {
    /** Styles to apply to each word */
    style?: StyleProp<TextStyle>;

    /** The full text to be split into words */
    text: string;

    /** The full text to be split into words */
    prefixIcon?: React.JSX.Element;
};

function TextLinkBlock({text, style, prefixIcon, ...rest}: TextLinkBlockProps) {
    const words = useMemo(() => text.match(/(\S+\s*)/g) ?? [], [text]);
    const styles = useThemeStyles();

    return (
        <>
            {words.map((word, index) => (
                <View
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${word}-${index}`}
                    style={[styles.dInlineFlex, styles.alignItemsCenter, styles.flexRow]}
                >
                    {prefixIcon && index === 0 && prefixIcon}
                    {!!prefixIcon && index === 0 && <Text> </Text>}
                    <TextLink
                        style={style}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...rest}
                    >
                        {word}
                    </TextLink>
                </View>
            ))}
        </>
    );
}

TextLinkBlock.displayName = 'TextLinkBlock';

export default memo(TextLinkBlock);
