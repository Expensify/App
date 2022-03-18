import React from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import RenderHTML from 'react-native-render-html';
import {View} from 'react-native';
import styles from '../styles/styles';
import Text from './Text';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';
import * as ReportUtils from '../libs/reportUtils';
import * as OptionsListUtils from '../libs/OptionsListUtils';
import * as Localize from '../libs/Localize';
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
    /** The report currently being looked at */
    report: PropTypes.oneOfType([PropTypes.object]),

    /* Onyx Props */

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(personalDetailsPropTypes).isRequired,

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** The policy name */
        name: PropTypes.string,
    }).isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    report: {},
};

const ReportWelcomeText = (props) => {
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(props.report);
    const isChatRoom = ReportUtils.isChatRoom(props.report);
    const isDefault = !(isChatRoom || isPolicyExpenseChat);
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
    const isResctrictedRoom = lodashGet(props, 'report.visibility', '') === CONST.REPORT.VISIBILITY.RESTRICTED;
    const owner = lodashGet(props.personalDetails, [props.report.ownerEmail, 'firstName']) || props.report.ownerEmail;
    const policyName = lodashGet(props.policies, [`${ONYXKEYS.COLLECTION.POLICY}${props.report.policyID}`, 'name'], Localize.translateLocal('workspace.common.unavailable'));

    return (
        <View style={[styles.mt3, styles.mw100]}>
            {isPolicyExpenseChat && (
            <RenderHTML
                defaultTextProps={{
                    style: styles.textAlignCenter,
                }}
                source={{
                    html: props.translate('reportActionsView.beginningOfChatHistoryPolicyExpenseChat', {owner, policyName}),
                }}
            />
            )}
            {isChatRoom
            && (
                <>
                    {isResctrictedRoom
                        ? (
                            <RenderHTML
                                defaultTextProps={{
                                    style: styles.textAlignCenter,
                                }}
                                source={{html: props.translate('reportActionsView.beginningOfChatHistoryRestricted', {reportName: props.report.reportName})}}
                            />
                        )
                        : (
                            <RenderHTML
                                defaultTextProps={{
                                    style: styles.textAlignCenter,
                                }}
                                source={{html: props.translate('reportActionsView.beginningOfChatHistoryPrivate', {reportName: props.report.reportName})}}
                            />
                        )}
                </>
            )}
            {isDefault && (
                <Text style={styles.textAlignCenter}>
                    <Text>
                        {props.translate('reportActionsView.beginningOfChatHistory')}
                    </Text>
                    {_.map(displayNamesWithTooltips, ({displayName, pronouns}, index) => (
                        <Text key={displayName}>
                            <Text style={[styles.textStrong]}>
                                {displayName}
                            </Text>
                            {!_.isEmpty(pronouns) && <Text>{` (${pronouns})`}</Text>}
                            {(index === displayNamesWithTooltips.length - 1) && <Text>.</Text>}
                            {(index === displayNamesWithTooltips.length - 2) && <Text>{` ${props.translate('common.and')} `}</Text>}
                            {(index < displayNamesWithTooltips.length - 2) && <Text>, </Text>}
                        </Text>
                    ))}
                </Text>
            )}
        </View>
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
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
    }),
)(ReportWelcomeText);
