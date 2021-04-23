import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ReportActionPropTypes from './ReportActionPropTypes';
import ReportActionItemMessage from './ReportActionItemMessage';
import ReportActionItemFragment from './ReportActionItemFragment';
import styles from '../../../styles/styles';
import CONST from '../../../CONST';
import ReportActionItemDate from './ReportActionItemDate';
import Avatar from '../../../components/Avatar';
import ONYXKEYS from '../../../ONYXKEYS';
import personalDetailsPropType from '../../personalDetailsPropType';
import ReportActionItemMessageEdit from './ReportActionItemMessageEdit';

const propTypes = {
    // All the data of the action
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // All of the personalDetails
    personalDetails: PropTypes.objectOf(personalDetailsPropType),

    // Draft message - if this is non-empty we'll render the comment in "edit mode"
    draftMessage: PropTypes.string.isRequired,

    // ReportID containing the report action we're displaying
    reportID: PropTypes.number.isRequired,
};

const defaultProps = {
    personalDetails: {},
};

const ReportActionItemSingle = ({
    action,
    personalDetails,
    draftMessage,
    reportID,
}) => {
    const {avatar, displayName} = personalDetails[action.actorEmail] || {};
    const avatarUrl = action.automatic
        ? `${CONST.CLOUDFRONT_URL}/images/icons/concierge_2019.svg`

        // Use avatar in personalDetails if we have one then fallback to avatar provided by the action
        : (avatar || action.avatar);

    // Since the display name for a report action message is delivered with the report history as an array of fragments
    // we'll need to take the displayName from personal details and have it be in the same format for now. Eventually,
    // we should stop referring to the report history items entirely for this information.
    const personArray = displayName ? [{type: 'TEXT', text: displayName}] : action.person;
    return (
        <View style={[styles.chatItem]}>
            <Avatar
                style={[styles.actionAvatar]}
                source={avatarUrl}
            />
            <View style={[styles.chatItemRight]}>
                <View style={[styles.chatItemMessageHeader]}>
                    {_.map(personArray, (fragment, index) => (
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
                {_.isEmpty(draftMessage)
                    ? <ReportActionItemMessage action={action} />
                    : <ReportActionItemMessageEdit action={action} draftMessage={draftMessage} reportID={reportID} />}
            </View>
        </View>
    );
};

ReportActionItemSingle.propTypes = propTypes;
ReportActionItemSingle.defaultProps = defaultProps;
export default withOnyx({
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS,
    },
})(ReportActionItemSingle);
