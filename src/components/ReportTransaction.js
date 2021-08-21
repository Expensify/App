import React, {Component} from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {
    View, Pressable, ActivityIndicator,
} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import {rejectTransaction} from '../libs/actions/IOU';
import ReportActionPropTypes from '../pages/home/report/ReportActionPropTypes';
import ReportActionItemSingle from '../pages/home/report/ReportActionItemSingle';
import Text from './Text';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';

const propTypes = {
    /** The chatReport which the transaction is associated with */
    /* eslint-disable-next-line react/no-unused-prop-types */
    chatReportID: PropTypes.number.isRequired,

    /** ID for the IOU report */
    /* eslint-disable-next-line react/no-unused-prop-types */
    iouReportID: PropTypes.number.isRequired,

    /** The report action which we are displaying */
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    /** Can this transaction be rejected? */
    canBeRejected: PropTypes.bool,

    /** Text label for the reject transaction button */
    rejectButtonLabelText: PropTypes.string.isRequired,

    /** Manager name */
    managerName: PropTypes.string.isRequired,

    /** Owner name */
    ownerName: PropTypes.string.isRequired,

    /** Current user email */
    sessionEmail: PropTypes.string.isRequired,

    /* Onyx Props */

    /** List of transactionIDs in process of rejection */
    /* eslint-disable-next-line react/no-unused-prop-types, react/require-default-props */
    transactionsBeingRejected: PropTypes.shape({
        /** IOUTransactionID that's being rejected */
        transactionID: PropTypes.bool,
    }),

    /* Localization props */
    ...withLocalizePropTypes,
};

const defaultProps = {
    canBeRejected: false,
};

class ReportTransaction extends Component {
    constructor(props) {
        super(props);

        this.rejectTransaction = this.rejectTransaction.bind(this);
    }

    rejectTransaction() {
        rejectTransaction({
            reportID: this.props.iouReportID,
            chatReportID: this.props.chatReportID,
            transactionID: this.props.action.originalMessage.IOUTransactionID,
            comment: '',
        });
    }

    /**
     * Checks if current IOUTransactionID is being rejected.
     * @returns {boolean} Returns `true` if current IOUtransactionID is being rejected, else `false`.
     */
    isBeingRejected() {
        const IOUTransactionID = lodashGet(this.props.action, 'originalMessage.IOUTransactionID', '');
        const transactionsBeingRejected = lodashGet(this.props, 'transactionsBeingRejected', {});
        if (_.isEmpty(transactionsBeingRejected)) {
            return false;
        }
        return _.has(transactionsBeingRejected, IOUTransactionID);
    }

    render() {
        const {
            sessionEmail, action, managerName, ownerName,
        } = this.props;
        const {
            type: messageType, amount, currency, comment,
        } = action.originalMessage;
        const messageText = this.props.translate(`iou.transactions.${messageType}`, {
            comment,
            amount: this.props.numberFormat(
                Math.abs(amount) / 100,
                {style: 'currency', currency},
            ),
            participant: sessionEmail === action.actorEmail ? managerName : ownerName,
        });

        return (
            <View styles={[styles.mb5]}>
                <ReportActionItemSingle
                    action={this.props.action}
                    wrapperStyles={[styles.reportTransactionWrapper]}
                >
                    <Text style={[styles.chatItemMessage]}>
                        {messageText}
                        {'\n'}
                        {this.props.action.message[0].text}
                    </Text>
                </ReportActionItemSingle>
                {this.props.canBeRejected && (
                    <View style={[styles.flexRow, styles.justifyContentStart]}>
                        <Pressable
                            style={[
                                styles.buttonSmall,
                                styles.chatItemComposeSecondaryRowOffset,
                                styles.mb3,
                                this.isBeingRejected() ? styles.w20 : styles.wAuto,
                            ]}
                            onPress={this.rejectTransaction}
                        >
                            {
                            this.isBeingRejected()
                                ? (
                                    <ActivityIndicator
                                        color={themeColors.text}
                                        style={[styles.flex1]}
                                    />
                                )
                                : (
                                    <Text style={[styles.buttonSmallText]}>
                                        {this.props.rejectButtonLabelText}
                                    </Text>
                                )
                            }
                        </Pressable>
                    </View>
                )}
            </View>
        );
    }
}

ReportTransaction.displayName = 'ReportTransaction';
ReportTransaction.defaultProps = defaultProps;
ReportTransaction.propTypes = propTypes;
export default compose(
    withLocalize,
    withOnyx({
        transactionsBeingRejected: {
            key: ONYXKEYS.TRANSACTIONS_BEING_REJECTED,
        },
    }),
)(ReportTransaction);
