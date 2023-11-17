import React from 'react';
import {StyleProp, TextStyle, View, ViewStyle} from 'react-native';
import * as Localize from '@libs/Localize';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';

type DotIndicatorMessageProps = {
    /**
     * In most cases this should just be errors from onxyData
     * if you are not passing that data then this needs to be in a similar shape like
     *  {
     *      timestamp: 'message',
     *  }
     */
    messages: Record<string, Localize.MaybePhraseKey>;

    /** The type of message, 'error' shows a red dot, 'success' shows a green dot */
    type: 'error' | 'success';

    /** Additional styles to apply to the container */
    style?: StyleProp<ViewStyle>;

    /** Additional styles to apply to the text */
    textStyles?: StyleProp<TextStyle>;
};

function DotIndicatorMessage({messages = {}, style, type, textStyles}: DotIndicatorMessageProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    if (Object.keys(messages).length === 0) {
        return null;
    }

    // Fetch the keys, sort them, and map through each key to get the corresponding message
    const sortedMessages = Object.keys(messages)
        .sort()
        .map((key) => messages[key]);

    // Removing duplicates using Set and transforming the result into an array
    const uniqueMessages = [...new Set(sortedMessages)].map((message) => Localize.translateIfPhraseKey(message));

    const isErrorMessage = type === 'error';

    return (
        <View style={[styles.dotIndicatorMessage, style]}>
            <View style={styles.offlineFeedback.errorDot}>
                <Icon
                    src={Expensicons.DotIndicator}
                    fill={isErrorMessage ? theme.danger : theme.success}
                />
            </View>
            <View style={styles.offlineFeedback.textContainer}>
                {uniqueMessages.map((message, i) => (
                    <Text
                        // eslint-disable-next-line react/no-array-index-key
                        key={i}
                        style={[StyleUtils.getDotIndicatorTextStyles(isErrorMessage), textStyles]}
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
