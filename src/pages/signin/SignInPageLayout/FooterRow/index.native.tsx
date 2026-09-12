import {PressableWithoutFeedback} from '@components/Pressable';
import Text from '@components/Text';

import useEnvironment from '@hooks/useEnvironment';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import type {FooterColumnRow} from '@pages/signin/SignInPageLayout/types';

import {openLink as openLinkUtil} from '@userActions/Link';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {GestureResponderEvent, StyleProp, TextStyle} from 'react-native';

import React from 'react';

type FooterRowProps = FooterColumnRow & {
    text: string;
    style: StyleProp<TextStyle>;
};

function FooterRow({href, onPress, translationPath, text, style}: FooterRowProps) {
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();
    const [session] = useOnyx(ONYXKEYS.SESSION);

    return (
        <PressableWithoutFeedback
            accessible
            accessibilityRole={CONST.ROLE.LINK}
            accessibilityLabel={text}
            sentryLabel={translationPath}
            onPress={() => {
                if (onPress) {
                    onPress({} as GestureResponderEvent);
                    return;
                }
                if (href) {
                    openLinkUtil(href, environmentURL, false, session);
                }
            }}
        >
            <Text
                accessible={false}
                suppressHighlighting
                style={[styles.link, style]}
            >
                {text}
            </Text>
        </PressableWithoutFeedback>
    );
}

export default FooterRow;
