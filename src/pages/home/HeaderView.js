import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {memo, useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import DisplayNames from '@components/DisplayNames';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MultipleAvatars from '@components/MultipleAvatars';
import ParentNavigationSubtitle from '@components/ParentNavigationSubtitle';
import participantPropTypes from '@components/participantPropTypes';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ReportHeaderSkeletonView from '@components/ReportHeaderSkeletonView';
import SubscriptAvatar from '@components/SubscriptAvatar';
import TaskHeaderActionButton from '@components/TaskHeaderActionButton';
import Text from '@components/Text';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {getGroupChatName} from '@libs/GroupChatUtils';
import * as HeaderUtils from '@libs/HeaderUtils';
import Navigation from '@libs/Navigation/Navigation';
import reportWithoutHasDraftSelector from '@libs/OnyxSelectors/reportWithoutHasDraftSelector';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import reportPropTypes from '@pages/reportPropTypes';
import * as Link from '@userActions/Link';
import * as Report from '@userActions/Report';
import * as Session from '@userActions/Session';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /** Toggles the navigationMenu open and closed */
    onNavigationMenuButtonClicked: PropTypes.func.isRequired,

    /** The report currently being looked at */
    report: reportPropTypes,

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** Onyx Props */
    parentReport: reportPropTypes,

    /** URL to the assigned guide's appointment booking calendar */
    guideCalendarLink: PropTypes.string,

    /** Current user session */
    session: PropTypes.shape({
        accountID: PropTypes.number,
    }),

    /** The current policy of the report */
    policy: PropTypes.shape({
        /** The policy name */
        name: PropTypes.string,

        /** The URL for the policy avatar */
        avatar: PropTypes.string,

        /** The id of the policy */
        id: PropTypes.string,
    }),

    /** The reportID of the request */
    reportID: PropTypes.string.isRequired,
};

const defaultProps = {
    personalDetails: {},
    report: null,
    guideCalendarLink: null,
    parentReport: {},
    session: {
        accountID: 0,
    },
    policy: {},
};

function HeaderView(props) {
    const [isDeleteTaskConfirmModalVisible, setIsDeleteTaskConfirmModalVisible] = React.useState(false);
    const {isSmallScreenWidth, windowWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const isSelfDM = ReportUtils.isSelfDM(props.report);
    // Currently, currentUser is not included in participantAccountIDs, so for selfDM, we need to add the currentUser as participants.
    const participants = isSelfDM ? [props.session.accountID] : lodashGet(props.report, 'participantAccountIDs', []);
    const participantPersonalDetails = OptionsListUtils.getPersonalDetailsForAccountIDs(participants, props.personalDetails);
    const isMultipleParticipant = participants.length > 1;
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(participantPersonalDetails, isMultipleParticipant, undefined, isSelfDM);

    const isChatThread = ReportUtils.isChatThread(props.report);
    const isChatRoom = ReportUtils.isChatRoom(props.report);
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(props.report);
    const isTaskReport = ReportUtils.isTaskReport(props.report);
    const reportHeaderData = !isTaskReport && !isChatThread && props.report.parentReportID ? props.parentReport : props.report;
    // Use sorted display names for the title for group chats on native small screen widths
    const title = ReportUtils.isGroupChat(props.report) ? getGroupChatName(props.report) : ReportUtils.getReportName(reportHeaderData);
    const subtitle = ReportUtils.getChatRoomSubtitle(reportHeaderData);
    const parentNavigationSubtitleData = ReportUtils.getParentNavigationSubtitle(reportHeaderData);
    const isConcierge = ReportUtils.hasSingleParticipant(props.report) && _.contains(participants, CONST.ACCOUNT_ID.CONCIERGE);
    const parentReportAction = ReportActionsUtils.getParentReportAction(props.report);
    const isCanceledTaskReport = ReportUtils.isCanceledTaskReport(props.report, parentReportAction);
    const isWhisperAction = ReportActionsUtils.isWhisperAction(parentReportAction);
    const isUserCreatedPolicyRoom = ReportUtils.isUserCreatedPolicyRoom(props.report);
    const isPolicyMember = useMemo(() => !_.isEmpty(props.policy), [props.policy]);
    const canLeaveRoom = ReportUtils.canLeaveRoom(props.report, isPolicyMember);
    const reportDescription = ReportUtils.getReportDescriptionText(props.report);
    const policyName = ReportUtils.getPolicyName(props.report, true);
    const policyDescription = ReportUtils.getPolicyDescriptionText(props.policy);
    const isPersonalExpenseChat = isPolicyExpenseChat && ReportUtils.isCurrentUserSubmitter(props.report.reportID);
    const shouldShowSubtitle = () => {
        if (_.isEmpty(subtitle)) {
            return false;
        }
        if (isChatRoom) {
            return _.isEmpty(reportDescription);
        }
        if (isPolicyExpenseChat) {
            return _.isEmpty(policyDescription);
        }
        return true;
    };

    // We hide the button when we are chatting with an automated Expensify account since it's not possible to contact
    // these users via alternative means. It is possible to request a call with Concierge so we leave the option for them.
    const threeDotMenuItems = [];
    if (isTaskReport && !isCanceledTaskReport) {
        const canModifyTask = Task.canModifyTask(props.report, props.session.accountID);

        // Task is marked as completed
        if (ReportUtils.isCompletedTaskReport(props.report) && canModifyTask) {
            threeDotMenuItems.push({
                icon: Expensicons.Checkmark,
                text: translate('task.markAsIncomplete'),
                onSelected: Session.checkIfActionIsAllowed(() => Task.reopenTask(props.report)),
            });
        }

        // Task is not closed
        if (props.report.stateNum !== CONST.REPORT.STATE_NUM.APPROVED && props.report.statusNum !== CONST.REPORT.STATUS_NUM.CLOSED && canModifyTask) {
            threeDotMenuItems.push({
                icon: Expensicons.Trashcan,
                text: translate('common.delete'),
                onSelected: () => setIsDeleteTaskConfirmModalVisible(true),
            });
        }
    }

    const join = Session.checkIfActionIsAllowed(() =>
        Report.updateNotificationPreference(
            props.reportID,
            props.report.notificationPreference,
            CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
            false,
            props.report.parentReportID,
            props.report.parentReportActionID,
        ),
    );

    const canJoinOrLeave = isChatThread || !isSelfDM || isUserCreatedPolicyRoom || canLeaveRoom;
    const canJoin = canJoinOrLeave && !isWhisperAction && props.report.notificationPreference === CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN;
    const canLeave = canJoinOrLeave && ((isChatThread && props.report.notificationPreference.length) || isUserCreatedPolicyRoom || canLeaveRoom);
    if (canJoin) {
        threeDotMenuItems.push({
            icon: Expensicons.ChatBubbles,
            text: translate('common.join'),
            onSelected: join,
        });
    } else if (canLeave) {
        const isWorkspaceMemberLeavingWorkspaceRoom = !isChatThread && lodashGet(props.report, 'visibility', '') === CONST.REPORT.VISIBILITY.RESTRICTED && isPolicyMember;
        threeDotMenuItems.push({
            icon: Expensicons.ChatBubbles,
            text: translate('common.leave'),
            onSelected: Session.checkIfActionIsAllowed(() => Report.leaveRoom(props.reportID, isWorkspaceMemberLeavingWorkspaceRoom)),
        });
    }

    const joinButton = (
        <Button
            success
            medium
            text={translate('common.join')}
            onPress={join}
        />
    );

    const renderAdditionalText = () => {
        if (shouldShowSubtitle() || isPersonalExpenseChat || _.isEmpty(policyName) || !_.isEmpty(parentNavigationSubtitleData) || isSelfDM) {
            return null;
        }
        return (
            <>
                <Text style={[styles.sidebarLinkText, styles.textLabelSupporting, styles.fontWeightNormal]}> {translate('threads.in')} </Text>
                <Text style={[styles.sidebarLinkText, styles.textLabelSupporting, styles.textStrong]}>{policyName}</Text>
            </>
        );
    };

    threeDotMenuItems.push(HeaderUtils.getPinMenuItem(props.report));

    if (isConcierge && props.guideCalendarLink) {
        threeDotMenuItems.push({
            icon: Expensicons.Phone,
            text: translate('videoChatButtonAndMenu.tooltip'),
            onSelected: Session.checkIfActionIsAllowed(() => {
                Link.openExternalLink(props.guideCalendarLink);
            }),
        });
    }

    const shouldShowThreeDotsButton = !!threeDotMenuItems.length;

    const shouldShowSubscript = ReportUtils.shouldReportShowSubscript(props.report);
    const defaultSubscriptSize = ReportUtils.isExpenseRequest(props.report) ? CONST.AVATAR_SIZE.SMALL_NORMAL : CONST.AVATAR_SIZE.DEFAULT;
    const icons = ReportUtils.getIcons(reportHeaderData, props.personalDetails);
    const brickRoadIndicator = ReportUtils.hasReportNameError(props.report) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
    const shouldShowBorderBottom = !isTaskReport || !isSmallScreenWidth;
    const shouldDisableDetailPage = ReportUtils.shouldDisableDetailPage(props.report);

    const isLoading = !props.report || !props.report.reportID || !title;

    return (
        <View
            style={[shouldShowBorderBottom && styles.borderBottom]}
            dataSet={{dragArea: true}}
        >
            <View style={[styles.appContentHeader, !isSmallScreenWidth && styles.headerBarDesktopHeight]}>
                <View style={[styles.appContentHeaderTitle, !isSmallScreenWidth && !isLoading && styles.pl5]}>
                    {isLoading ? (
                        <ReportHeaderSkeletonView onBackButtonPress={props.onNavigationMenuButtonClicked} />
                    ) : (
                        <>
                            {isSmallScreenWidth && (
                                <PressableWithoutFeedback
                                    onPress={props.onNavigationMenuButtonClicked}
                                    style={[styles.LHNToggle]}
                                    accessibilityHint={translate('accessibilityHints.navigateToChatsList')}
                                    accessibilityLabel={translate('common.back')}
                                    role={CONST.ROLE.BUTTON}
                                >
                                    <Tooltip
                                        text={translate('common.back')}
                                        shiftVertical={4}
                                    >
                                        <View>
                                            <Icon
                                                src={Expensicons.BackArrow}
                                                fill={theme.icon}
                                            />
                                        </View>
                                    </Tooltip>
                                </PressableWithoutFeedback>
                            )}
                            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                <PressableWithoutFeedback
                                    onPress={() => ReportUtils.navigateToDetailsPage(props.report)}
                                    style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}
                                    disabled={shouldDisableDetailPage}
                                    accessibilityLabel={title}
                                    role={CONST.ROLE.BUTTON}
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
                                            renderAdditionalText={renderAdditionalText}
                                        />
                                        {!_.isEmpty(parentNavigationSubtitleData) && (
                                            <ParentNavigationSubtitle
                                                parentNavigationSubtitleData={parentNavigationSubtitleData}
                                                parentReportID={props.report.parentReportID}
                                                pressableStyles={[styles.alignSelfStart, styles.mw100]}
                                            />
                                        )}
                                        {shouldShowSubtitle() && (
                                            <Text
                                                style={[styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting]}
                                                numberOfLines={1}
                                            >
                                                {subtitle}
                                            </Text>
                                        )}
                                        {isChatRoom && !_.isEmpty(reportDescription) && _.isEmpty(parentNavigationSubtitleData) && (
                                            <PressableWithoutFeedback
                                                onPress={() => {
                                                    if (ReportUtils.canEditReportDescription(props.report, props.policy)) {
                                                        Navigation.navigate(ROUTES.REPORT_DESCRIPTION.getRoute(props.reportID));
                                                        return;
                                                    }
                                                    Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(props.reportID));
                                                }}
                                                style={[styles.alignSelfStart, styles.mw100]}
                                                accessibilityLabel={translate('reportDescriptionPage.roomDescription')}
                                            >
                                                <Text
                                                    style={[styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting]}
                                                    numberOfLines={1}
                                                >
                                                    {reportDescription}
                                                </Text>
                                            </PressableWithoutFeedback>
                                        )}
                                        {isPolicyExpenseChat && !_.isEmpty(policyDescription) && _.isEmpty(parentNavigationSubtitleData) && (
                                            <PressableWithoutFeedback
                                                onPress={() => {
                                                    if (ReportUtils.canEditPolicyDescription(props.policy)) {
                                                        Navigation.navigate(ROUTES.WORKSPACE_PROFILE_DESCRIPTION.getRoute(props.report.policyID));
                                                        return;
                                                    }
                                                    Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(props.reportID));
                                                }}
                                                style={[styles.alignSelfStart, styles.mw100]}
                                                accessibilityLabel={translate('workspace.editor.descriptionInputLabel')}
                                            >
                                                <Text
                                                    style={[styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting]}
                                                    numberOfLines={1}
                                                >
                                                    {policyDescription}
                                                </Text>
                                            </PressableWithoutFeedback>
                                        )}
                                    </View>
                                    {brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR && (
                                        <View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>
                                            <Icon
                                                src={Expensicons.DotIndicator}
                                                fill={theme.danger}
                                            />
                                        </View>
                                    )}
                                </PressableWithoutFeedback>
                                <View style={[styles.reportOptions, styles.flexRow, styles.alignItemsCenter]}>
                                    {isTaskReport && !isSmallScreenWidth && ReportUtils.isOpenTaskReport(props.report) && <TaskHeaderActionButton report={props.report} />}
                                    {canJoin && !isSmallScreenWidth && joinButton}
                                    {shouldShowThreeDotsButton && (
                                        <ThreeDotsMenu
                                            anchorPosition={styles.threeDotsPopoverOffset(windowWidth)}
                                            menuItems={threeDotMenuItems}
                                            shouldSetModalVisibility={false}
                                        />
                                    )}
                                </View>
                            </View>
                            <ConfirmModal
                                isVisible={isDeleteTaskConfirmModalVisible}
                                onConfirm={() => {
                                    setIsDeleteTaskConfirmModalVisible(false);
                                    Session.checkIfActionIsAllowed(Task.deleteTask(props.reportID, props.report.reportName, props.report.stateNum, props.report.statusNum));
                                }}
                                onCancel={() => setIsDeleteTaskConfirmModalVisible(false)}
                                title={translate('task.deleteTask')}
                                prompt={translate('task.deleteConfirmation')}
                                confirmText={translate('common.delete')}
                                cancelText={translate('common.cancel')}
                                danger
                            />
                        </>
                    )}
                </View>
            </View>
            {!isLoading && canJoin && isSmallScreenWidth && <View style={[styles.ph5, styles.pb2]}>{joinButton}</View>}
        </View>
    );
}
HeaderView.propTypes = propTypes;
HeaderView.displayName = 'HeaderView';
HeaderView.defaultProps = defaultProps;

export default memo(
    withOnyx({
        guideCalendarLink: {
            key: ONYXKEYS.ACCOUNT,
            selector: (account) => (account && account.guideCalendarLink) || null,
            initialValue: null,
        },
        parentReport: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID || report.reportID}`,
            selector: reportWithoutHasDraftSelector,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '0'}`,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
    })(HeaderView),
);
