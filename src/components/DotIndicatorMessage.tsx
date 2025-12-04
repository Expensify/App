/* eslint-disable react/no-array-index-key */
import {Str} from 'expensify-common';
import type {ReactElement} from 'react';
import React, {useState} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isReceiptError, isTranslationKeyError} from '@libs/ErrorUtils';
import fileDownload from '@libs/fileDownload';
import handleRetryPress from '@libs/ReceiptUploadRetryHandler';
import type {TranslationKeyError} from '@src/types/onyx/OnyxCommon';
import type {ReceiptError} from '@src/types/onyx/Transaction';
import ConfirmModal from './ConfirmModal';
import Icon from './Icon';
import RenderHTML from './RenderHTML';
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
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['DotIndicator'] as const);

    const [shouldShowErrorModal, setShouldShowErrorModal] = useState(false);

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

    const handleLinkPress = (href: string) => {
        if (!receiptError) {
            return;
        }

        if (href.endsWith('retry')) {
            handleRetryPress(receiptError, dismissError, setShouldShowErrorModal);
        } else if (href.endsWith('download')) {
            fileDownload(receiptError.source, receiptError.filename).finally(() => dismissError());
        }
    };

    const renderMessage = (message: string | ReceiptError | ReactElement, index: number) => {
        if (isReceiptError(message)) {
            return (
                <>
                    <View style={[styles.renderHTML, styles.flexRow]}>
                        <RenderHTML
                            html={translate('iou.error.receiptFailureMessage')}
                            onLinkPress={(_evt, href) => handleLinkPress(href)}
                        />
                    </View>

                    <ConfirmModal
                        isVisible={shouldShowErrorModal}
                        onConfirm={() => {
                            setShouldShowErrorModal(false);
                        }}
                        prompt={translate('common.genericErrorMessage')}
                        confirmText={translate('common.ok')}
                        shouldShowCancelButton={false}
                    />
                </>
            );
        }

        const displayMessage = isTranslationKeyError(message) ? translate(message.translationKey) : message;
        const formattedMessage = typeof displayMessage === 'string' ? Str.htmlDecode(displayMessage) : displayMessage;

        return (
            <Text
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                style={[StyleUtils.getDotIndicatorTextStyles(isErrorMessage), textStyles]}
            >
                {formattedMessage}
            </Text>
        );
    };

    return (
        <View style={[styles.dotIndicatorMessage, style]}>
            <View style={styles.offlineFeedbackErrorDot}>
                <Icon
                    src={expensifyIcons.DotIndicator}
                    fill={isErrorMessage ? theme.danger : theme.success}
                />
            </View>
            <View style={styles.offlineFeedbackTextContainer}>{uniqueMessages.map(renderMessage)}</View>
        </View>
    );
}

DotIndicatorMessage.displayName = 'DotIndicatorMessage';

export default DotIndicatorMessage;
