import React, {Component} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import compose from '../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import ReportActionPropTypes from '../home/report/ReportActionPropTypes';
import ReportTransaction from '../../components/ReportTransaction';

const propTypes = {
    /** Actions from the ChatReport */
    reportActions: PropTypes.shape(ReportActionPropTypes),

    /** ReportID for the associated chat report */
    chatReportID: PropTypes.number.isRequired,

    /** ReportID for the associated IOU report */
    iouReportID: PropTypes.number.isRequired,

    /** Email for the authenticated user */
    userEmail: PropTypes.string.isRequired,

    /** Does the associaed have an outstanding IOU? */
    hasOutstandingIOU: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    reportActions: {},
    hasOutstandingIOU: false,
};

class IOUTransactions extends Component {
    constructor(props) {
        super(props);

        this.getRejectableTransactions = this.getRejectableTransactions.bind(this);
    }

    /**
     * Builds and returns the rejectableTransactionIDs array. A transaction must meet multiple requirements in order
     * to be rejectable. We must exclude transactions not associated with the iouReportID, actions which have already
     * been rejected, and those which are not of type 'create'.
     *
     * @returns {Array}
     */
    getRejectableTransactions() {
        if (!this.props.hasOutstandingIOU) {
            return [];
        }

        const actionsForIOUReport = _.filter(this.props.reportActions, action => action.originalMessage
            && action.originalMessage.type && action.originalMessage.IOUReportID === this.props.iouReportID);

        const rejectedTransactionIDs = _.chain(actionsForIOUReport)
            .filter(action => _.contains(['cancel', 'decline'], action.originalMessage.type))
            .map(rejectedAction => lodashGet(rejectedAction, 'originalMessage.IOUTransactionID', ''))
            .value();

        return _.chain(actionsForIOUReport)
            .filter(action => action.originalMessage.type === 'create')
            .filter(action => !_.contains(rejectedTransactionIDs, action.originalMessage.IOUTransactionID))
            .map(action => lodashGet(action, 'originalMessage.IOUTransactionID', ''))
            .value();
    }

    render() {
        return (
            <View style={[styles.mt3]}>
                {_.map(this.props.reportActions, (reportAction) => {
                    if (reportAction.originalMessage
                        && reportAction.originalMessage.IOUReportID === this.props.iouReportID) {
                        const rejectableTransactions = this.getRejectableTransactions();
                        const canBeRejected = _.contains(rejectableTransactions,
                            reportAction.originalMessage.IOUTransactionID,
                        );
                        const isCurrentUserTransactionCreator = this.props.userEmail === reportAction.actorEmail;
                        return (
                            <ReportTransaction
                                chatReportID={this.props.chatReportID}
                                iouReportID={this.props.iouReportID}
                                action={reportAction}
                                key={reportAction.sequenceNumber}
                                canBeRejected={canBeRejected}
                                rejectButtonLabelText={isCurrentUserTransactionCreator
                                    ? this.props.translate('common.cancel')
                                    : this.props.translate('iou.decline')}
                            />
                        );
                    }
                })}
            </View>
        );
    }
}

IOUTransactions.defaultProps = defaultProps;
IOUTransactions.propTypes = propTypes;
export default compose(
    withLocalize,
    withOnyx({
        reportActions: {
            key: ({chatReportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
            canEvict: false,
        },
    }),
)(IOUTransactions);
