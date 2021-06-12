import React, {Component} from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {
    Text, View, Pressable, ActivityIndicator,
} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import {rejectTransaction} from '../libs/actions/IOU';
import ReportActionPropTypes from '../pages/home/report/ReportActionPropTypes';
import ReportActionItemSingle from '../pages/home/report/ReportActionItemSingle';

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

    /* Onyx Props */

    /** List of transactionIDs in process of rejection */
    /* eslint-disable-next-line react/no-unused-prop-types, react/require-default-props */
    iou: PropTypes.shape({
        transactionsBeingRejected: PropTypes.arrayOf(PropTypes.string),
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
        rejectTransaction({
            reportID: this.props.iouReportID,
            chatReportID: this.props.chatReportID,
            transactionID: this.props.action.originalMessage.IOUTransactionID,
            comment: '',
            iou: this.props.iou,
        });
    }

    isRejected() {
        const IOUTransactionID = lodashGet(this.props.action, 'originalMessage.IOUTransactionID', '');
        const transactionsBeingRejected = lodashGet(this.props, 'iou.transactionsBeingRejected', []);
        if (!transactionsBeingRejected || !transactionsBeingRejected.length) {
            return false;
        }
        return transactionsBeingRejected.includes(IOUTransactionID.toString());
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
                        <Pressable
                            style={[
                                styles.buttonSmall,
                                styles.chatItemComposeSecondaryRowOffset,
                                styles.mb3,
                                styles.rejectIOU,
                            ]}
                            onPress={this.rejectTransaction}
                        >
                            {
                            this.isRejected()
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
export default withOnyx({
    iou: {
        key: ONYXKEYS.IOU,
    },
})(ReportTransaction);
