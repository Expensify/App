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
import OfflineWithFeedback from '@components/OfflineWithFeedback';
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

    /** The reportID of the current report */
    reportID: string;

    /** Whether we should display the header as in narrow layout */
    shouldUseNarrowLayout?: boolean;
};

function HeaderView({
    report,
    personalDetails,
    parentReport,
    parentReportAction,
    policy,
    session,
    reportID,
    guideCalendarLink,
    onNavigationMenuButtonClicked,
    shouldUseNarrowLayout = false,
}: HeaderViewProps) {
    const [isDeleteTaskConfirmModalVisible, setIsDeleteTaskConfirmModalVisible] = React.useState(false);
    const {windowWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const isSelfDM = ReportUtils.isSelfDM(report);
    const isGroupChat = ReportUtils.isGroupChat(report) || ReportUtils.isDeprecatedGroupDM(report);
    const isOneOnOneChat = ReportUtils.isOneOnOneChat(report);

    // For 1:1 chat, we don't want to include currentUser as participants in order to not mark 1:1 chats as having multiple participants
    const participants = Object.keys(report?.participants ?? {})
        .map(Number)
        .filter((accountID) => accountID !== session?.accountID || !isOneOnOneChat)
        .slice(0, 5);
    const isMultipleParticipant = participants.length > 1;

    const participantPersonalDetails = OptionsListUtils.getPersonalDetailsForAccountIDs(participants, personalDetails);
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(participantPersonalDetails, isMultipleParticipant, undefined, isSelfDM);

    const isChatThread = ReportUtils.isChatThread(report);
    const isChatRoom = ReportUtils.isChatRoom(report);
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(report);
    const isTaskReport = ReportUtils.isTaskReport(report);
    const reportHeaderData = !isTaskReport && !isChatThread && report.parentReportID ? parentReport : report;
    // Use sorted display names for the title for group chats on native small screen widths
    const title = ReportUtils.getReportName(reportHeaderData);
    const subtitle = ReportUtils.getChatRoomSubtitle(reportHeaderData);
    const parentNavigationSubtitleData = ReportUtils.getParentNavigationSubtitle(reportHeaderData);
    const isConcierge = ReportUtils.isConciergeChatReport(report);
    const isCanceledTaskReport = ReportUtils.isCanceledTaskReport(report, parentReportAction);
    const isPolicyEmployee = useMemo(() => !isEmptyObject(policy), [policy]);
    const reportDescription = ReportUtils.getReportDescriptionText(report);
    const policyName = ReportUtils.getPolicyName(report, true);
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
        if (ReportUtils.canWriteInReport(report) && report.stateNum !== CONST.REPORT.STATE_NUM.APPROVED && !ReportUtils.isClosedReport(report) && canModifyTask) {
            threeDotMenuItems.push({
                icon: Expensicons.Trashcan,
                text: translate('common.delete'),
                onSelected: Session.checkIfActionIsAllowed(() => setIsDeleteTaskConfirmModalVisible(true)),
            });
        }
    }

    const join = Session.checkIfActionIsAllowed(() => Report.joinRoom(report));

    const canJoin = ReportUtils.canJoinChat(report, parentReportAction, policy);
    if (canJoin) {
        threeDotMenuItems.push({
            icon: Expensicons.ChatBubbles,
            text: translate('common.join'),
            onSelected: join,
        });
    } else if (ReportUtils.canLeaveChat(report, policy)) {
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
    const shouldShowBorderBottom = !isTaskReport || !shouldUseNarrowLayout;
    const shouldDisableDetailPage = ReportUtils.shouldDisableDetailPage(report);
    const shouldUseGroupTitle = isGroupChat && (!!report?.reportName || !isMultipleParticipant);
    const isLoading = !report.reportID || !title;

    return (
        <View
            style={[shouldShowBorderBottom && styles.borderBottom]}
            dataSet={{dragArea: true}}
        >
            <View style={[styles.appContentHeader, !shouldUseNarrowLayout && styles.headerBarDesktopHeight]}>
                <View style={[styles.appContentHeaderTitle, !shouldUseNarrowLayout && !isLoading && styles.pl5]}>
                    {isLoading ? (
                        <ReportHeaderSkeletonView onBackButtonPress={onNavigationMenuButtonClicked} />
                    ) : (
                        <>
                            {shouldUseNarrowLayout && (
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
                                        <OfflineWithFeedback pendingAction={report.pendingFields?.avatar}>
                                            <MultipleAvatars
                                                icons={icons}
                                                shouldShowTooltip={!isChatRoom || isChatThread}
                                            />
                                        </OfflineWithFeedback>
                                    )}
                                    <View style={[styles.flex1, styles.flexColumn]}>
                                        <DisplayNames
                                            fullTitle={title}
                                            displayNamesWithTooltips={displayNamesWithTooltips}
                                            tooltipEnabled
                                            numberOfLines={1}
                                            textStyles={[styles.headerText, styles.pre]}
                                            shouldUseFullTitle={isChatRoom || isPolicyExpenseChat || isChatThread || isTaskReport || shouldUseGroupTitle}
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
                                    {isTaskReport && !shouldUseNarrowLayout && ReportUtils.isOpenTaskReport(report, parentReportAction) && <TaskHeaderActionButton report={report} />}
                                    {canJoin && !shouldUseNarrowLayout && joinButton}
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
            {!isLoading && canJoin && shouldUseNarrowLayout && <View style={[styles.ph5, styles.pb2]}>{joinButton}</View>}
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
