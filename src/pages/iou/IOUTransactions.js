import React, {Component} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import * as ReportActionsUtils from '../../libs/ReportActionsUtils';
import reportActionPropTypes from '../home/report/reportActionPropTypes';
import ReportTransaction from '../../components/ReportTransaction';
import CONST from '../../CONST';

const propTypes = {
    /** Actions from the ChatReport */
    reportActions: PropTypes.shape(reportActionPropTypes),

    /** ReportID for the associated chat report */
    chatReportID: PropTypes.string.isRequired,

    /** ReportID for the associated IOU report */
    iouReportID: PropTypes.string.isRequired,

    /** Email for the authenticated user */
    userEmail: PropTypes.string.isRequired,

    /** Is the associated IOU settled? */
    isIOUSettled: PropTypes.bool,
};

const defaultProps = {
    reportActions: {},
    isIOUSettled: false,
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
        if (this.props.isIOUSettled) {
            return [];
        }

        // iouReportIDs should be strings, but we still have places that send them as ints so we convert them both to Numbers for comparison
        const actionsForIOUReport = _.filter(this.props.reportActions, action => action.originalMessage
            && action.originalMessage.type && Number(action.originalMessage.IOUReportID) === Number(this.props.iouReportID));

        const rejectedTransactionIDs = _.chain(actionsForIOUReport)
            .filter(action => _.contains(['cancel', 'decline'], action.originalMessage.type))
            .map(rejectedAction => lodashGet(rejectedAction, 'originalMessage.IOUTransactionID', ''))
            .compact()
            .value();

        return _.chain(actionsForIOUReport)
            .filter(action => action.originalMessage.type === 'create')
            .filter(action => !_.contains(rejectedTransactionIDs, action.originalMessage.IOUTransactionID))
            .map(action => lodashGet(action, 'originalMessage.IOUTransactionID', ''))
            .compact()
            .value();
    }

    render() {
        const sortedReportActions = ReportActionsUtils.getSortedReportActionsForDisplay(this.props.reportActions);
        return (
            <View style={[styles.mt3]}>
                {_.map(sortedReportActions, (reportAction) => {
                    // iouReportIDs should be strings, but we still have places that send them as ints so we convert them both to Numbers for comparison
                    if (!reportAction.originalMessage || Number(reportAction.originalMessage.IOUReportID) !== Number(this.props.iouReportID)) {
                        return;
                    }

                    const rejectableTransactions = this.getRejectableTransactions();
                    const canBeRejected = _.contains(rejectableTransactions,
                        reportAction.originalMessage.IOUTransactionID);
                    const isCurrentUserTransactionCreator = this.props.userEmail === reportAction.actorEmail;
                    return (
                        <ReportTransaction
                            chatReportID={this.props.chatReportID}
                            iouReportID={this.props.iouReportID}
                            reportActions={sortedReportActions}
                            action={reportAction}
                            key={reportAction.reportActionID}
                            canBeRejected={canBeRejected}
                            rejectButtonType={isCurrentUserTransactionCreator ? CONST.IOU.REPORT_ACTION_TYPE.CANCEL : CONST.IOU.REPORT_ACTION_TYPE.DECLINE}
                        />
                    );
                })}
            </View>
        );
    }
}

IOUTransactions.defaultProps = defaultProps;
IOUTransactions.propTypes = propTypes;
export default withOnyx({
    reportActions: {
        key: ({chatReportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
        canEvict: false,
    },
})(IOUTransactions);
