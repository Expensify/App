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

        this.getDeletableTransactions = this.getDeletableTransactions.bind(this);
    }

    /**
     * Builds and returns the deletableTransactionIDs array. A transaction must meet multiple requirements in order
     * to be deletable. We must exclude transactions not associated with the iouReportID, actions which have already
     * been deleted, and those which are not of type 'create'.
     *
     * @returns {Array}
     */
    getDeletableTransactions() {
        if (this.props.isIOUSettled) {
            return [];
        }

        // iouReportIDs should be strings, but we still have places that send them as ints so we convert them both to Numbers for comparison
        const actionsForIOUReport = _.filter(
            this.props.reportActions,
            (action) => action.originalMessage && action.originalMessage.type && Number(action.originalMessage.IOUReportID) === Number(this.props.iouReportID),
        );

        const deletedTransactionIDs = _.chain(actionsForIOUReport)
            .filter((action) => _.contains([CONST.IOU.REPORT_ACTION_TYPE.CANCEL, CONST.IOU.REPORT_ACTION_TYPE.DECLINE, CONST.IOU.REPORT_ACTION_TYPE.DELETE], action.originalMessage.type))
            .map((deletedAction) => lodashGet(deletedAction, 'originalMessage.IOUTransactionID', ''))
            .compact()
            .value();

        return _.chain(actionsForIOUReport)
            .filter((action) => action.originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.CREATE)
            .filter((action) => !_.contains(deletedTransactionIDs, action.originalMessage.IOUTransactionID))
            .filter((action) => this.props.userEmail === action.actorEmail)
            .map((action) => lodashGet(action, 'originalMessage.IOUTransactionID', ''))
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

                    const deletableTransactions = this.getDeletableTransactions();
                    const canBeDeleted = _.contains(deletableTransactions, reportAction.originalMessage.IOUTransactionID);
                    return (
                        <ReportTransaction
                            chatReportID={this.props.chatReportID}
                            iouReportID={this.props.iouReportID}
                            reportActions={sortedReportActions}
                            action={reportAction}
                            key={reportAction.reportActionID}
                            canBeDeleted={canBeDeleted}
                            shouldCloseOnDelete={deletableTransactions.length === 1}
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
