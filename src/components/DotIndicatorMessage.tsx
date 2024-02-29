/* eslint-disable react/no-array-index-key */
import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isReceiptError} from '@libs/ErrorUtils';
import fileDownload from '@libs/fileDownload';
import type {MaybePhraseKey} from '@libs/Localize';
import * as Localize from '@libs/Localize';
import CONST from '@src/CONST';
import type {ReceiptError} from '@src/types/onyx/Transaction';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import {PressableWithoutFeedback} from './Pressable';
import Text from './Text';

type DotIndicatorMessageProps = {
    /**
     * In most cases this should just be errors from onxyData
     * if you are not passing that data then this needs to be in a similar shape like
     *  {
     *      timestamp: 'message',
     *  }
     */
    messages: Record<string, Localize.MaybePhraseKey | ReceiptError>;

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
    const StyleUtils = useStyleUtils();

    if (Object.keys(messages).length === 0) {
        return null;
    }

    // Fetch the keys, sort them, and map through each key to get the corresponding message
    const sortedMessages: Array<MaybePhraseKey | ReceiptError> = Object.keys(messages)
        .sort()
        .map((key) => messages[key]);

    // Removing duplicates using Set and transforming the result into an array
    const uniqueMessages: Array<ReceiptError | string> = [...new Set(sortedMessages)].map((message) => (isReceiptError(message) ? message : Localize.translateIfPhraseKey(message)));

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
                {uniqueMessages.map((message, i) =>
                    isReceiptError(message) ? (
                        <PressableWithoutFeedback
                            accessibilityLabel={Localize.translateLocal('iou.error.saveFileMessage')}
                            key={i}
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.LINK}
                            onPress={() => {
                                fileDownload(message.source, message.filename);
                            }}
                        >
                            <Text
                                key={i}
                                style={styles.offlineFeedback.text}
                            >
                                <Text style={[StyleUtils.getDotIndicatorTextStyles(isErrorMessage)]}>{Localize.translateLocal('iou.error.receiptFailureMessage')}</Text>
                                <Text style={[StyleUtils.getDotIndicatorTextStyles(isErrorMessage), styles.link]}>{Localize.translateLocal('iou.error.saveFileMessage')}</Text>
                                <Text style={[StyleUtils.getDotIndicatorTextStyles(isErrorMessage)]}>{Localize.translateLocal('iou.error.loseFileMessage')}</Text>
                            </Text>
                        </PressableWithoutFeedback>
                    ) : (
                        <Text
                            // eslint-disable-next-line react/no-array-index-key
                            key={i}
                            style={[StyleUtils.getDotIndicatorTextStyles(isErrorMessage), textStyles]}
                        >
                            {message}
                        </Text>
                    ),
                )}
            </View>
        </View>
    );
}

DotIndicatorMessage.displayName = 'DotIndicatorMessage';

export default DotIndicatorMessage;
