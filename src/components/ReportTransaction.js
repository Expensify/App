import React from 'react';
import PropTypes from 'prop-types';
import {Text} from 'react-native';
import styles from '../styles/styles';
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
};

const ReportTransaction = ({
    action,
}) => (
    <ReportActionItemSingle
        action={action}
        wrapperStyles={[styles.reportTransaction]}
    >
        <Text style={[styles.chatItemMessage]}>
            {action.message[0].text}
        </Text>
    </ReportActionItemSingle>
);

ReportTransaction.displayName = 'ReportTransaction';
ReportTransaction.propTypes = propTypes;
export default ReportTransaction;
