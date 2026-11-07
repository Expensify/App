import TextLink from '@components/TextLink';

import type {FooterLink} from '@pages/signin/SignInPageLayout/types';

import type {StyleProp, TextStyle} from 'react-native';

import React from 'react';

type FooterRowProps = FooterLink & {
    text: string;
    style: StyleProp<TextStyle>;
};

function FooterRow({href, onPress, sentryLabel, text, style}: FooterRowProps) {
    // TextLink isn't a pressable on web, so sentryLabelExact makes Sentry report every click on the link with just the label.
    const dataSet = {sentryLabel, sentryLabelExact: true};

    if (onPress) {
        return (
            <TextLink
                style={style}
                dataSet={dataSet}
                onPress={onPress}
            >
                {text}
            </TextLink>
        );
    }

    return (
        <TextLink
            style={style}
            dataSet={dataSet}
            href={href}
            tabIndex={0}
        >
            {text}
        </TextLink>
    );
}

export default FooterRow;
