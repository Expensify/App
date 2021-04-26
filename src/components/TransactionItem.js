import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View, Text, Pressable} from 'react-native-web';
import ReportActionPropTypes from '../pages/home/report/ReportActionPropTypes';
import ReportActionItemIOUAction from './ReportActionItemIOUAction';
import styles from '../styles/styles';
import {rejectTransaction} from '../libs/actions/IOU';

const propTypes = {
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // Transaction to display
    transaction: PropTypes.shape({

        // The transaction currency
        currency: PropTypes.string,

        // The transaction comment
        comment: PropTypes.string,

        // The transaction amount
        amount: PropTypes.number,

        // Was this transaction created by the current user
        createdByUser: PropTypes.bool,
    }).isRequired,
};

class TransactionItem extends Component {
    constructor(props) {
        super(props);

        this.removeTransaction = this.removeTransaction.bind(this);
    }

    removeTransaction() {
        // TODO: delegate to parent
        console.debug('removeTransaction');
        rejectTransaction({
            reportID: 999,
            transactionID: 999999,
            comment: 'NO!',
        });
    }

    render() {
        return (
            <View styles={[styles.mb5]}>
                <ReportActionItemIOUAction
                    action={this.props.action}
                    shouldDisplayPreviewComp={false}
                />
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

TransactionItem.displayName = 'TransactionItem';
TransactionItem.propTypes = propTypes;
export default TransactionItem;
