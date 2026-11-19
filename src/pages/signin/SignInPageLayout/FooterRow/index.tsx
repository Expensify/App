import TextLink from '@components/TextLink';

import type {FooterLink} from '@pages/signin/SignInPageLayout/types';

import type {StyleProp, TextStyle} from 'react-native';

import React from 'react';

type FooterRowProps = FooterLink & {
    text: string;
    style: StyleProp<TextStyle>;
};

function FooterRow({href, onPress, sentryLabel, text, style}: FooterRowProps) {
    if (onPress) {
        return (
            <TextLink
                style={style}
                sentryLabel={sentryLabel}
                onPress={onPress}
            >
                {text}
            </TextLink>
        );
    }

    return (
        <TextLink
            style={style}
            sentryLabel={sentryLabel}
            href={href}
            tabIndex={0}
        >
            {text}
        </TextLink>
    );
}

export default FooterRow;
