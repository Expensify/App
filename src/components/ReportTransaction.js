import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import styles from '../styles/styles';
import CONST from '../CONST';
import * as IOU from '../libs/actions/IOU';
import * as ReportActions from '../libs/actions/ReportActions';
import reportActionPropTypes from '../pages/home/report/reportActionPropTypes';
import ReportActionItemSingle from '../pages/home/report/ReportActionItemSingle';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import OfflineWithFeedback from './OfflineWithFeedback';
import Text from './Text';
import Button from './Button';

const propTypes = {
    /** The chatReport which the transaction is associated with */
    /* eslint-disable-next-line react/no-unused-prop-types */
    chatReportID: PropTypes.string.isRequired,

    /** ID for the IOU report */
    /* eslint-disable-next-line react/no-unused-prop-types */
    iouReportID: PropTypes.string.isRequired,

    /** The report action which we are displaying */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** Can this transaction be rejected? */
    canBeRejected: PropTypes.bool,

    /** Type of the reject transaction button */
    rejectButtonType: PropTypes.oneOf([CONST.IOU.REPORT_ACTION_TYPE.DECLINE, CONST.IOU.REPORT_ACTION_TYPE.CANCEL]).isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    canBeRejected: false,
};

class ReportTransaction extends Component {
    constructor(props) {
        super(props);

        this.cancelMoneyRequest = this.cancelMoneyRequest.bind(this);
    }

    cancelMoneyRequest() {
        IOU.cancelMoneyRequest(
            this.props.chatReportID,
            this.props.iouReportID,
            this.props.rejectButtonType,
            this.props.action,
        );
    }

    render() {
        return (
            <OfflineWithFeedback
                onClose={() => {
                    if (this.props.action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
                        ReportActions.deleteOptimisticReportAction(this.props.chatReportID, this.props.action.sequenceNumber);
                    } else {
                        ReportActions.clearReportActionErrors(this.props.chatReportID, this.props.action.sequenceNumber);
                    }
                }}
                pendingAction={this.props.action.pendingAction}
                errors={this.props.action.errors}
                errorRowStyles={[styles.ml10, styles.mr2]}
            >
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
                                onPress={this.cancelMoneyRequest}
                            />
                        </View>
                    )}
                </View>
            </OfflineWithFeedback>
        );
    }
}

ReportTransaction.defaultProps = defaultProps;
ReportTransaction.propTypes = propTypes;
export default withLocalize(ReportTransaction);
