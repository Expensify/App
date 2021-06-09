import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    Text, View, Pressable, ActivityIndicator,
} from 'react-native';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import {rejectTransaction} from '../libs/actions/IOU';
import ReportActionPropTypes from '../pages/home/report/ReportActionPropTypes';
import ReportActionItemSingle from '../pages/home/report/ReportActionItemSingle';
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

    /* eslint-disable-next-line react/no-unused-prop-types */
    rejectInProgress: PropTypes.arrayOf(PropTypes.string),
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

    isRejected(rejectedIDs, transactionID) {
        if (!rejectedIDs) {
            return false;
        }
        return rejectedIDs.includes(transactionID.toString());
    }

    render() {
        const rejectedIDs = lodashGet(this.props, 'rejectInProgress', []);
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
                            ]}
                            onPress={this.rejectTransaction}
                        >
                            {
                            this.isRejected(rejectedIDs, this.props.action.originalMessage.IOUTransactionID)
                                ? <ActivityIndicator color={themeColors.text} />
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
    withOnyx({
        rejectInProgress: {
            key: ONYXKEYS.REJECT_IN_PROGRESS,
        },
    }),
)(ReportTransaction);
