import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../../../styles/styles';
import ReportActionItemFragment from './ReportActionItemFragment';
import reportActionPropTypes from './reportActionPropTypes';
import {withNetwork} from '../../../components/OnyxProvider';
import Text from '../../../components/Text';
import themeColors from '../../../styles/themes/default';
import * as ReportUtils from '../../../libs/reportUtils';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';

const propTypes = {
    /** The report action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** Information about the network */
    network: PropTypes.shape({
        /** Is the network currently offline or not */
        isOffline: PropTypes.bool,
    }),

    /** localization props */
    ...withLocalizePropTypes,
};

const defaultProps = {
    network: {isOffline: false},
};

const ReportActionItemMessage = (props) => {
    const isUnsent = props.network.isOffline && props.action.loading;
    const isDeleted = ReportUtils.isDeletedAction(props.action);

    return (
        <View style={[styles.chatItemMessage, isUnsent && styles.chatItemUnsentMessage]}>
            {isDeleted
                ? <Text color={themeColors.textSupporting}>{`[${props.translate('common.deletedCommentMessage')}]`}</Text>
                : _.map(_.compact(props.action.message), (fragment, index) => (
                    <ReportActionItemFragment
                            key={`actionFragment-${props.action.sequenceNumber}-${index}`}
                            fragment={fragment}
                            isAttachment={props.action.isAttachment}
                            loading={props.action.loading}
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
