import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import fileDownload from '@libs/fileDownload';
import * as Localize from '@libs/Localize';
import stylePropTypes from '@styles/stylePropTypes';
import styles from '@styles/styles';
import * as StyleUtils from '@styles/StyleUtils';
import themeColors from '@styles/themes/default';
import CONST from '@src/CONST';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import Text from './Text';

const propTypes = {
    /**
     * In most cases this should just be errors from onxyData
     * if you are not passing that data then this needs to be in a similar shape like
     *  {
     *      timestamp: 'message',
     *  }
     */
    messages: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.oneOfType([PropTypes.string, PropTypes.object]), PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object]))])),

    // The type of message, 'error' shows a red dot, 'success' shows a green dot
    type: PropTypes.oneOf(['error', 'success']).isRequired,

    // Additional styles to apply to the container */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.arrayOf(PropTypes.object),

    // Additional styles to apply to the text
    textStyles: stylePropTypes,
};

const defaultProps = {
    messages: {},
    style: [],
    textStyles: [],
};

/**
 * Check if the error includes a receipt.
 *
 * @param {String} message
 * @returns {Boolean}
 */
const isReceiptError = (message) => {
    if (_.isString(message)) {
        return false;
    }
    return _.get(message, 'error', '') === CONST.IOU.RECEIPT_ERROR;
};

function DotIndicatorMessage(props) {
    if (_.isEmpty(props.messages)) {
        return null;
    }

    // To ensure messages are presented in order we are sort of destroying the data we are given
    // and rebuilding as an array so we can render the messages in order. We don't really care about
    // the microtime timestamps anyways so isn't the end of the world that we sort of lose them here.
    // BEWARE: if you decide to refactor this and keep the microtime keys it could cause performance issues
    const sortedMessages = _.chain(props.messages)
        .keys()
        .sortBy()
        .map((key) => props.messages[key])

        // Using uniq here since some fields are wrapped by the same OfflineWithFeedback component (e.g. WorkspaceReimburseView)
        // and can potentially pass the same error.
        .uniq()
        .map((message) => Localize.translateIfPhraseKey(message))
        .value();

    const isErrorMessage = props.type === 'error';

    return (
        <View style={[styles.dotIndicatorMessage, ...props.style]}>
            <View style={styles.offlineFeedback.errorDot}>
                <Icon
                    src={Expensicons.DotIndicator}
                    fill={isErrorMessage ? themeColors.danger : themeColors.success}
                />
            </View>
            <View style={styles.offlineFeedback.textContainer}>
                {_.map(sortedMessages, (message, i) =>
                    isReceiptError(message) ? (
                        <PressableWithoutFeedback
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
                                <Text style={[styles.optionAlternateText, styles.textLabelSupporting]}>{Localize.translateLocal('iou.error.receiptFailureMessage')}</Text>
                                <Text style={[styles.optionAlternateText, styles.textLabelSupporting, styles.link]}>{Localize.translateLocal('iou.error.saveFileMessage')}</Text>
                                <Text style={[styles.optionAlternateText, styles.textLabelSupporting]}>{Localize.translateLocal('iou.error.loseFileMessage')}</Text>
                            </Text>
                        </PressableWithoutFeedback>
                    ) : (
                        <Text
                            key={i}
                            style={[StyleUtils.getDotIndicatorTextStyles(isErrorMessage), ...props.textStyles]}
                        >
                            {message}
                        </Text>
                    ),
                )}
            </View>
        </View>
    );
}

DotIndicatorMessage.propTypes = propTypes;
DotIndicatorMessage.defaultProps = defaultProps;
DotIndicatorMessage.displayName = 'DotIndicatorMessage';

export default DotIndicatorMessage;
