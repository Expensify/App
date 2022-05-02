import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../../../styles/styles';
import ReportActionItemFragment from './ReportActionItemFragment';
import reportActionPropTypes from './reportActionPropTypes';
import {withNetwork} from '../../../components/OnyxProvider';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import networkPropTypes from '../../../components/networkPropTypes';

const propTypes = {
    /** The report action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    /** localization props */
    ...withLocalizePropTypes,
};

const ReportActionItemMessage = (props) => {
    const isUnsent = props.network.isOffline && props.action.loading;

    return (
        <View style={[styles.chatItemMessage, isUnsent && styles.chatItemUnsentMessage]}>
            {_.map(_.compact(props.action.message), (fragment, index) => (
                <ReportActionItemFragment
                    key={`actionFragment-${props.action.sequenceNumber}-${index}`}
                    fragment={fragment}
                    isAttachment={props.action.isAttachment}
                    attachmentInfo={props.action.attachmentInfo}
                    loading={props.action.loading}
                />
            ))}
        </View>
    );
};

ReportActionItemMessage.propTypes = propTypes;
ReportActionItemMessage.displayName = 'ReportActionItemMessage';

export default compose(
    withNetwork(),
    withLocalize,
)(ReportActionItemMessage);
