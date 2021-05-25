import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import PropTypes from 'prop-types';
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
};

const defaultProps = {
    reportActions: {},
};

const IOUTransactions = ({
    reportActions,
    chatReportID,
    iouReportID,
}) => (
    <View style={[styles.mt3]}>
        {_.map(reportActions, (reportAction) => {
            if (reportAction.actionName === 'IOU'
                && reportAction.originalMessage.IOUReportID === iouReportID) {
                return (
                    <ReportTransaction
                        chatReportID={chatReportID}
                        iouReportID={iouReportID}
                        action={reportAction}
                        key={reportAction.sequenceNumber}
                    />
                );
            }
        })}
    </View>
);

IOUTransactions.defaultProps = defaultProps;
IOUTransactions.propTypes = propTypes;
export default withOnyx({
    reportActions: {
        key: ({chatReportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
        canEvict: false,
    },
})(IOUTransactions);
