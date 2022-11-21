import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import styles from '../../../styles/styles';
import ReportActionItemFragment from './ReportActionItemFragment';
import reportActionPropTypes from './reportActionPropTypes';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';

const propTypes = {
    /** The report action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

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

const ReportActionItemMessage = props => (
    <View style={[styles.chatItemMessage, ...props.style]}>
        {_.map(_.compact(props.action.previousMessage || props.action.message), (fragment, index) => (
            <ReportActionItemFragment
                key={`actionFragment-${props.action.reportActionID}-${index}`}
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

ReportActionItemMessage.propTypes = propTypes;
ReportActionItemMessage.defaultProps = defaultProps;
ReportActionItemMessage.displayName = 'ReportActionItemMessage';

export default withLocalize(ReportActionItemMessage);
