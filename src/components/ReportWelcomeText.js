import React from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import styles from '../styles/styles';
import Text from './Text';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';
import * as ReportUtils from '../libs/ReportUtils';
import * as OptionsListUtils from '../libs/OptionsListUtils';
import ONYXKEYS from '../ONYXKEYS';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import Tooltip from './Tooltip';
import reportPropTypes from '../pages/reportPropTypes';
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
    report: reportPropTypes,

    /* Onyx Props */

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(personalDetailsPropTypes),

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** The policy name */
        name: PropTypes.string,
    }),

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    ...withLocalizePropTypes,
};

const defaultProps = {
    report: {},
    policies: {},
    personalDetails: {},
    betas: [],
};

const ReportWelcomeText = (props) => {
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(props.report);
    const isChatRoom = ReportUtils.isChatRoom(props.report);
    const isDefault = !(isChatRoom || isPolicyExpenseChat);
    const participants = lodashGet(props.report, 'participants', []);
    const isMultipleParticipant = participants.length > 1;
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(
        OptionsListUtils.getPersonalDetailsForLogins(participants, props.personalDetails),
        isMultipleParticipant,
    );
    const roomWelcomeMessage = ReportUtils.getRoomWelcomeMessage(props.report, props.policies);
    const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(props.report, participants, props.betas);
    return (
        <>
            <View>
                <Text style={[styles.textHero]}>
                    {props.translate('reportActionsView.sayHello')}
                </Text>
            </View>
            <Text style={[styles.mt3, styles.mw100]}>
                {isPolicyExpenseChat && (
                    <>
                        <Text>
                            {props.translate('reportActionsView.beginningOfChatHistoryPolicyExpenseChatPartOne')}
                        </Text>
                        <Text style={[styles.textStrong]}>
                            {/* Use the policyExpenseChat owner's first name or their email if it's undefined or an empty string */}
                            {lodashGet(props.personalDetails, [props.report.ownerEmail, 'firstName']) || props.report.ownerEmail}
                        </Text>
                        <Text>
                            {props.translate('reportActionsView.beginningOfChatHistoryPolicyExpenseChatPartTwo')}
                        </Text>
                        <Text style={[styles.textStrong]}>
                            {ReportUtils.getPolicyName(props.report, props.policies)}
                        </Text>
                        <Text>
                            {props.translate('reportActionsView.beginningOfChatHistoryPolicyExpenseChatPartThree')}
                        </Text>
                    </>
                )}
                {isChatRoom && (
                    <>
                        <Text>
                            {roomWelcomeMessage.phrase1}
                        </Text>
                        <Text style={[styles.textStrong]} onPress={() => Navigation.navigate(ROUTES.getReportDetailsRoute(props.report.reportID))}>
                            {ReportUtils.getReportName(props.report, props.policies)}
                        </Text>
                        <Text>
                            {roomWelcomeMessage.phrase2}
                        </Text>
                    </>
                )}
                {isDefault && (
                    <Text>
                        <Text>
                            {props.translate('reportActionsView.beginningOfChatHistory')}
                        </Text>
                        {_.map(displayNamesWithTooltips, ({
                            displayName, pronouns, tooltip,
                        }, index) => (
                            <Text key={`${displayName}${pronouns}${index}`}>
                                <Tooltip text={tooltip} containerStyles={[styles.dInline]}>
                                    <Text style={[styles.textStrong]} onPress={() => Navigation.navigate(ROUTES.getDetailsRoute(participants[index]))}>
                                        {displayName}
                                    </Text>
                                </Tooltip>
                                {!_.isEmpty(pronouns) && <Text>{` (${pronouns})`}</Text>}
                                {(index === displayNamesWithTooltips.length - 1) && <Text>.</Text>}
                                {(index === displayNamesWithTooltips.length - 2) && <Text>{` ${props.translate('common.and')} `}</Text>}
                                {(index < displayNamesWithTooltips.length - 2) && <Text>, </Text>}
                            </Text>
                        ))}
                    </Text>
                )}
                {(moneyRequestOptions.includes(CONST.IOU.IOU_TYPE.SEND) || moneyRequestOptions.includes(CONST.IOU.IOU_TYPE.REQUEST)) && (
                    <Text>
                        {/* Need to confirm copy for the below with marketing, and then add to translations. */}
                        {props.translate('reportActionsView.usePlusButton')}
                    </Text>
                )}
            </Text>
        </>
    );
};

ReportWelcomeText.defaultProps = defaultProps;
ReportWelcomeText.propTypes = propTypes;
ReportWelcomeText.displayName = 'ReportWelcomeText';

export default compose(
    withLocalize,
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
    }),
)(ReportWelcomeText);
