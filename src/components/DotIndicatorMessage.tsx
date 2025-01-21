/* eslint-disable react/no-array-index-key */
import React, {useState} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isReceiptError} from '@libs/ErrorUtils';
import fileDownload from '@libs/fileDownload';
import {translateLocal} from '@libs/Localize';
import handleRetryPress from '@libs/ReceiptUploadRetryHandler/index';
import CONST from '@src/CONST';
import type {ReceiptError} from '@src/types/onyx/Transaction';
import ConfirmModal from './ConfirmModal';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';
import TextLink from './TextLink';

type DotIndicatorMessageProps = {
    /**
     * In most cases this should just be errors from onxyData
     * if you are not passing that data then this needs to be in a similar shape like
     *  {
     *      timestamp: 'message',
     *  }
     */
    messages: Record<string, string | ReceiptError | null>;

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

    const renderMessage = (message: string | ReceiptError, index: number) => {
        if (isReceiptError(message)) {
            return (
                <>
                    <Text
                        key={index}
                        style={styles.offlineFeedback.text}
                    >
                        <Text style={[StyleUtils.getDotIndicatorTextStyles(isErrorMessage)]}>{translateLocal('iou.error.receiptFailureMessage')}</Text>
                        <TextLink
                            style={[StyleUtils.getDotIndicatorTextStyles(), styles.link]}
                            onPress={() => handleRetryPress(message, dismissError, setShouldShowErrorModal)}
                        >
                            {translateLocal('iou.error.tryAgainMessage')}
                        </TextLink>
                        <Text style={[StyleUtils.getDotIndicatorTextStyles(isErrorMessage)]}>{translateLocal('common.or')}</Text>
                        <TextLink
                            style={[StyleUtils.getDotIndicatorTextStyles(), styles.link]}
                            onPress={() => {
                                fileDownload(message.source, message.filename).finally(() => dismissError());
                            }}
                        >
                            {translateLocal('iou.error.saveFileMessage')}
                        </TextLink>

                        <Text style={[StyleUtils.getDotIndicatorTextStyles(isErrorMessage)]}>{translateLocal('iou.error.uploadLaterMessage')}</Text>
                    </Text>

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

        if (message === CONST.COMPANY_CARDS.CONNECTION_ERROR) {
            return (
                <Text
                    key={index}
                    style={styles.offlineFeedback.text}
                >
                    <Text style={[StyleUtils.getDotIndicatorTextStyles(isErrorMessage)]}>{translateLocal('workspace.companyCards.brokenConnectionErrorFirstPart')}</Text>
                    <TextLink
                        style={[StyleUtils.getDotIndicatorTextStyles(), styles.link]}
                        onPress={() => {
                            // TODO: re-navigate the user to the bank’s website to re-authenticate https://github.com/Expensify/App/issues/50448
                        }}
                    >
                        {translateLocal('workspace.companyCards.brokenConnectionErrorLink')}
                    </TextLink>

                    <Text style={[StyleUtils.getDotIndicatorTextStyles(isErrorMessage)]}>{translateLocal('workspace.companyCards.brokenConnectionErrorSecondPart')}</Text>
                </Text>
            );
        }

        return (
            <Text
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                style={[StyleUtils.getDotIndicatorTextStyles(isErrorMessage), textStyles]}
            >
                {message}
            </Text>
        );
    };

    return (
        <View style={[styles.dotIndicatorMessage, style]}>
            <View style={styles.offlineFeedback.errorDot}>
                <Icon
                    src={Expensicons.DotIndicator}
                    fill={isErrorMessage ? theme.danger : theme.success}
                />
            </View>
            <View style={styles.offlineFeedback.textContainer}>{uniqueMessages.map(renderMessage)}</View>
        </View>
    );
}

DotIndicatorMessage.displayName = 'DotIndicatorMessage';

export default DotIndicatorMessage;
