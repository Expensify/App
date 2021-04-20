import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { View, Text, Pressable } from 'react-native-web';
import ReportActionPropTypes from '../pages/home/report/ReportActionPropTypes';
import ReportActionItemIOUPreview from '../components/ReportActionItemIOUPreview';
import styles from '../styles/styles';

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

const defaultProps = {
    iouReport: {
        total: 0,
    },
};

class TransactionItem extends Component {
    constructor(props) {
        super(props);

        this.removeTransaction = this.removeTransaction.bind(this);
    }

    removeTransaction() {
        console.debug('removeTransaction');
    }

    render() {
        return (
            <View styles={[styles.mb5]}>
                <ReportActionItemIOUPreview
                        action={this.props.action}
                        isMostRecentIOUReport={false}// shouldDIsplayPreviewBox
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
};

TransactionItem.displayName = 'TransactionItem';
TransactionItem.propTypes = propTypes;
TransactionItem.defaultProps = defaultProps;
export default TransactionItem;

