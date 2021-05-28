import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Text, View, Pressable} from 'react-native';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import styles from '../styles/styles';
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
    isRejectable: PropTypes.bool,

    /** Is the authenticated user the creator of this transaction? */
    isCurrentUserTransactionCreator: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    isRejectable: false,
    isCurrentUserTransactionCreator: false,
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
                {this.props.isRejectable && (
                    <View style={[styles.reportTransactionCancel]}>
                        <Pressable
                            style={[
                                styles.buttonSmall,
                                styles.chatItemComposeSecondaryRowOffset,
                                styles.mb3,
                            ]}
                            onPress={() => this.rejectTransaction()}
                        >
                            <Text style={[styles.buttonSmallText]}>
                                {this.props.isCurrentUserTransactionCreator
                                    ? this.props.translate('common.cancel')
                                    : this.props.translate('iou.decline')}
                            </Text>
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
export default withLocalize(ReportTransaction);
