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

    // Allows setting of attachment modal data
    setAttachmentModalData: PropTypes.func.isRequired
};

const ReportActionItemMessage = ({action, setAttachmentModalData}) => (
    <View style={[styles.chatItemMessage]}>
        {_.map(_.compact(action.message), (fragment, index) => (
            <ReportActionItemFragment
                key={`actionFragment-${action.sequenceNumber}-${index}`}
                action={action}
                fragment={fragment}
                isAttachment={action.isAttachment}
                loading={action.loading}
                setAttachmentModalData={setAttachmentModalData}
            />
        ))}
    </View>
);

ReportActionItemMessage.propTypes = propTypes;
ReportActionItemMessage.displayName = 'ReportActionItemMessage';

export default ReportActionItemMessage;
