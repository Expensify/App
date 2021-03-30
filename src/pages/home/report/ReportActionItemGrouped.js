import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ReportActionPropTypes from './ReportActionPropTypes';
import ReportActionItemMessage from './ReportActionItemMessage';
import styles from '../../../styles/styles';
import ReportActionItemIOUPreview from '../../../components/ReportActionItemIOUPreview';

const propTypes = {
    // All the data of the action
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // Is this the most recent IOU Action?
    isMostRecentIOUReport: PropTypes.bool.isRequired,

    // IOU report ID associated with current report
    iouReportID: PropTypes.number,
};

const defaultProps = {
    iouReportID: null,
};

const ReportActionItemGrouped = ({action, iouReportID, isMostRecentIOUReport}) => (
    <View style={[styles.chatItem]}>
        <View style={[styles.chatItemRightGrouped]}>
            {action.actionName === 'IOU'
                ? (
                    <ReportActionItemIOUPreview
                        iouReportID={iouReportID}
                        action={action}
                        isMostRecentIOUReport={isMostRecentIOUReport}
                    />
                )
                : <ReportActionItemMessage action={action} />}
        </View>
    </View>
);

ReportActionItemGrouped.propTypes = propTypes;
ReportActionItemGrouped.defaultProps = defaultProps;
export default ReportActionItemGrouped;
