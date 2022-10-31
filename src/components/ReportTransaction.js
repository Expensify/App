import React, {Component} from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import * as IOU from '../libs/actions/IOU';
import reportActionPropTypes from '../pages/home/report/reportActionPropTypes';
import ReportActionItemSingle from '../pages/home/report/ReportActionItemSingle';
import Text from './Text';
import Button from './Button';

const propTypes = {
    /** The chatReport which the transaction is associated with */
    /* eslint-disable-next-line react/no-unused-prop-types */
    chatReportID: PropTypes.string.isRequired,

    /** ID for the IOU report */
    /* eslint-disable-next-line react/no-unused-prop-types */
    iouReportID: PropTypes.string.isRequired,

    /** The report action which we are displaying */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** Can this transaction be rejected? */
    canBeRejected: PropTypes.bool,

    /** Text label for the reject transaction button */
    rejectButtonLabelText: PropTypes.string.isRequired,

    /* Onyx Props */

    /** List of transactionIDs in process of rejection */
    /* eslint-disable-next-line react/no-unused-prop-types, react/require-default-props */
    transactionsBeingRejected: PropTypes.shape({
        /** IOUTransactionID that's being rejected */
        transactionID: PropTypes.bool,
    }),
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
        IOU.rejectTransaction({
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
        return (
            <View styles={[styles.mb5]}>
                <ReportActionItemSingle
                    action={this.props.action}
                    wrapperStyles={[styles.reportTransactionWrapper]}
                >
                    <Text style={[styles.chatItemMessage]}>
                        {this.props.action.message[0].text}
                    </Text>
                </ReportActionItemSingle>
                {this.props.canBeRejected && (
                    <View style={[styles.flexRow, styles.justifyContentStart]}>
                        <Button
                            small
                            text={this.props.rejectButtonLabelText}
                            style={[styles.mb3, styles.chatItemComposeSecondaryRowOffset]}
                            onPress={this.rejectTransaction}
                            isLoading={this.isBeingRejected()}
                        />
                    </View>
                )}
            </View>
        );
    }
}

ReportTransaction.defaultProps = defaultProps;
ReportTransaction.propTypes = propTypes;
export default withOnyx({
    transactionsBeingRejected: {
        key: ONYXKEYS.TRANSACTIONS_BEING_REJECTED,
    },
})(ReportTransaction);
