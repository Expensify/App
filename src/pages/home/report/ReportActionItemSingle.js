import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ReportActionPropTypes from './ReportActionPropTypes';
import ReportActionItemMessage from './ReportActionItemMessage';
import ReportActionItemFragment from './ReportActionItemFragment';
import styles from '../../../styles/styles';
import CONST from '../../../CONST';
import ReportActionItemDate from './ReportActionItemDate';
import Avatar from '../../../components/Avatar';
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

const ReportActionItemSingle = ({action, iouReportID, isMostRecentIOUReport}) => {
    const avatarUrl = action.automatic
        ? `${CONST.CLOUDFRONT_URL}/images/icons/concierge_2019.svg`
        : action.avatar;
    return (
        <View style={[styles.chatItem]}>
            <Avatar
                style={[styles.actionAvatar]}
                source={avatarUrl}
            />
            <View style={[styles.chatItemRight]}>
                <View style={[styles.chatItemMessageHeader]}>
                    {_.map(action.person, (fragment, index) => (
                        <ReportActionItemFragment
                            key={`person-${action.sequenceNumber}-${index}`}
                            fragment={fragment}
                            tooltipText={action.actorEmail}
                            isAttachment={action.isAttachment}
                            isLoading={action.loading}
                        />
                    ))}
                    <ReportActionItemDate timestamp={action.timestamp} />
                </View>
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
};

ReportActionItemSingle.propTypes = propTypes;
ReportActionItemSingle.defaultProps = defaultProps;
export default ReportActionItemSingle;
