import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
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
};

const defaultProps = {
    reportActions: {},
};

const IOUTransactions = ({
    reportActions,
    chatReportID,
    iouReportID,
    userEmail,
}) => {
    const rejectedTransactions = _.map(_.filter(reportActions, (reportAction) => {
        if (!reportAction.originalMessage || !reportAction.originalMessage.type) {
            return false;
        }

        // actions of type 'create' are potentially rejectable
        return reportAction.originalMessage.type === 'create';
    }), createAction => lodashGet(createAction, 'originalMessage.IOUTransactionID', 0));

    return (
        <View style={[styles.mt3]}>
            {_.map(reportActions, (reportAction) => {
                if (reportAction.actionName === 'IOU'
                    && reportAction.originalMessage.IOUReportID === iouReportID) {
                    // TODO, remove rejected transactions from the array
                    const rejectable = rejectedTransactions.includes(reportAction.originalMessage.IOUTransactionID);
                    const isTransactionCreator = userEmail === reportAction.actorEmail;
                    return (
                        <ReportTransaction
                            chatReportID={chatReportID}
                            iouReportID={iouReportID}
                            action={reportAction}
                            key={reportAction.sequenceNumber}
                            canReject={rejectable}
                            isTransactionCreator={isTransactionCreator}
                        />
                    );
                }
            })}
        </View>
    );
};

IOUTransactions.defaultProps = defaultProps;
IOUTransactions.propTypes = propTypes;
export default withOnyx({
    reportActions: {
        key: ({chatReportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
        canEvict: false,
    },
})(IOUTransactions);
