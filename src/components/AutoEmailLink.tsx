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
    return (
        <Text style={style}>
            {text.split(COMMON_CONST.REG_EXP.EXTRACT_EMAIL).map((str, index) => {
                if (COMMON_CONST.REG_EXP.EMAIL.test(str)) {
                    return (
                        <TextLink
                            // eslint-disable-next-line react/no-array-index-key
                            key={`${index}-${str}`}
                            href={`mailto:${str}`}
                            style={styles.link}
                        >
                            {str}
                        </TextLink>
                    );
                }

                return (
                    <Text
                        style={style}
                        // eslint-disable-next-line react/no-array-index-key
                        key={`${index}-${str}`}
                    >
                        {str}
                    </Text>
                );
            })}
        </Text>
    );
}

AutoEmailLink.displayName = 'AutoEmailLink';

export default AutoEmailLink;
