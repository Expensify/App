/**
 * TextLinkBlock component splits a given text into individual words and displays
 * each word within a TextLink component so the link text wraps naturally.
 */
import React, {memo, useMemo} from 'react';
import type {MouseEventHandler} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import TextLink from './TextLink';
import type {LinkProps, PressProps} from './TextLink';

type TextLinkBlockProps = (LinkProps | PressProps) & {
    /** Styles to apply to each word */
    style?: StyleProp<TextStyle>;

    /** Callback that is called when mousedown is triggered */
    onMouseDown?: MouseEventHandler;

    /** The full text to be split into words */
    text: string;
};

function TextLinkBlock({text, style, onMouseDown, ...rest}: TextLinkBlockProps) {
    const words = useMemo(() => text.match(/(\S+\s*)/g) ?? [], [text]);

    if ('href' in rest) {
        const {href} = rest as LinkProps;
        return (
            <>
                {words.map((word, index) => (
                    <TextLink
                        // eslint-disable-next-line react/no-array-index-key
                        key={`${word}-${index}`}
                        style={style}
                        onMouseDown={onMouseDown}
                        href={href}
                    >
                        {word}
                    </TextLink>
                ))}
            </>
        );
    }

    const {onPress} = rest as PressProps;
    return (
        <>
            {words.map((word, index) => (
                <TextLink
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${word}-${index}`}
                    style={style}
                    onMouseDown={onMouseDown}
                    onPress={onPress}
                >
                    {word}
                </TextLink>
            ))}
        </>
    );
}

TextLinkBlock.displayName = 'TextLinkBlock';

export default memo(TextLinkBlock);
