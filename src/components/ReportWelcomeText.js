import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import reportPropTypes from '@pages/reportPropTypes';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import Text from './Text';
import UserDetailsTooltip from './UserDetailsTooltip';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const personalDetailsPropTypes = PropTypes.shape({
    /** The login of the person (either email or phone number) */
    login: PropTypes.string,

    /** The URL of the person's avatar (there should already be a default avatar if
  the person doesn't have their own avatar uploaded yet, except for anon users) */
    avatar: PropTypes.string,

    /** This is either the user's full name, or their login if full name is an empty string */
    displayName: PropTypes.string,
});

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes,

    /** The policy object for the current route */
    policy: PropTypes.shape({
        /** The name of the policy */
        name: PropTypes.string,

        /** The URL for the policy avatar */
        avatar: PropTypes.string,
    }),

    /* Onyx Props */

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(personalDetailsPropTypes),

    ...withLocalizePropTypes,
};

const defaultProps = {
    report: {},
    policy: {},
    personalDetails: {},
};

function ReportWelcomeText(props) {
    const styles = useThemeStyles();
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(props.report);
    const isChatRoom = ReportUtils.isChatRoom(props.report);
    const isDefault = !(isChatRoom || isPolicyExpenseChat);
    const participantAccountIDs = lodashGet(props.report, 'participantAccountIDs', []);
    const isMultipleParticipant = participantAccountIDs.length > 1;
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(
        OptionsListUtils.getPersonalDetailsForAccountIDs(participantAccountIDs, props.personalDetails),
        isMultipleParticipant,
    );
    const isUserPolicyAdmin = PolicyUtils.isPolicyAdmin(props.policy);
    const roomWelcomeMessage = ReportUtils.getRoomWelcomeMessage(props.report, isUserPolicyAdmin);
    const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(props.report, participantAccountIDs);

    return (
        <>
            <View>
                <Text style={[styles.textHero]}>
                    {isChatRoom ? props.translate('reportActionsView.welcomeToRoom', {roomName: ReportUtils.getReportName(props.report)}) : props.translate('reportActionsView.sayHello')}
                </Text>
            </View>
            <Text style={[styles.mt3, styles.mw100]}>
                {isPolicyExpenseChat && (
                    <>
                        <Text>{props.translate('reportActionsView.beginningOfChatHistoryPolicyExpenseChatPartOne')}</Text>
                        <Text style={[styles.textStrong]}>{ReportUtils.getDisplayNameForParticipant(props.report.ownerAccountID)}</Text>
                        <Text>{props.translate('reportActionsView.beginningOfChatHistoryPolicyExpenseChatPartTwo')}</Text>
                        <Text style={[styles.textStrong]}>{ReportUtils.getPolicyName(props.report)}</Text>
                        <Text>{props.translate('reportActionsView.beginningOfChatHistoryPolicyExpenseChatPartThree')}</Text>
                    </>
                )}
                {isChatRoom && (
                    <>
                        <Text>{roomWelcomeMessage.phrase1}</Text>
                        {roomWelcomeMessage.showReportName && (
                            <Text
                                style={[styles.textStrong]}
                                onPress={() => Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(props.report.reportID))}
                                suppressHighlighting
                            >
                                {ReportUtils.getReportName(props.report)}
                            </Text>
                        )}
                        {roomWelcomeMessage.phrase2 !== undefined && <Text>{roomWelcomeMessage.phrase2}</Text>}
                    </>
                )}
                {isDefault && (
                    <Text>
                        <Text>{props.translate('reportActionsView.beginningOfChatHistory')}</Text>
                        {_.map(displayNamesWithTooltips, ({displayName, pronouns, accountID}, index) => (
                            <Text key={`${displayName}${pronouns}${index}`}>
                                <UserDetailsTooltip accountID={accountID}>
                                    {ReportUtils.isOptimisticPersonalDetail(accountID) ? (
                                        <Text style={[styles.textStrong]}>{displayName}</Text>
                                    ) : (
                                        <Text
                                            style={[styles.textStrong]}
                                            onPress={() => Navigation.navigate(ROUTES.PROFILE.getRoute(accountID))}
                                            suppressHighlighting
                                        >
                                            {displayName}
                                        </Text>
                                    )}
                                </UserDetailsTooltip>
                                {!_.isEmpty(pronouns) && <Text>{` (${pronouns})`}</Text>}
                                {index === displayNamesWithTooltips.length - 1 && <Text>.</Text>}
                                {index === displayNamesWithTooltips.length - 2 && <Text>{` ${props.translate('common.and')} `}</Text>}
                                {index < displayNamesWithTooltips.length - 2 && <Text>, </Text>}
                            </Text>
                        ))}
                    </Text>
                )}
                {(moneyRequestOptions.includes(CONST.IOU.TYPE.SEND) || moneyRequestOptions.includes(CONST.IOU.TYPE.REQUEST)) && (
                    <Text>{props.translate('reportActionsView.usePlusButton')}</Text>
                )}
            </Text>
        </>
    );
}

ReportWelcomeText.defaultProps = defaultProps;
ReportWelcomeText.propTypes = propTypes;
ReportWelcomeText.displayName = 'ReportWelcomeText';

export default compose(
    withLocalize,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
    }),
)(ReportWelcomeText);
