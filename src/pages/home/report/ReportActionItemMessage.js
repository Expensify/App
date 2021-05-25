import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../../../styles/styles';
import ReportActionItemFragment from './ReportActionItemFragment';
import ReportActionPropTypes from './ReportActionPropTypes';

const propTypes = {
    /** The report action */
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    isOffline: PropTypes.bool,
};

const defaultProps = {
    isOffline: false,
};

const ReportActionItemMessage = ({action, isOffline}) => {
    const isUnsent = isOffline && action.loading;
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
ReportActionItemMessage.defaultProps = defaultProps;
ReportActionItemMessage.displayName = 'ReportActionItemMessage';
ReportActionItemMessage.whyDidYouRender = true;

export default ReportActionItemMessage;
