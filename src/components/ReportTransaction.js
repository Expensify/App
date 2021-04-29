import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {View, Text, Pressable} from 'react-native-web';
import _ from 'underscore';
import styles from '../styles/styles';
import ONYXKEYS from '../ONYXKEYS';
import {rejectTransaction} from '../libs/actions/IOU';
import personalDetailsPropType from '../pages/personalDetailsPropType';
import ReportActionPropTypes from '../pages/home/report/ReportActionPropTypes';
import ReportActionItemSingle from '../pages/home/report/ReportActionItemSingle';

const propTypes = {
    // The chatReport which the transaction is associated with
    chatReportID: PropTypes.number,

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

        transactionID: PropTypes.number,

        // Was this transaction created by the current user
        createdByUser: PropTypes.bool,
    }).isRequired,

    // All of the personalDetails
    personalDetails: PropTypes.objectOf(personalDetailsPropType),
};

const defaultProps = {
    personalDetails: {},
};

class ReportTransaction extends Component {
    constructor(props) {
        super(props);

        this.removeTransaction = this.removeTransaction.bind(this);
    }

    removeTransaction() {
        rejectTransaction({
            reportID: this.props.chatReportID,
            transactionID: this.props.transaction.transactionID,
            comment: 'no comment',
        });
    }

    render() {
        console.debug('juless: ', this.props.action.message);
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
                <Pressable
                    style={[styles.button, styles.alignItemsStart, styles.mb3]}
                    onPress={() => this.removeTransaction()}
                >
                    <Text style={[styles.buttonSmallText]}>
                        {this.props.transaction.createdByUser ? 'Cancel' : 'Decline'}
                    </Text>
                </Pressable>
            </View>
        );
    }
}

ReportTransaction.displayName = 'ReportTransaction';
ReportTransaction.defaultProps = defaultProps;
ReportTransaction.propTypes = propTypes;
export default withOnyx({
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS,
    },
})(ReportTransaction);