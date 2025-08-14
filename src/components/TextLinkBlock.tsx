/**
 * TextLinkBlock component splits a given text into individual words and displays
 * each word within a TextLink component so the link text wraps naturally.
 */
import React, {memo, useMemo} from 'react';
import type {MouseEventHandler} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import Text from './Text';
import TextLink from './TextLink';
import type {LinkProps, PressProps} from './TextLink';

type TextLinkBlockProps = (LinkProps | PressProps) & {
    /** Styles to apply to each word */
    style?: StyleProp<TextStyle>;

    /** Callback that is called when mousedown is triggered */
    onMouseDown?: MouseEventHandler;

    /** The full text to be split into words */
    text: string;

    /** The full text to be split into words */
    prefixIcon?: React.JSX.Element;
};

function TextLinkBlock({text, style, onMouseDown, prefixIcon, ...rest}: TextLinkBlockProps) {
    const words = useMemo(() => text.match(/(\S+\s*)/g) ?? [], [text]);
    const styles = useThemeStyles();

    if ('href' in rest) {
        const {href} = rest as LinkProps;
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
                            onMouseDown={onMouseDown}
                            href={href}
                        >
                            {word}
                        </TextLink>
                    </View>
                ))}
            </>
        );
    }

    const {onPress} = rest as PressProps;
    return (
        <>
            {words.map((word, index) => (
                <View
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${word}-${index}`}
                    style={[styles.dInlineFlex, styles.alignItemsCenter, styles.flexRow]}
                >
                    {prefixIcon && index === 0 && prefixIcon}
                    <TextLink
                        style={style}
                        onMouseDown={onMouseDown}
                        onPress={onPress}
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
