import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
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

    /** Additional styles to add after local styles. */
    style: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.object),
        PropTypes.object,
    ]),

    /** localization props */
    ...withLocalizePropTypes,
};

const defaultProps = {
    style: [],
};

const ReportActionItemMessage = (props) => {
    const isUnsent = props.network.isOffline && props.action.isLoading;

    return (
        <View style={[styles.chatItemMessage, isUnsent && styles.chatItemUnsentMessage, ...props.style]}>
            {_.map(_.compact(props.action.message), (fragment, index) => (
                <ReportActionItemFragment
                    key={`actionFragment-${props.action.sequenceNumber}-${index}`}
                    fragment={fragment}
                    isAttachment={props.action.isAttachment}
                    attachmentInfo={props.action.attachmentInfo}
                    source={lodashGet(props.action, 'originalMessage.source')}
                    loading={props.action.isLoading}
                    style={props.style}
                />
            ))}
        </View>
    );
};

ReportActionItemMessage.propTypes = propTypes;
ReportActionItemMessage.defaultProps = defaultProps;
ReportActionItemMessage.displayName = 'ReportActionItemMessage';

export default compose(
    withNetwork(),
    withLocalize,
)(ReportActionItemMessage);
