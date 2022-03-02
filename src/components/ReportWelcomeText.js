import React from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import styles from '../styles/styles';
import Text from './Text';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';
import * as OptionsListUtils from '../libs/OptionsListUtils';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';


const personalDetailsPropTypes = PropTypes.shape({
    /** The login of the person (either email or phone number) */
    login: PropTypes.string.isRequired,

    /** The URL of the person's avatar (there should already be a default avatar if
    the person doesn't have their own avatar uploaded yet) */
    avatar: PropTypes.string.isRequired,

    /** This is either the user's full name, or their login if full name is an empty string */
    displayName: PropTypes.string.isRequired,
});

const propTypes = {
    /** Whether it is a default Chat Room */
    shouldIncludeParticipants: PropTypes.bool,

    /** The report currently being looked at */
    report: PropTypes.oneOfType([PropTypes.object]),

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(personalDetailsPropTypes).isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    report: {},
    shouldIncludeParticipants: true,
};

const ReportWelcomeText = (props) => {
    const participants = lodashGet(props.report, 'participants', []);
    const isMultipleParticipant = participants.length > 1;
    const displayNamesWithTooltips = _.map(
        OptionsListUtils.getPersonalDetailsForLogins(participants, props.personalDetails),
        ({
            displayName, firstName, login, pronouns,
        }) => {
            const longName = displayName || Str.removeSMSDomain(login);
            const longNameLocalized = Str.isSMSLogin(longName) ? props.toLocalPhone(longName) : longName;
            const shortName = firstName || longNameLocalized;
            let finalPronouns = pronouns;
            if (pronouns && pronouns.startsWith(CONST.PRONOUNS.PREFIX)) {
                const localeKey = pronouns.replace(CONST.PRONOUNS.PREFIX, '');
                finalPronouns = props.translate(`pronouns.${localeKey}`);
            }
            return {
                displayName: isMultipleParticipant ? shortName : longNameLocalized,
                tooltip: Str.removeSMSDomain(login),
                pronouns: finalPronouns,
            };
        },
    );
    const chatUsers = props.shouldIncludeParticipants ? displayNamesWithTooltips : [{displayName: props.report.reportName}];
    const isResctrictedRoom = lodashGet(props, 'report.visibility', '') === CONST.REPORT.VISIBILITY.RESTRICTED;

    return (
        <Text style={[styles.mt3, styles.mw100, styles.textAlignCenter]}>
            {!props.shouldIncludeParticipants
                ? (
                    <>
                        <Text>
                            {isResctrictedRoom
                                ? `${props.translate('reportActionsView.beginningOfChatHistoryRestrictedPartOne')}`
                                : `${props.translate('reportActionsView.beginningOfChatHistoryPrivatePartOne')}`}
                        </Text>
                        <Text style={[styles.textStrong]}>
                            {lodashGet(chatUsers, '[0].displayName', '')}
                        </Text>
                        <Text>
                            {isResctrictedRoom
                                ? `${props.translate('reportActionsView.beginningOfChatHistoryRestrictedPartTwo')}`
                                : `${props.translate('reportActionsView.beginningOfChatHistoryPrivatePartTwo')}`}
                        </Text>
                    </>
                ) : (
                    <>
                        <Text>
                            {props.translate('reportActionsView.beginningOfChatHistory')}
                        </Text>
                        {_.map(chatUsers, ({displayName, pronouns}, index) => (
                            <Text key={displayName}>
                                <Text style={[styles.textStrong]}>
                                    {displayName}
                                </Text>
                                {!_.isEmpty(pronouns) && <Text>{` (${pronouns})`}</Text>}
                                {(index === chatUsers.length - 1) && <Text>.</Text>}
                                {(index === chatUsers.length - 2) && <Text>{` ${props.translate('common.and')} `}</Text>}
                                {(index < chatUsers.length - 2) && <Text>, </Text>}
                            </Text>
                        ))}
                    </>
                )}
        </Text>
    );
};

ReportWelcomeText.defaultProps = defaultProps;
ReportWelcomeText.propTypes = propTypes;
ReportWelcomeText.displayName = 'ReportWelcomeText';

export default compose(
    withLocalize,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
    }),
)(ReportWelcomeText);
