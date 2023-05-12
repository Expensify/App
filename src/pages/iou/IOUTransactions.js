import React, {Component} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import * as ReportActionsUtils from '../../libs/ReportActionsUtils';
import * as IOUUtils from '../../libs/IOUUtils';
import reportActionPropTypes from '../home/report/reportActionPropTypes';
import ReportTransaction from '../../components/ReportTransaction';

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
    render() {
        const sortedReportActions = ReportActionsUtils.getSortedReportActionsForDisplay(this.props.reportActions);
        const deletableTransactions = IOUUtils.getDeletableTransactions(this.props.reportActions, this.props.iouReportID, this.props.userEmail, this.props.isIOUSettled);

        return (
            <View style={[styles.mt3]}>
                {_.map(sortedReportActions, (reportAction) => {
                    // iouReportIDs should be strings, but we still have places that send them as ints so we convert them both to Numbers for comparison
                    if (!reportAction.originalMessage || Number(reportAction.originalMessage.IOUReportID) !== Number(this.props.iouReportID)) {
                        return;
                    }

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
