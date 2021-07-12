import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import ReportActionItemFragment from './ReportActionItemFragment';
import ReportActionPropTypes from './ReportActionPropTypes';

const propTypes = {
    /** The report action */
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    /** Information about the network */
    network: PropTypes.shape({
        /** Is the network currently offline or not */
        isOffline: PropTypes.bool,
    }),
};

const defaultProps = {
    network: {isOffline: false},
};

const ReportActionItemMessage = ({action, network}) => {
    const isUnsent = network.isOffline && action.loading;
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

export default withOnyx({
    network: {
        key: ONYXKEYS.NETWORK,
    },
})(ReportActionItemMessage);
