import {Str} from 'expensify-common';
import type {ReactElement} from 'react';
import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {isReceiptError, isTranslationKeyError} from '@libs/ErrorUtils';
import fileDownload from '@libs/fileDownload';
import CONST from '@src/CONST';
import type {TranslationKeyError} from '@src/types/onyx/OnyxCommon';
import type {ReceiptError} from '@src/types/onyx/Transaction';
import Button from './Button';
import Icon from './Icon';
import Text from './Text';

type DotIndicatorMessageProps = {
    /**
     * In most cases this should just be errors from onxyData
     * if you are not passing that data then this needs to be in a similar shape like
     *  {
     *      timestamp: 'message',
     *  }
     */
    messages: Record<string, string | ReceiptError | TranslationKeyError | ReactElement | null>;

    /** The type of message, 'error' shows a red dot, 'success' shows a green dot */
    type: 'error' | 'success';

    /** Additional styles to apply to the container */
    style?: StyleProp<ViewStyle>;

    /** Additional styles to apply to the text */
    textStyles?: StyleProp<TextStyle>;

    /** A function to dismiss error */
    dismissError?: () => void;
};

function DotIndicatorMessage({messages = {}, style, type, textStyles, dismissError = () => {}}: DotIndicatorMessageProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['DotIndicator']);
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth, isInNarrowPaneModal} = useResponsiveLayout();

    if (Object.keys(messages).length === 0) {
        return null;
    }

    // Fetch the keys, sort them, and map through each key to get the corresponding message
    const sortedMessages: Array<string | ReceiptError> = Object.keys(messages)
        .sort()
        .map((key) => messages[key])
        .filter((message): message is string | ReceiptError => message !== null);
    // Removing duplicates using Set and transforming the result into an array
    const uniqueMessages: Array<ReceiptError | string> = [...new Set(sortedMessages)].map((message) => message);

    const isErrorMessage = type === 'error';
    const receiptError = uniqueMessages.find(isReceiptError);

    const isTextSelectable = !canUseTouchScreen() || !shouldUseNarrowLayout;

    const renderMessage = (message: string | ReceiptError | ReactElement, index: number) => {
        if (isReceiptError(message)) {
            return null;
        }

        const displayMessage = isTranslationKeyError(message) ? translate(message.translationKey) : message;
        const formattedMessage = typeof displayMessage === 'string' ? Str.htmlDecode(displayMessage) : displayMessage;

        return (
            <Text
                key={index}
                style={[StyleUtils.getDotIndicatorTextStyles(isErrorMessage), textStyles, isTextSelectable ? styles.userSelectText : styles.userSelectNone]}
                accessibilityRole={isErrorMessage ? CONST.ROLE.ALERT : undefined}
                accessibilityLiveRegion={isErrorMessage ? 'assertive' : undefined}
            >
                {formattedMessage}
            </Text>
        );
    };

    if (receiptError) {
        const isStackedLayout = !(isInNarrowPaneModal && !isSmallScreenWidth);
        const messageRow = (
            <View style={[styles.dotIndicatorMessage, isStackedLayout && styles.alignItemsStart, styles.flex1]}>
                <View style={styles.offlineFeedbackErrorDot}>
                    <Icon
                        src={expensifyIcons.DotIndicator}
                        fill={isErrorMessage ? theme.danger : theme.success}
                    />
                </View>
                <Text
                    style={[StyleUtils.getDotIndicatorTextStyles(isErrorMessage), textStyles, styles.flex1]}
                    accessibilityRole={isErrorMessage ? CONST.ROLE.ALERT : undefined}
                    accessibilityLiveRegion={isErrorMessage ? 'assertive' : undefined}
                >
                    {translate('iou.error.receiptUploadFailedMessage')}
                </Text>
            </View>
        );
        const buttonsRow = (
            <View style={[styles.flexRow, styles.gap3]}>
                <Button
                    small
                    text={translate('iou.error.saveReceipt')}
                    onPress={() => {
                        fileDownload(translate, receiptError.source, receiptError.filename);
                    }}
                />
                <Button
                    small
                    danger
                    text={translate('iou.deleteExpense', {count: 1})}
                    onPress={dismissError}
                />
            </View>
        );
        if (!isStackedLayout) {
            return (
                <View style={[styles.flexRow, styles.gap3, styles.alignItemsCenter, style]}>
                    {messageRow}
                    {buttonsRow}
                </View>
            );
        }
        return (
            <View style={style}>
                {messageRow}
                <View style={styles.mt3}>{buttonsRow}</View>
            </View>
        );
    }

    return (
        <View style={[styles.dotIndicatorMessage, style]}>
            <View
                style={styles.offlineFeedbackErrorDot}
                accessible={isErrorMessage}
                role={isErrorMessage ? CONST.ROLE.IMG : undefined}
                accessibilityLabel={isErrorMessage ? (CONST.ACCESSIBILITY_LABELS.ERROR as string) : undefined}
            >
                <Icon
                    src={expensifyIcons.DotIndicator}
                    fill={isErrorMessage ? theme.danger : theme.success}
                />
            </View>
            <View style={styles.offlineFeedbackTextContainer}>{uniqueMessages.map(renderMessage)}</View>
        </View>
    );
}

export default DotIndicatorMessage;
