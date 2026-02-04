import React from 'react';
import type {GestureResponderEvent, StyleProp, TextStyle} from 'react-native';
import Text from '@components/Text';
import {PressableWithoutFeedback} from '@components/Pressable';
import useEnvironment from '@hooks/useEnvironment';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import {openLink as openLinkUtil} from '@userActions/Link';
import type {FooterColumnRow} from './types';

type FooterRowProps = FooterColumnRow & {
    text: string;
    style: StyleProp<TextStyle>;
};

function FooterRow({href, onPress, translationPath, text, style}: FooterRowProps) {
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();

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
