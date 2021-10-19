import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import styles from '../styles/styles';
import Text from './Text';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';
import {getPersonalDetailsForLogins} from '../libs/OptionsListUtils';
import ONYXKEYS from '../ONYXKEYS';

const propTypes = {
    /** Wether it is a default Chat Room */
    isDefaultChatRoom: PropTypes.bool,

    /** The report currently being looked at */
    report: PropTypes.oneOfType([PropTypes.object]),

    ...withLocalizePropTypes,

};

const defaultProps = {
    report: {},
    isDefaultChatRoom: false,
};

const ChatBeginningText = ({
    isDefaultChatRoom, report, translate, personalDetails, toLocalPhone,
}) => {
    const participants = lodashGet(report, 'participants', []);
    const isMultipleParticipant = participants.length > 1;
    const displayNamesWithTooltips = _.map(
        getPersonalDetailsForLogins(participants, personalDetails),
        ({
            displayName, firstName, login, pronouns,
        }) => {
            const displayNameTrimmed = Str.isSMSLogin(login) ? toLocalPhone(displayName) : displayName;

            return {
                displayName: (isMultipleParticipant ? firstName : displayNameTrimmed) || Str.removeSMSDomain(login),
                tooltip: Str.removeSMSDomain(login),
                pronouns,
            };
        },
    );
    const chatUsers = isDefaultChatRoom ? [{displayName: report.reportName}] : displayNamesWithTooltips;

    return (
        <Text style={[styles.mt3, styles.w70, styles.textAlignCenter]}>
            <Text>
                {isDefaultChatRoom
                    ? `${translate('reportActionsView.beginningOfChatHistoryPrivate')} `
                    : `${translate('reportActionsView.beginningOfChatHistory')} `}
            </Text>
            {isDefaultChatRoom
            && (
                <Text>
                    {`${lodashGet(chatUsers, 'chatUsers[0].displayName', '')} 
                    ${translate('reportActionsView.beginningOfChatHistoryPrivateSectionPart')}`}
                </Text>
            )}
            {!isDefaultChatRoom
            && (
                <>
                    {chatUsers.map(({displayName, pronouns}, index) => (
                        <Text key={displayName}>
                            <Text style={[styles.chatTextStyle]}>
                                {displayName}
                            </Text>
                            {Boolean(pronouns) && <Text>{` (${pronouns})`}</Text>}
                            {(chatUsers.length === 1 || chatUsers.length - 1 === index) && '.'}
                            {(chatUsers.length - 2 === index && chatUsers.length > 1) && ` ${translate('common.and')} `}
                            {(chatUsers.length - 2 !== index && chatUsers.length - 1 !== index) && chatUsers.length > 1 && ', '}
                        </Text>
                    ))}
                </>
            )}
        </Text>
    );
};

ChatBeginningText.defaultProps = defaultProps;
ChatBeginningText.propTypes = propTypes;
ChatBeginningText.displayName = 'ChatBeginningText';

export default compose(
    withLocalize,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
    }),
)(ChatBeginningText);
