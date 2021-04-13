import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ReportActionPropTypes from './ReportActionPropTypes';
import ReportActionItemMessage from './ReportActionItemMessage';
import styles from '../../../styles/styles';
import ReportActionItemMessageEdit from './ReportActionItemMessageEdit';

const propTypes = {
    // All the data of the action
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    draftMessage: PropTypes.string.isRequired,

    reportID: PropTypes.number.isRequired,
};

const ReportActionItemGrouped = ({action, draftMessage, reportID}) => (
    <View style={[styles.chatItem]}>
        <View style={[styles.chatItemRightGrouped]}>
            {_.isEmpty(draftMessage)
                ? <ReportActionItemMessage action={action} />
                : <ReportActionItemMessageEdit action={action} draftMessage={draftMessage} reportID={reportID} />}
        </View>
    </View>
);

ReportActionItemGrouped.propTypes = propTypes;
export default ReportActionItemGrouped;
