import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import styles from '../../styles/styles';
import Icon from '../../components/Icon';
import * as Expensicons from '../../components/Icon/Expensicons';
import compose from '../../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import MultipleAvatars from '../../components/MultipleAvatars';
import SubscriptAvatar from '../../components/SubscriptAvatar';
import DisplayNames from '../../components/DisplayNames';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import participantPropTypes from '../../components/participantPropTypes';
import VideoChatButtonAndMenu from '../../components/VideoChatButtonAndMenu';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import CONST from '../../CONST';
import * as ReportUtils from '../../libs/ReportUtils';
import Text from '../../components/Text';
import Tooltip from '../../components/Tooltip';
import colors from '../../styles/colors';
import reportPropTypes from '../reportPropTypes';
import ONYXKEYS from '../../ONYXKEYS';
import ThreeDotsMenu from '../../components/ThreeDotsMenu';
import * as Task from '../../libs/actions/Task';
import reportActionPropTypes from './report/reportActionPropTypes';
import PressableWithoutFeedback from '../../components/Pressable/PressableWithoutFeedback';
import PinButton from '../../components/PinButton';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import TaskHeaderActionButton from '../../components/TaskHeaderActionButton';

const propTypes = {
    /** Toggles the navigationMenu open and closed */
    onNavigationMenuButtonClicked: PropTypes.func.isRequired,

    /** The report currently being looked at */
    report: reportPropTypes,

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** Onyx Props */
    parentReport: reportPropTypes,

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** URL to the assigned guide's appointment booking calendar */
        guideCalendarLink: PropTypes.string,
    }),

    /** Current user session */
    session: PropTypes.shape({
        accountID: PropTypes.number,
    }),

    /** The report actions from the parent report */
    // TO DO: Replace with HOC https://github.com/Expensify/App/issues/18769.
    // eslint-disable-next-line react/no-unused-prop-types
    parentReportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    personalDetails: {},
    parentReportActions: {},
    report: null,
    account: {
        guideCalendarLink: null,
    },
    parentReport: {},
    session: {
        accountID: 0,
    },
};

function HeaderView(props) {
    const participants = lodashGet(props.report, 'participantAccountIDs', []);
    const participantPersonalDetails = OptionsListUtils.getPersonalDetailsForAccountIDs(participants, props.personalDetails);
    const isMultipleParticipant = participants.length > 1;
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(participantPersonalDetails, isMultipleParticipant);
    const isChatThread = ReportUtils.isChatThread(props.report);
    const isChatRoom = ReportUtils.isChatRoom(props.report);
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(props.report);
    const isTaskReport = ReportUtils.isTaskReport(props.report);
    const reportHeaderData = !isTaskReport && !isChatThread && props.report.parentReportID ? props.parentReport : props.report;
    const title = ReportUtils.getReportName(reportHeaderData);
    const subtitle = ReportUtils.getChatRoomSubtitle(reportHeaderData);
    const parentNavigationSubtitle = ReportUtils.getParentNavigationSubtitle(reportHeaderData);
    const isConcierge = ReportUtils.hasSingleParticipant(props.report) && _.contains(participants, CONST.ACCOUNT_ID.CONCIERGE);
    const isAutomatedExpensifyAccount = ReportUtils.hasSingleParticipant(props.report) && ReportUtils.hasAutomatedExpensifyAccountIDs(participants);
    const guideCalendarLink = lodashGet(props.account, 'guideCalendarLink');

    // We hide the button when we are chatting with an automated Expensify account since it's not possible to contact
    // these users via alternative means. It is possible to request a call with Concierge so we leave the option for them.
    const shouldShowCallButton = (isConcierge && guideCalendarLink) || (!isAutomatedExpensifyAccount && !isTaskReport);
    const threeDotMenuItems = [];
    if (isTaskReport) {
        const isTaskAssigneeOrTaskOwner = Task.isTaskAssigneeOrTaskOwner(props.report, props.session.accountID);
        if (ReportUtils.isOpenTaskReport(props.report) && isTaskAssigneeOrTaskOwner) {
            threeDotMenuItems.push({
                icon: Expensicons.Checkmark,
                text: props.translate('task.markAsDone'),
                onSelected: () => Task.completeTask(props.report.reportID, title),
            });
        }

        // Task is marked as completed
        if (ReportUtils.isCompletedTaskReport(props.report) && isTaskAssigneeOrTaskOwner) {
            threeDotMenuItems.push({
                icon: Expensicons.Checkmark,
                text: props.translate('task.markAsIncomplete'),
                onSelected: () => Task.reopenTask(props.report.reportID, title),
            });
        }

        // Task is not closed
        if (props.report.stateNum !== CONST.REPORT.STATE_NUM.SUBMITTED && props.report.statusNum !== CONST.REPORT.STATUS.CLOSED && isTaskAssigneeOrTaskOwner) {
            threeDotMenuItems.push({
                icon: Expensicons.Trashcan,
                text: props.translate('common.cancel'),
                onSelected: () => Task.cancelTask(props.report.reportID, props.report.reportName, props.report.stateNum, props.report.statusNum),
            });
        }
    }
    const shouldShowThreeDotsButton = !!threeDotMenuItems.length;

    const shouldShowSubscript = ReportUtils.shouldReportShowSubscript(props.report);
    const defaultSubscriptSize = ReportUtils.isExpenseRequest(props.report) ? CONST.AVATAR_SIZE.SMALL_NORMAL : CONST.AVATAR_SIZE.DEFAULT;
    const icons = ReportUtils.getIcons(reportHeaderData, props.personalDetails);
    const brickRoadIndicator = ReportUtils.hasReportNameError(props.report) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
    const shouldShowBorderBottom = !isTaskReport || !props.isSmallScreenWidth;

    return (
        <View
            style={[styles.appContentHeader, shouldShowBorderBottom && styles.borderBottom]}
            nativeID="drag-area"
        >
            <View style={[styles.appContentHeaderTitle, !props.isSmallScreenWidth && styles.pl5]}>
                {props.isSmallScreenWidth && (
                    <PressableWithoutFeedback
                        onPress={props.onNavigationMenuButtonClicked}
                        style={[styles.LHNToggle]}
                        accessibilityHint={props.translate('accessibilityHints.navigateToChatsList')}
                        accessibilityLabel={props.translate('common.back')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                    >
                        <Tooltip
                            text={props.translate('common.back')}
                            shiftVertical={4}
                        >
                            <View>
                                <Icon src={Expensicons.BackArrow} />
                            </View>
                        </Tooltip>
                    </PressableWithoutFeedback>
                )}
                {Boolean(props.report && title) && (
                    <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <PressableWithoutFeedback
                            onPress={() => ReportUtils.navigateToDetailsPage(props.report)}
                            style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}
                            disabled={isTaskReport && !ReportUtils.isOpenTaskReport(props.report)}
                            accessibilityLabel={title}
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                        >
                            {shouldShowSubscript ? (
                                <SubscriptAvatar
                                    mainAvatar={icons[0]}
                                    secondaryAvatar={icons[1]}
                                    size={defaultSubscriptSize}
                                />
                            ) : (
                                <MultipleAvatars
                                    icons={icons}
                                    shouldShowTooltip={!isChatRoom || isChatThread}
                                />
                            )}
                            <View style={[styles.flex1, styles.flexColumn]}>
                                <DisplayNames
                                    fullTitle={title}
                                    displayNamesWithTooltips={displayNamesWithTooltips}
                                    tooltipEnabled
                                    numberOfLines={1}
                                    textStyles={[styles.headerText, styles.pre]}
                                    shouldUseFullTitle={isChatRoom || isPolicyExpenseChat || isChatThread || isTaskReport}
                                />
                                {!_.isEmpty(parentNavigationSubtitle) && (
                                    <PressableWithoutFeedback
                                        onPress={() => {
                                            Navigation.navigate(ROUTES.getReportRoute(props.report.parentReportID));
                                        }}
                                        style={[styles.alignSelfStart, styles.mw100]}
                                        accessibilityLabel={parentNavigationSubtitle}
                                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.LINK}
                                    >
                                        <Text
                                            style={[styles.optionAlternateText, styles.textLabelSupporting, styles.link]}
                                            numberOfLines={1}
                                        >
                                            {parentNavigationSubtitle}
                                        </Text>
                                    </PressableWithoutFeedback>
                                )}
                                {!_.isEmpty(subtitle) && (
                                    <Text
                                        style={[styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting]}
                                        numberOfLines={1}
                                    >
                                        {subtitle}
                                    </Text>
                                )}
                            </View>
                            {brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR && (
                                <View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>
                                    <Icon
                                        src={Expensicons.DotIndicator}
                                        fill={colors.red}
                                    />
                                </View>
                            )}
                        </PressableWithoutFeedback>
                        <View style={[styles.reportOptions, styles.flexRow, styles.alignItemsCenter]}>
                            {isTaskReport && !props.isSmallScreenWidth && ReportUtils.isOpenTaskReport(props.report) && <TaskHeaderActionButton report={props.report} />}
                            {shouldShowCallButton && (
                                <VideoChatButtonAndMenu
                                    isConcierge={isConcierge}
                                    guideCalendarLink={guideCalendarLink}
                                />
                            )}
                            <PinButton report={props.report} />
                            {shouldShowThreeDotsButton && (
                                <ThreeDotsMenu
                                    anchorPosition={styles.threeDotsPopoverOffset(props.windowWidth)}
                                    menuItems={threeDotMenuItems}
                                />
                            )}
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
}
HeaderView.propTypes = propTypes;
HeaderView.displayName = 'HeaderView';
HeaderView.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withLocalize,
    withOnyx({
        account: {
            key: ONYXKEYS.ACCOUNT,
            selector: (account) =>
                account && {
                    guideCalendarLink: account.guideCalendarLink,
                    primaryLogin: account.primaryLogin,
                },
        },
        parentReportActions: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`,
            canEvict: false,
        },
        parentReport: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID || report.reportID}`,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(HeaderView);
