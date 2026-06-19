import type {KeyboardEvent} from 'react';
import React from 'react';
import type {GestureResponderEvent, StyleProp, TextStyle} from 'react-native';
import Text from '@components/Text';
import TextLink from '@components/TextLink';

type InlineTextWithOptionalLinkProps = {
    message: string;
    linkText?: string;
    onLinkPress?: (event: GestureResponderEvent | KeyboardEvent) => void;
    textStyle?: StyleProp<TextStyle>;
};

function InlineTextWithOptionalLink({message, linkText, onLinkPress, textStyle}: InlineTextWithOptionalLinkProps) {
    return (
        <Text style={textStyle}>
            {message}
            {!!linkText && !!onLinkPress && (
                <>
                    {' '}
                    <TextLink onPress={onLinkPress}>{linkText}</TextLink>
                </>
            )}
        </Text>
    );
}

export default InlineTextWithOptionalLink;
