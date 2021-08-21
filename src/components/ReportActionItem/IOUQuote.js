import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import Text from '../Text';
import styles from '../../styles/styles';
import ReportActionPropTypes from '../../pages/home/report/ReportActionPropTypes';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    /** Should the View Details link be displayed? */
    shouldShowViewDetailsLink: PropTypes.bool,

    /** Callback invoked when View Details is pressed */
    onViewDetailsPressed: PropTypes.func,

    /** Current logged in User's name */
    currentUserName: PropTypes.string.isRequired,

    /** Participants' name */
    participantName: PropTypes.string.isRequired,

    /** Current user email */
    sessionEmail: PropTypes.string.isRequired,


    ...withLocalizePropTypes,
};

const defaultProps = {
    shouldShowViewDetailsLink: false,
    onViewDetailsPressed: () => {},
};

const IOUQuote = ({
    action,
    shouldShowViewDetailsLink,
    onViewDetailsPressed,
    translate,
    numberFormat,
    currentUserName,
    participantName,
    sessionEmail,
}) => {
    const {
        type: messageType, amount, currency, comment, paymentType,
    } = action.originalMessage;
    const messageText = translate(`iou.transactions.${messageType}`, {
        comment,
        amount: !_.isNaN(Number(amount)) ? numberFormat(
            Math.abs(amount) / 100,
            {style: 'currency', currency},
        ) : '',
        participant: sessionEmail === action.actorEmail ? participantName : currentUserName,
        paymentType,
    });

    return (
        <View style={[styles.chatItemMessage]}>
            {_.map(action.message, (fragment, index) => (
                <View key={`iouQuote-${action.sequenceNumber}-${index}`}>
                    <View style={[styles.blockquote]}>
                        <Text style={[styles.chatItemMessage]}>
                            {messageText}
                            {'\n'}
                            {fragment.text}
                        </Text>
                        {shouldShowViewDetailsLink && (
                            <Text
                                style={[styles.chatItemMessageLink]}
                                onPress={onViewDetailsPressed}
                            >
                                {translate('iou.viewDetails')}
                            </Text>
                        )}
                    </View>
                </View>
            ))}
        </View>
    );
};

IOUQuote.propTypes = propTypes;
IOUQuote.defaultProps = defaultProps;
IOUQuote.displayName = 'IOUQuote';

export default withLocalize(IOUQuote);
