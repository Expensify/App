import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../../../styles/styles';
import ReportActionItemFragment from './ReportActionItemFragment';
import ReportActionPropTypes from './ReportActionPropTypes';

const propTypes = {
    // The report action
    action: PropTypes.shape(ReportActionPropTypes).isRequired,
};

const ReportActionItemMessage = ({action}) => {
    // reportActionID is only present when the action is saved onto server.
    const isUnsent = action.loading && !action.reportActionID;
    return (
        <View style={[styles.chatItemMessage, isUnsent && styles.chatItemUnsentMessage]}>
            {_.map(_.compact(action.message), (fragment, index) => (
                <ReportActionItemFragment
                    key={`actionFragment-${action.sequenceNumber}-${index}`}
                    fragment={fragment}
                    isAttachment={action.isAttachment}
                    loading={action.loading}
                />
            ))}
        </View>
    );
};

ReportActionItemMessage.propTypes = propTypes;
ReportActionItemMessage.displayName = 'ReportActionItemMessage';

export default ReportActionItemMessage;
