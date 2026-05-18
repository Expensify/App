import {CONST as COMMON_CONST} from 'expensify-common';
import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import Text from './Text';
import TextLink from './TextLink';

type AutoEmailLinkProps = {
    text: string;
    style?: StyleProp<TextStyle>;
};

/*
 * This is a "utility component", that does this:
 *     - Checks if a text contains any email. If it does, render it as a mailto: link
 *     - Else just render it inside `Text` component
 */

function AutoEmailLink({text, style}: AutoEmailLinkProps) {
    const styles = useThemeStyles();
    const emailRegex = COMMON_CONST.REG_EXP.EXTRACT_EMAIL;
    const matches = [...text.matchAll(emailRegex)];

    if (matches.length === 0) {
        return <Text style={style}>{text}</Text>;
    }

    let lastIndex = 0;

    return (
        <Text style={style}>
            {matches.flatMap((match, index) => {
                const email = match[0];
                const startIndex = match.index ?? 0;
                const elements = [];

                // Push plain text before email
                if (startIndex > lastIndex) {
                    elements.push(text.slice(lastIndex, startIndex));
                }

                // Push email as a link
                elements.push(
                    <TextLink
                        // eslint-disable-next-line react/no-array-index-key
                        key={`email-${index}`}
                        href={`mailto:${email}`}
                        style={styles.emailLink}
                    >
                        {email}
                    </TextLink>,
                );

                lastIndex = startIndex + email.length;
                return elements;
            })}
            {lastIndex < text.length && text.slice(lastIndex)}
        </Text>
    );
}

export default AutoEmailLink;
