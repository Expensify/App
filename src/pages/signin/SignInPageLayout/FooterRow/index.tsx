import TextLink from '@components/TextLink';

import type {FooterColumnRow} from '@pages/signin/SignInPageLayout/types';

import type {StyleProp, TextStyle} from 'react-native';

import React from 'react';

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
            tabIndex={0}
        >
            {text}
        </TextLink>
    );
}

export default FooterRow;
