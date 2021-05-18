import React, {Component} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import ReportActionPropTypes from '../home/report/ReportActionPropTypes';
import iouTransactionPropTypes from './iouTransactionPropTypes';
import ReportTransaction from '../../components/ReportTransaction';

const propTypes = {
    /** Actions from the ChatReport */
    reportActions: PropTypes.shape(ReportActionPropTypes),

    /** ReportID for the associated chat report */
    chatReportID: PropTypes.number.isRequired,

    /** ReportID for the associated IOU report */
    iouReportID: PropTypes.number.isRequired,

    /** Transactions for this IOU report */
    transactions: PropTypes.arrayOf(PropTypes.shape(iouTransactionPropTypes)),
};

const defaultProps = {
    reportActions: {},
    transactions: [],
};

class IOUTransactions extends Component {
    constructor(props) {
        super(props);

        this.getActionForTransaction = this.getActionForTransaction.bind(this);
    }

    /**
     * Given a transaction from an IOU Report, returns the chatReport action with a matching transactionID. Unless
     * something has gone wrong with our storing logic, there should always exist an action for each transaction.
     *
     * @param {Object} transaction
     * @returns {Object} action
     */
    getActionForTransaction(transaction) {
        const matchedAction = _.find(this.props.reportActions, (action) => {
            // iouReport.transaction.transactionID is returned as a String, but the originalMessage value is Number
            if (action && action.originalMessage && action.originalMessage.IOUTransactionID
                && action.originalMessage.IOUTransactionID.toString() === transaction.transactionID) {
                return action;
            }
            return false;
        });
        if (!matchedAction) {
            throw new Error(`Unable to locate a matching report action for transaction ${transaction.transactionID}!`);
        }

        return matchedAction;
    }

    render() {
        return (
            <View style={[styles.mt3]}>
                {/* For each IOU transaction, get the matching report action */}
                {_.map(this.props.transactions, (transaction) => {
                    const action = this.getActionForTransaction(transaction);
                    return (
                        <ReportTransaction
                            chatReportID={this.props.chatReportID}
                            iouReportID={this.props.iouReportID}
                            action={action}
                            key={action.originalMessage.IOUTransactionID}
                        />
                    );
                })}
            </View>
        );
    }
}

IOUTransactions.defaultProps = defaultProps;
IOUTransactions.propTypes = propTypes;
export default withOnyx({
    reportActions: {
        key: ({chatReportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
        canEvict: false,
    },
})(IOUTransactions);
