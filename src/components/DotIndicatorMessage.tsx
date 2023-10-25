import React from 'react';
import {StyleProp, TextStyle, View, ViewStyle} from 'react-native';
import styles from '../styles/styles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import themeColors from '../styles/themes/default';
import Text from './Text';
import * as Localize from '../libs/Localize';

type DotIndicatorMessageProps = {
    messages: Record<string, string>;
    type: 'error' | 'success';
    style?: StyleProp<ViewStyle>;
    textStyles?: StyleProp<TextStyle>;
};

function DotIndicatorMessage({messages = {}, style, type, textStyles}: DotIndicatorMessageProps) {
    if (Object.keys(messages).length === 0) {
        return null;
    }

    // Fetch the keys, sort them, and map through each key to get the corresponding message
    const sortedMessages: string[] = Object.keys(messages)
        .sort()
        .map((key) => messages[key]);

    // Removing duplicates using Set and transforming the result into an array
    const uniqueMessages: string[] = [...new Set(sortedMessages)].map((message) => Localize.translateIfPhraseKey(message));

    return (
        <View style={[styles.dotIndicatorMessage, style]}>
            <View style={styles.offlineFeedback.errorDot}>
                <Icon
                    src={Expensicons.DotIndicator}
                    fill={type === 'error' ? themeColors.danger : themeColors.success}
                />
            </View>
            <View style={styles.offlineFeedback.textContainer}>
                {uniqueMessages.map((message) => (
                    <Text
                        key={message}
                        style={[styles.offlineFeedback.text, textStyles]}
                    >
                        {message}
                    </Text>
                ))}
            </View>
        </View>
    );
}

DotIndicatorMessage.displayName = 'DotIndicatorMessage';

export default DotIndicatorMessage;
