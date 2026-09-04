import MenuItem from '@components/MenuItem';
import {ModalActions} from '@components/Modal/Global/ModalContext';

import useActivePolicy from '@hooks/useActivePolicy';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLastWorkspaceNumber from '@hooks/useLastWorkspaceNumber';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {generateDefaultWorkspaceName} from '@libs/actions/Policy/Policy';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import Navigation from '@libs/Navigation/Navigation';
import Permissions from '@libs/Permissions';
import {isPolicyAdmin as isPolicyAdminUtil, isPolicyEmployee as isPolicyEmployeeUtil, shouldShowPolicy} from '@libs/PolicyUtils';
import {getTrackExpenseActionableWhisper} from '@libs/ReportActionsUtils';
import {
    canLeaveChat,
    createDraftTransactionAndNavigateToParticipantSelector,
    getParticipantsAccountIDsForDisplay,
    getParticipantsList,
    isArchivedNonExpenseReport,
    isCanceledTaskReport as isCanceledTaskReportUtil,
    isChatRoom as isChatRoomUtil,
    isChatThread as isChatThreadUtil,
    isCompletedTaskReport,
    isConciergeChatReport,
    isDefaultRoom as isDefaultRoomUtil,
    isGroupChat as isGroupChatUtil,
    isHiddenForCurrentUser,
    isInvoiceReport as isInvoiceReportUtil,
    isMoneyRequestReport as isMoneyRequestReportUtil,
    isPolicyExpenseChat as isPolicyExpenseChatUtil,
    isPublicRoom,
    isRootGroupChat as isRootGroupChatUtil,
    isSelfDM as isSelfDMUtil,
    isSystemChat as isSystemChatUtil,
    isTaskReport as isTaskReportUtil,
    isTrackExpenseReportNew,
    isUserCreatedPolicyRoom as isUserCreatedPolicyRoomUtil,
    isWorkspaceMemberLeavingWorkspaceRoom,
    navigateToPrivateNotes,
} from '@libs/ReportUtils';
import {getOriginalTransactionWithSplitInfo} from '@libs/TransactionUtils';

import {hasErrorInPrivateNotes, leaveGroupChat, leaveRoom} from '@userActions/Report';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';
import {canActionTask, reopenTask} from '@userActions/Task';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Policy, Report, ReportAction, ReportActions, ReportMetadata, Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useFocusEffect} from '@react-navigation/native';
import {delegateEmailSelector} from '@selectors/Account';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import {createFilteredPoliciesInfoSelector, createHasWorkspaceToSubmitToSelector} from '@selectors/Policy';
import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import React, {useState} from 'react';

import type {DynamicReportDetailsPageMenuItem} from './types';

type ReportDetailsMenuItemsProps = {
    report: Report;
    policy: OnyxEntry<Policy>;
    parentReport: OnyxEntry<Report>;
    parentReportAction: OnyxEntry<ReportAction>;
    reportMetadata: OnyxEntry<ReportMetadata>;

    /** Whether the request action the page acts on has been deleted */
    isDeletedParentAction: boolean;
    iouTransactionID: string | undefined;
    iouTransaction: OnyxEntry<Transaction>;
    iouOriginalTransaction: OnyxEntry<Transaction>;
    moneyRequestReportID: string | undefined;
    moneyRequestReportActions: OnyxEntry<ReportActions>;

    /** The report from which a tracked expense would be submitted/categorized/shared, and its actions */
    actionReportID: string | undefined;
    actionReportActions: OnyxEntry<ReportActions>;
};

function ReportDetailsMenuItems({
    report,
    policy,
    parentReport,
    parentReportAction,
    reportMetadata,
    isDeletedParentAction,
    iouTransactionID,
    iouTransaction,
    iouOriginalTransaction,
    moneyRequestReportID,
    moneyRequestReportActions,
    actionReportID,
    actionReportActions,
}: ReportDetailsMenuItemsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Users', 'Gear', 'Send', 'Folder', 'UserPlus', 'Pencil', 'Checkmark', 'Building', 'Exit', 'Bug', 'Hashtag']);
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {isRestrictedToPreferredPolicy, preferredPolicyID} = usePreferredPolicy();
    const activePolicy = useActivePolicy();
    const lastWorkspaceNumber = useLastWorkspaceNumber();
    const navigateBackFromReportDetailsPath = useDynamicBackPath(DYNAMIC_ROUTES.REPORT_DETAILS.path);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {showConfirmModal} = useConfirmModal();

    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [isDebugModeEnabled = false] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const filteredPoliciesInfoSelector = createFilteredPoliciesInfoSelector(currentUserPersonalDetails?.email);
    const [filteredPoliciesInfo] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: filteredPoliciesInfoSelector});
    const hasWorkspaceToSubmitToSelector = createHasWorkspaceToSubmitToSelector(currentUserPersonalDetails.login);
    const [hasWorkspaceToSubmitTo] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: hasWorkspaceToSubmitToSelector});

    const isReportArchived = useReportIsArchived(report?.reportID);
    const isParentReportArchived = useReportIsArchived(parentReport?.reportID);

    // Snapshot on focus whether the room is the screen behind the Details page, so the row doesn't flip while the page
    // is closing after it's tapped, yet still reflects the correct screen on later visits.
    const [isRoomCurrentlyOpen, setIsRoomCurrentlyOpen] = useState(() => isReportTopmostSplitNavigator() && Navigation.getTopmostReportId() === report?.reportID);
    useFocusEffect(() => {
        setIsRoomCurrentlyOpen(isReportTopmostSplitNavigator() && Navigation.getTopmostReportId() === report?.reportID);
    });

    const isPolicyAdmin = isPolicyAdminUtil(policy);
    const isPolicyEmployee = isPolicyEmployeeUtil(report?.policyID, policy);
    const isPolicyExpenseChat = isPolicyExpenseChatUtil(report);
    const isChatRoom = isChatRoomUtil(report);
    const isUserCreatedPolicyRoom = isUserCreatedPolicyRoomUtil(report);
    const isDefaultRoom = isDefaultRoomUtil(report);
    const isChatThread = isChatThreadUtil(report);
    const isMoneyRequestReport = isMoneyRequestReportUtil(report);
    const isInvoiceReport = isInvoiceReportUtil(report);
    const isTaskReport = isTaskReportUtil(report);
    const isSelfDM = isSelfDMUtil(report);
    const isSystemChat = isSystemChatUtil(report);
    const isGroupChat = isGroupChatUtil(report);
    const isRootGroupChat = isRootGroupChatUtil(report, isReportArchived);
    const isArchivedRoom = isArchivedNonExpenseReport(report, isReportArchived);
    const isTrackExpenseReport = isTrackExpenseReportNew(report, parentReport, parentReportAction);
    const isCanceledTaskReport = isCanceledTaskReportUtil(report, parentReportAction);
    const isTaskActionable = canActionTask(report, parentReportAction, currentUserPersonalDetails?.accountID, parentReport, isParentReportArchived);

    const shouldOpenRoomMembersPage = isUserCreatedPolicyRoom || isChatThread || (isPolicyExpenseChat && isPolicyAdmin);
    const participants = getParticipantsList(report, personalDetails, shouldOpenRoomMembersPage);
    // Get the active chat members by filtering out the pending members with delete action
    const activeChatMembers = participants.flatMap((accountID) => {
        const pendingMember = reportMetadata?.pendingChatMembers?.findLast((member) => member.accountID === accountID.toString());
        const detail = personalDetails?.[accountID];
        if (!detail) {
            return [];
        }
        return pendingMember?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ? accountID : [];
    });

    const shouldShowLeaveButton = canLeaveChat(report, policy, currentUserPersonalDetails?.accountID, !!reportNameValuePairs?.private_isArchived);
    const shouldShowGoToRoom = (isChatRoom || isPolicyExpenseChat) && !isRoomCurrentlyOpen;
    const shouldShowGoToWorkspace = shouldShowPolicy(policy, false, currentUserPersonalDetails?.email) && !policy?.isJoinRequestPending && !shouldShowGoToRoom;
    const shouldShowNotificationPref = !isMoneyRequestReport && !isHiddenForCurrentUser(report);
    const shouldShowWriteCapability = !isMoneyRequestReport;
    const shouldShowMenuItem = shouldShowNotificationPref || shouldShowWriteCapability || (!!report?.visibility && report.chatType !== CONST.REPORT.CHAT_TYPE.INVOICE);

    const leaveChat = () => {
        if (isRootGroupChat) {
            leaveGroupChat(
                report,
                quickAction?.chatReportID?.toString() === report.reportID,
                currentUserPersonalDetails.accountID,
                conciergeReportID,
                introSelected,
                isSelfTourViewed,
                betas,
            );
            return;
        }

        const isMemberLeavingWorkspaceRoom = isWorkspaceMemberLeavingWorkspaceRoom(report, isPolicyEmployee, isPolicyAdmin);
        leaveRoom(report, currentUserPersonalDetails.accountID, conciergeReportID, introSelected, isSelfTourViewed, betas, isMemberLeavingWorkspaceRoom);
    };

    const showLastMemberLeavingModal = async () => {
        const {action} = await showConfirmModal({
            title: translate('groupChat.lastMemberTitle'),
            prompt: translate('groupChat.lastMemberWarning'),
            confirmText: translate('common.leave'),
            cancelText: translate('common.cancel'),
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
            shouldHandleNavigationBack: false,
        });
        if (action !== ModalActions.CONFIRM) {
            return;
        }
        leaveChat();
    };

    const items: DynamicReportDetailsPageMenuItem[] = [];

    if (isSelfDM || isArchivedRoom) {
        return null;
    }

    if (shouldShowGoToRoom) {
        items.push({
            key: CONST.REPORT_DETAILS_MENU_ITEM.GO_TO_ROOM,
            translationKey: 'reportDetailsPage.goToRoom',
            icon: expensifyIcons.Hashtag,
            isAnonymousAction: false,
            shouldShowRightIcon: true,
            action: () => {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(report?.reportID));
            },
        });
    }

    // The Members page is only shown when:
    // - The report is a thread in a chat report
    // - The report is not a user created room with participants to show i.e. DM, Group Chat, etc
    // - The report is a user created room and the room and the current user is a workspace member i.e. non-workspace members should not see this option.
    if (
        (isGroupChat ||
            (isDefaultRoom && isChatThread && isPolicyEmployee) ||
            (!isUserCreatedPolicyRoom && participants.length) ||
            (isUserCreatedPolicyRoom && (isPolicyEmployee || (isChatThread && !isPublicRoom(report))))) &&
        !isConciergeChatReport(report, conciergeReportID) &&
        !isSystemChat &&
        activeChatMembers.length > 0
    ) {
        items.push({
            key: CONST.REPORT_DETAILS_MENU_ITEM.MEMBERS,
            translationKey: 'common.members',
            icon: expensifyIcons.Users,
            subtitle: activeChatMembers.length,
            subtitleStyle: [styles.ph2],
            isAnonymousAction: false,
            shouldShowRightIcon: true,
            action: () => {
                if (shouldOpenRoomMembersPage) {
                    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.ROOM_MEMBERS.path));
                } else {
                    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.REPORT_PARTICIPANTS.path));
                }
            },
        });
    } else if ((isUserCreatedPolicyRoom && (!participants.length || !isPolicyEmployee)) || ((isDefaultRoom || isPolicyExpenseChat) && isChatThread && !isPolicyEmployee)) {
        items.push({
            key: CONST.REPORT_DETAILS_MENU_ITEM.INVITE,
            translationKey: 'common.invite',
            icon: expensifyIcons.Users,
            isAnonymousAction: false,
            shouldShowRightIcon: true,
            action: () => {
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.ROOM_INVITE.path));
            },
        });
    }

    if (shouldShowMenuItem) {
        items.push({
            key: CONST.REPORT_DETAILS_MENU_ITEM.SETTINGS,
            translationKey: 'common.settings',
            icon: expensifyIcons.Gear,
            isAnonymousAction: false,
            shouldShowRightIcon: true,
            action: () => {
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.REPORT_SETTINGS.path));
            },
        });
    }

    if (isTrackExpenseReport && !isDeletedParentAction) {
        const whisperAction = getTrackExpenseActionableWhisper(iouTransactionID, moneyRequestReportID, moneyRequestReportActions);
        const actionableWhisperReportActionID = whisperAction?.reportActionID;
        const currentUserLocalCurrency = currentUserPersonalDetails.localCurrencyCode ?? CONST.CURRENCY.USD;
        const {isExpenseSplit: isSelfDMExpenseSplit} = getOriginalTransactionWithSplitInfo(iouTransaction, iouOriginalTransaction);

        // Hide the "Submit it to someone" option for self-DM split expenses when the user isn't a member of any workspace.
        if (!isSelfDMExpenseSplit || hasWorkspaceToSubmitTo) {
            const baseSubmitParams = {
                reportID: actionReportID,
                reportActions: actionReportActions,
                reportActionID: actionableWhisperReportActionID,
                introSelected,
                draftTransactionIDs,
                activePolicy,
                userBillingGracePeriodEnds,
                amountOwed,
                ownerBillingGracePeriodEnd,
                isRestrictedToPreferredPolicy,
                preferredPolicyID,
                transaction: iouTransaction,
                currentUserAccountID: currentUserPersonalDetails.accountID,
                currentUserEmail: currentUserPersonalDetails.email ?? '',
                currentUserLocalCurrency,
                filteredPoliciesCount: filteredPoliciesInfo?.filteredPoliciesCount ?? 0,
                firstPolicyID: filteredPoliciesInfo?.firstPolicyID,
            };
            // "Submit to someone" splits into two destinations here too, matching the track-expense whisper:
            // submit to an individual ("a friend") or a submit-enabled workspace ("my employer").
            const defaultWorkspaceName = generateDefaultWorkspaceName(currentUserPersonalDetails.email ?? '', lastWorkspaceNumber, translate, currentUserPersonalDetails.displayName);

            // Self-DM split expenses can only be submitted to a workspace, so the "a friend" destination is omitted here
            // just like it is on the track-expense whisper.
            if (!isSelfDMExpenseSplit) {
                items.push({
                    key: CONST.REPORT_DETAILS_MENU_ITEM.TRACK.SUBMIT_TO_FRIEND,
                    translationKey: 'actionableMentionTrackExpense.submitToFriend',
                    icon: expensifyIcons.Send,
                    isAnonymousAction: false,
                    shouldShowRightIcon: true,
                    action: () => {
                        createDraftTransactionAndNavigateToParticipantSelector({
                            ...baseSubmitParams,
                            actionName: CONST.IOU.ACTION.SUBMIT,
                            submitDestination: CONST.IOU.SUBMIT_DESTINATION.FRIEND,
                            defaultWorkspaceName,
                        });
                    },
                });
            }
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.TRACK.SUBMIT_TO_EMPLOYER,
                translationKey: 'actionableMentionTrackExpense.submitToEmployer',
                icon: expensifyIcons.Send,
                isAnonymousAction: false,
                shouldShowRightIcon: true,
                action: () => {
                    createDraftTransactionAndNavigateToParticipantSelector({
                        ...baseSubmitParams,
                        actionName: CONST.IOU.ACTION.SUBMIT,
                        submitDestination: CONST.IOU.SUBMIT_DESTINATION.EMPLOYER,
                        defaultWorkspaceName,
                    });
                },
            });
        }
        if (Permissions.canUseTrackFlows()) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.TRACK.CATEGORIZE,
                translationKey: 'actionableMentionTrackExpense.categorize',
                icon: expensifyIcons.Folder,
                isAnonymousAction: false,
                shouldShowRightIcon: true,
                action: () => {
                    createDraftTransactionAndNavigateToParticipantSelector({
                        reportID: actionReportID,
                        reportActions: actionReportActions,
                        actionName: CONST.IOU.ACTION.CATEGORIZE,
                        reportActionID: actionableWhisperReportActionID,
                        introSelected,
                        draftTransactionIDs,
                        activePolicy,
                        userBillingGracePeriodEnds,
                        amountOwed,
                        ownerBillingGracePeriodEnd,
                        transaction: iouTransaction,
                        currentUserAccountID: currentUserPersonalDetails.accountID,
                        currentUserEmail: currentUserPersonalDetails.email ?? '',
                        currentUserLocalCurrency,
                        filteredPoliciesCount: filteredPoliciesInfo?.filteredPoliciesCount ?? 0,
                        firstPolicyID: filteredPoliciesInfo?.firstPolicyID,
                    });
                },
            });
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.TRACK.SHARE,
                translationKey: 'actionableMentionTrackExpense.share',
                icon: expensifyIcons.UserPlus,
                isAnonymousAction: false,
                shouldShowRightIcon: true,
                action: () => {
                    createDraftTransactionAndNavigateToParticipantSelector({
                        reportID: actionReportID,
                        reportActions: actionReportActions,
                        actionName: CONST.IOU.ACTION.SHARE,
                        reportActionID: actionableWhisperReportActionID,
                        introSelected,
                        draftTransactionIDs,
                        activePolicy,
                        userBillingGracePeriodEnds,
                        amountOwed,
                        ownerBillingGracePeriodEnd,
                        transaction: iouTransaction,
                        currentUserAccountID: currentUserPersonalDetails.accountID,
                        currentUserEmail: currentUserPersonalDetails.email ?? '',
                        currentUserLocalCurrency,
                        filteredPoliciesCount: filteredPoliciesInfo?.filteredPoliciesCount ?? 0,
                        firstPolicyID: filteredPoliciesInfo?.firstPolicyID,
                    });
                },
            });
        }
    }

    // Prevent displaying private notes option for threads and task reports, or when the feature is disabled
    if (Permissions.canUsePrivateNotes() && !isChatThread && !isMoneyRequestReport && !isInvoiceReport && !isTaskReport) {
        items.push({
            key: CONST.REPORT_DETAILS_MENU_ITEM.PRIVATE_NOTES,
            translationKey: 'privateNotes.title',
            icon: expensifyIcons.Pencil,
            isAnonymousAction: false,
            shouldShowRightIcon: true,
            action: () => navigateToPrivateNotes(report, currentUserPersonalDetails.accountID),
            brickRoadIndicator: hasErrorInPrivateNotes(report) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        });
    }

    // Show actions related to Task Reports
    if (isTaskReport && !isCanceledTaskReport && isCompletedTaskReport(report) && isTaskActionable) {
        items.push({
            key: CONST.REPORT_DETAILS_MENU_ITEM.MARK_AS_INCOMPLETE,
            icon: expensifyIcons.Checkmark,
            translationKey: 'task.markAsIncomplete',
            isAnonymousAction: false,
            action: callFunctionIfActionIsAllowed(() => {
                Navigation.goBack(navigateBackFromReportDetailsPath);
                reopenTask(report, parentReport, currentUserPersonalDetails?.accountID, delegateEmail);
            }),
        });
    }

    if (shouldShowGoToWorkspace) {
        items.push({
            key: CONST.REPORT_DETAILS_MENU_ITEM.GO_TO_WORKSPACE,
            translationKey: 'workspace.common.goToWorkspace',
            icon: expensifyIcons.Building,
            action: () => {
                if (!report?.policyID) {
                    return;
                }
                if (isSmallScreenWidth) {
                    Navigation.navigate(ROUTES.WORKSPACE_INITIAL.getRoute(report?.policyID, Navigation.getActiveRoute()));
                } else {
                    Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW.getRoute(report?.policyID));
                }
            },
            isAnonymousAction: false,
            shouldShowRightIcon: true,
        });
    }

    if (shouldShowLeaveButton) {
        items.push({
            key: CONST.REPORT_DETAILS_MENU_ITEM.LEAVE_ROOM,
            translationKey: 'common.leave',
            icon: expensifyIcons.Exit,
            isAnonymousAction: true,
            action: () => {
                if (getParticipantsAccountIDsForDisplay(report, false, true).length === 1 && isRootGroupChat) {
                    showLastMemberLeavingModal();
                    return;
                }

                leaveChat();
            },
        });
    }

    if (report?.reportID && isDebugModeEnabled) {
        items.push({
            key: CONST.REPORT_DETAILS_MENU_ITEM.DEBUG,
            translationKey: 'debug.debug',
            icon: expensifyIcons.Bug,
            action: () => Navigation.navigate(ROUTES.DEBUG_REPORT.getRoute(report.reportID)),
            isAnonymousAction: true,
            shouldShowRightIcon: true,
        });
    }

    return items.map((item) => (
        <MenuItem
            key={item.key}
            title={translate(item.translationKey)}
            subtitle={item.subtitle}
            icon={item.icon}
            onPress={item.action}
            isAnonymousAction={item.isAnonymousAction}
            shouldShowRightIcon={item.shouldShowRightIcon}
            brickRoadIndicator={item.brickRoadIndicator}
            subtitleStyle={item.subtitleStyle}
        />
    ));
}

export default ReportDetailsMenuItems;
