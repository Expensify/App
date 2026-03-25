import React from 'react';
import type {GestureResponderEvent, StyleProp, TextStyle} from 'react-native';
import {PressableWithoutFeedback} from '@components/Pressable';
import Text from '@components/Text';
import useEnvironment from '@hooks/useEnvironment';
import useThemeStyles from '@hooks/useThemeStyles';
import type {FooterColumnRow} from '@pages/signin/SignInPageLayout/types';
import {openLink as openLinkUtil} from '@userActions/Link';
import CONST from '@src/CONST';

type FooterRowProps = FooterColumnRow & {
    text: string;
    style: StyleProp<TextStyle>;
};

function FooterRow({href, onPress, translationPath, text, style}: FooterRowProps) {
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();

    return (
        /* eslint-disable-next-line react-native-a11y/has-accessibility-hint -- Already present before the lint rule was enabled, needs to be fixed. */
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
                    openLinkUtil(href, environmentURL);
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
