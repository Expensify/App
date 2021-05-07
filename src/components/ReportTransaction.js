import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View, Text, Pressable} from 'react-native-web';
import styles from '../styles/styles';
import {rejectTransaction} from '../libs/actions/IOU';
import ReportActionPropTypes from '../pages/home/report/ReportActionPropTypes';
import ReportActionItemSingle from '../pages/home/report/ReportActionItemSingle';

const propTypes = {
    // The chatReport which the transaction is associated with
    chatReportID: PropTypes.number.isRequired,

    // ID for the IOU report
    iouReportID: PropTypes.number.isRequired,

    // The report action which we are displaying
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // Transaction to display
    transaction: PropTypes.shape({

        // The transaction currency
        currency: PropTypes.string,

        // The transaction comment
        comment: PropTypes.string,

        // The transaction amount
        amount: PropTypes.number,

        // The transaction ID
        transactionID: PropTypes.number,

        // Was this transaction created by the current user
        createdByUser: PropTypes.bool,
    }).isRequired,

    // Can this transaction be rejected?
    canReject: PropTypes.bool.isRequired,
};

class ReportTransaction extends Component {
    constructor(props) {
        super(props);

        this.removeTransaction = this.removeTransaction.bind(this);
    }

    removeTransaction() {
        rejectTransaction({
            reportID: this.props.iouReportID,
            chatReportID: this.props.chatReportID,
            transactionID: this.props.transaction.transactionID,
            comment: 'no comment',
        });
    }

    render() {
        return (
            <View styles={[styles.mb5]}>
                <ReportActionItemSingle
                    action={this.props.action}
                    outerViewStyles={[styles.reportTransaction]}
                >
                    <Text style={[styles.chatItemMessage]}>
                        {this.props.action.message[0].text}
                    </Text>
                </ReportActionItemSingle>
                {/* this.props.canReject && ( // TODO: reject transaction will be implemented by the followup issue */}
                {false && (
                    <Pressable
                        style={[styles.button, styles.alignItemsStart, styles.mb3]}
                        onPress={() => this.removeTransaction()}
                    >
                        <Text style={[styles.buttonSmallText]}>
                            {this.props.transaction.createdByUser ? 'Cancel' : 'Decline'}
                        </Text>
                    </Pressable>
                )}
            </View>
        );
    }
}

ReportTransaction.displayName = 'ReportTransaction';
ReportTransaction.propTypes = propTypes;
export default ReportTransaction;
