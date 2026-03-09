import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import TextLink from '@components/TextLink';
import type {FooterColumnRow} from '@pages/signin/SignInPageLayout/types';

type FooterRowProps = FooterColumnRow & {
    text: string;
    style: StyleProp<TextStyle>;
};

function FooterRow({href, onPress, text, style}: FooterRowProps) {
    if (onPress) {
        return (
            <TextLink
                style={style}
                onPress={onPress}
            >
                {text}
            </TextLink>
        );
    }

    return (
        <TextLink
            style={style}
            href={href}
        >
            {text}
        </TextLink>
    );
}

export default FooterRow;
