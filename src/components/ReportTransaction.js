import React, {Component} from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {View} from 'react-native';
import _ from 'underscore';
import styles from '../styles/styles';
import * as IOU from '../libs/actions/IOU';
import reportActionPropTypes from '../pages/home/report/reportActionPropTypes';
import ReportActionItemSingle from '../pages/home/report/ReportActionItemSingle';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import Text from './Text';
import Button from './Button';

const propTypes = {
    /** The chatReport which the transaction is associated with */
    /* eslint-disable-next-line react/no-unused-prop-types */
    chatReportID: PropTypes.number.isRequired,

    /** ID for the IOU report */
    /* eslint-disable-next-line react/no-unused-prop-types */
    iouReportID: PropTypes.number.isRequired,

    /** The report action which we are displaying */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** Can this transaction be rejected? */
    canBeRejected: PropTypes.bool,

    /** Type of the reject transaction button */
    rejectButtonType: PropTypes.oneOf(['decline', 'cancel']).isRequired,

    ...withLocalizePropTypes,
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
                            text={this.props.translate(`common.${this.props.rejectButtonType}`)}
                            style={[styles.mb3, styles.chatItemComposeSecondaryRowOffset]}
                            onPress={this.rejectTransaction}
                        />
                    </View>
                )}
            </View>
        );
    }
}

ReportTransaction.defaultProps = defaultProps;
ReportTransaction.propTypes = propTypes;
export default withLocalize(ReportTransaction);
