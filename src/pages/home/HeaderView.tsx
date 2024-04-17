import React, {memo, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import DisplayNames from '@components/DisplayNames';
import type {ThreeDotsMenuItem} from '@components/HeaderWithBackButton/types';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MultipleAvatars from '@components/MultipleAvatars';
import ParentNavigationSubtitle from '@components/ParentNavigationSubtitle';
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
import * as HeaderUtils from '@libs/HeaderUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as Link from '@userActions/Link';
import * as Report from '@userActions/Report';
import * as Session from '@userActions/Session';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type HeaderViewOnyxProps = {
    /** URL to the assigned guide's appointment booking calendar */
    guideCalendarLink: OnyxEntry<string>;

    /** Current user session */
    session: OnyxEntry<OnyxTypes.Session>;

    /** Personal details of all the users */
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;

    /** Parent report */
    parentReport: OnyxEntry<OnyxTypes.Report>;

    /** The current policy of the report */
    policy: OnyxEntry<OnyxTypes.Policy>;
};

type HeaderViewProps = HeaderViewOnyxProps & {
    /** Toggles the navigationMenu open and closed */
    onNavigationMenuButtonClicked: () => void;

    /** The report currently being looked at */
    report: OnyxTypes.Report;

    /** The report action the transaction is tied to from the parent report */
    parentReportAction: OnyxEntry<OnyxTypes.ReportAction>;

    /** The reportID of the request */
    reportID: string;
};

function HeaderView({report, personalDetails, parentReport, parentReportAction, policy, session, reportID, guideCalendarLink, onNavigationMenuButtonClicked}: HeaderViewProps) {
    const [isDeleteTaskConfirmModalVisible, setIsDeleteTaskConfirmModalVisible] = React.useState(false);
    const {isSmallScreenWidth, windowWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const isSelfDM = ReportUtils.isSelfDM(report);
    const isGroupChat = ReportUtils.isGroupChat(report) || ReportUtils.isDeprecatedGroupDM(report);
    // Currently, currentUser is not included in participantAccountIDs, so for selfDM, we need to add the currentUser as participants.
    const participants = isSelfDM ? [session?.accountID ?? -1] : (report?.participantAccountIDs ?? []).slice(0, 5);
    const participantPersonalDetails = OptionsListUtils.getPersonalDetailsForAccountIDs(participants, personalDetails);
    const isMultipleParticipant = participants.length > 1;
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(participantPersonalDetails, isMultipleParticipant, undefined, isSelfDM);

    const isChatThread = ReportUtils.isChatThread(report);
    const isChatRoom = ReportUtils.isChatRoom(report);
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(report);
    const isTaskReport = ReportUtils.isTaskReport(report);
    const reportHeaderData = !isTaskReport && !isChatThread && report.parentReportID ? parentReport : report;
    // Use sorted display names for the title for group chats on native small screen widths
    const title = isGroupChat ? ReportUtils.getGroupChatName(undefined, true, report.reportID ?? '') : ReportUtils.getReportName(reportHeaderData);
    const subtitle = ReportUtils.getChatRoomSubtitle(reportHeaderData);
    const parentNavigationSubtitleData = ReportUtils.getParentNavigationSubtitle(reportHeaderData);
    const isConcierge = ReportUtils.hasSingleParticipant(report) && participants.includes(CONST.ACCOUNT_ID.CONCIERGE);
    const isCanceledTaskReport = ReportUtils.isCanceledTaskReport(report, parentReportAction);
    const isWhisperAction = ReportActionsUtils.isWhisperAction(parentReportAction);
    const isUserCreatedPolicyRoom = ReportUtils.isUserCreatedPolicyRoom(report);
    const isPolicyEmployee = useMemo(() => !isEmptyObject(policy), [policy]);
    const canLeaveRoom = ReportUtils.canLeaveRoom(report, isPolicyEmployee);
    const reportDescription = ReportUtils.getReportDescriptionText(report);
    const policyName = ReportUtils.getPolicyName(report, true);
    const canLeavePolicyExpenseChat = ReportUtils.canLeavePolicyExpenseChat(report, policy);
    const policyDescription = ReportUtils.getPolicyDescriptionText(policy);
    const isPersonalExpenseChat = isPolicyExpenseChat && ReportUtils.isCurrentUserSubmitter(report.reportID);
    const shouldShowSubtitle = () => {
        if (!subtitle) {
            return false;
        }
        if (isChatRoom) {
            return !reportDescription;
        }
        if (isPolicyExpenseChat) {
            return !policyDescription;
        }
        return true;
    };

    // We hide the button when we are chatting with an automated Expensify account since it's not possible to contact
    // these users via alternative means. It is possible to request a call with Concierge so we leave the option for them.
    const threeDotMenuItems: ThreeDotsMenuItem[] = [];
    if (isTaskReport && !isCanceledTaskReport) {
        const canModifyTask = Task.canModifyTask(report, session?.accountID ?? -1);

        // Task is marked as completed
        if (ReportUtils.isCompletedTaskReport(report) && canModifyTask) {
            threeDotMenuItems.push({
                icon: Expensicons.Checkmark,
                text: translate('task.markAsIncomplete'),
                onSelected: Session.checkIfActionIsAllowed(() => Task.reopenTask(report)),
            });
        }

        // Task is not closed
        if (report.stateNum !== CONST.REPORT.STATE_NUM.APPROVED && report.statusNum !== CONST.REPORT.STATUS_NUM.CLOSED && canModifyTask) {
            threeDotMenuItems.push({
                icon: Expensicons.Trashcan,
                text: translate('common.delete'),
                onSelected: Session.checkIfActionIsAllowed(() => setIsDeleteTaskConfirmModalVisible(true)),
            });
        }
    }

    const join = Session.checkIfActionIsAllowed(() =>
        Report.updateNotificationPreference(reportID, report.notificationPreference, CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS, false, report.parentReportID, report.parentReportActionID),
    );

    const canJoinOrLeave = !isSelfDM && !isGroupChat && (isChatThread || isUserCreatedPolicyRoom || canLeaveRoom || canLeavePolicyExpenseChat);
    const canJoin = canJoinOrLeave && !isWhisperAction && report.notificationPreference === CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN;
    const canLeave = canJoinOrLeave && ((isChatThread && !!report.notificationPreference?.length) || isUserCreatedPolicyRoom || canLeaveRoom || canLeavePolicyExpenseChat);
    if (canJoin) {
        threeDotMenuItems.push({
            icon: Expensicons.ChatBubbles,
            text: translate('common.join'),
            onSelected: join,
        });
    } else if (canLeave) {
        const isWorkspaceMemberLeavingWorkspaceRoom = !isChatThread && (report.visibility === CONST.REPORT.VISIBILITY.RESTRICTED || isPolicyExpenseChat) && isPolicyEmployee;
        threeDotMenuItems.push({
            icon: Expensicons.ChatBubbles,
            text: translate('common.leave'),
            onSelected: Session.checkIfActionIsAllowed(() => Report.leaveRoom(reportID, isWorkspaceMemberLeavingWorkspaceRoom)),
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
        if (shouldShowSubtitle() || isPersonalExpenseChat || !policyName || !isEmptyObject(parentNavigationSubtitleData) || isSelfDM) {
            return null;
        }
        return (
            <>
                <Text style={[styles.sidebarLinkText, styles.textLabelSupporting, styles.fontWeightNormal]}> {translate('threads.in')} </Text>
                <Text style={[styles.sidebarLinkText, styles.textLabelSupporting, styles.textStrong]}>{policyName}</Text>
            </>
        );
    };

    threeDotMenuItems.push(HeaderUtils.getPinMenuItem(report));

    if (isConcierge && guideCalendarLink) {
        threeDotMenuItems.push({
            icon: Expensicons.Phone,
            text: translate('videoChatButtonAndMenu.tooltip'),
            onSelected: Session.checkIfActionIsAllowed(() => {
                Link.openExternalLink(guideCalendarLink);
            }),
        });
    }

    const shouldShowThreeDotsButton = !!threeDotMenuItems.length;

    const shouldShowSubscript = ReportUtils.shouldReportShowSubscript(report);
    const defaultSubscriptSize = ReportUtils.isExpenseRequest(report) ? CONST.AVATAR_SIZE.SMALL_NORMAL : CONST.AVATAR_SIZE.DEFAULT;
    const icons = ReportUtils.getIcons(reportHeaderData, personalDetails);
    const brickRoadIndicator = ReportUtils.hasReportNameError(report) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
    const shouldShowBorderBottom = !isTaskReport || !isSmallScreenWidth;
    const shouldDisableDetailPage = ReportUtils.shouldDisableDetailPage(report);

    const isLoading = !report.reportID || !title;

    return (
        <View
            style={[shouldShowBorderBottom && styles.borderBottom]}
            dataSet={{dragArea: true}}
        >
            <View style={[styles.appContentHeader, !isSmallScreenWidth && styles.headerBarDesktopHeight]}>
                <View style={[styles.appContentHeaderTitle, !isSmallScreenWidth && !isLoading && styles.pl5]}>
                    {isLoading ? (
                        <ReportHeaderSkeletonView onBackButtonPress={onNavigationMenuButtonClicked} />
                    ) : (
                        <>
                            {isSmallScreenWidth && (
                                <PressableWithoutFeedback
                                    onPress={onNavigationMenuButtonClicked}
                                    style={styles.LHNToggle}
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
                                    onPress={() => ReportUtils.navigateToDetailsPage(report)}
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
                                            shouldUseFullTitle={isChatRoom || isPolicyExpenseChat || isChatThread || isTaskReport || isGroupChat}
                                            renderAdditionalText={renderAdditionalText}
                                        />
                                        {!isEmptyObject(parentNavigationSubtitleData) && (
                                            <ParentNavigationSubtitle
                                                parentNavigationSubtitleData={parentNavigationSubtitleData}
                                                parentReportID={report.parentReportID}
                                                parentReportActionID={report.parentReportActionID}
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
                                        {isChatRoom && !!reportDescription && isEmptyObject(parentNavigationSubtitleData) && (
                                            <PressableWithoutFeedback
                                                onPress={() => {
                                                    if (ReportUtils.canEditReportDescription(report, policy)) {
                                                        Navigation.navigate(ROUTES.REPORT_DESCRIPTION.getRoute(reportID));
                                                        return;
                                                    }
                                                    Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID));
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
                                        {isPolicyExpenseChat && !!policyDescription && isEmptyObject(parentNavigationSubtitleData) && (
                                            <PressableWithoutFeedback
                                                onPress={() => {
                                                    if (ReportUtils.canEditPolicyDescription(policy)) {
                                                        Navigation.navigate(ROUTES.WORKSPACE_PROFILE_DESCRIPTION.getRoute(report.policyID ?? ''));
                                                        return;
                                                    }
                                                    Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID));
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
                                    {isTaskReport && !isSmallScreenWidth && ReportUtils.isOpenTaskReport(report, parentReportAction) && <TaskHeaderActionButton report={report} />}
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
                                    Task.deleteTask(report);
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

HeaderView.displayName = 'HeaderView';

export default memo(
    withOnyx<HeaderViewProps, HeaderViewOnyxProps>({
        guideCalendarLink: {
            key: ONYXKEYS.ACCOUNT,
            selector: (account) => account?.guideCalendarLink ?? null,
            initialValue: null,
        },
        parentReport: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID ?? report?.reportID}`,
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
