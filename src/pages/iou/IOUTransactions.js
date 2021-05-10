import React, {PureComponent} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import ReportActionPropTypes from '../home/report/ReportActionPropTypes';
import IOUTansactionPropTypes from './IOUTansactionPropTypes';
import ReportTransaction from '../../components/ReportTransaction';

const propTypes = {
    reportActions: PropTypes.arrayOf(PropTypes.shape(ReportActionPropTypes)), // should this be array/object?

    // ReportID for the associated chat report
    chatReportID: PropTypes.number.isRequired,

    // ReportID for the associated IOU report
    iouReportID: PropTypes.number.isRequired,

    // Transactions for this IOU report
    transactions: PropTypes.arrayOf(PropTypes.shape(IOUTansactionPropTypes)),
};

const defaultProps = {
    reportActions: {},
    transactions: [],
};

class IOUTransactions extends PureComponent {
    render() {
        return (
            <View style={[styles.mt3]}>
                {_.map(this.props.transactions, (transaction) => {
                    const actionForTransaction = _.find(this.props.reportActions, (action) => {
                        if (action && action.originalMessage) {
                            return action.originalMessage.IOUTransactionID === transaction.transactionID;
                        }
                        return false;
                    });
                    return (
                        <ReportTransaction
                            chatReportID={this.props.chatReportID}
                            iouReportID={this.props.iouReportID}
                            action={actionForTransaction}
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
