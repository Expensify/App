import MenuItem from '@components/MenuItem';
import {ModalActions} from '@components/Modal/Global/ModalContext';

import useActivePolicy from '@hooks/useActivePolicy';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLastWorkspaceNumber from '@hooks/useLastWorkspaceNumber';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {generateDefaultWorkspaceName} from '@libs/actions/Policy/Policy';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import Navigation from '@libs/Navigation/Navigation';
import Permissions from '@libs/Permissions';
import {shouldShowPolicy} from '@libs/PolicyUtils';
import {getTrackExpenseActionableWhisper} from '@libs/ReportActionsUtils';
import {
    canLeaveChat,
    createDraftTransactionAndNavigateToParticipantSelector,
    getParticipantsAccountIDsForDisplay,
    isCompletedTaskReport,
    isConciergeChatReport,
    isHiddenForCurrentUser,
    isPublicRoom,
    isWorkspaceMemberLeavingWorkspaceRoom as isWorkspaceMemberLeavingWorkspaceRoomUtil,
    navigateToPrivateNotes,
} from '@libs/ReportUtils';
import {getOriginalTransactionWithSplitInfo} from '@libs/TransactionUtils';

import {hasErrorInPrivateNotes, leaveGroupChat, leaveRoom} from '@userActions/Report';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';
import {reopenTask} from '@userActions/Task';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type IconAsset from '@src/types/utils/IconAsset';

import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {useFocusEffect} from '@react-navigation/native';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import {createFilteredPoliciesInfoSelector, createHasWorkspaceToSubmitToSelector} from '@selectors/Policy';
import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import React, {useState} from 'react';

type ReportDetailsMenuItem = {
    key: DeepValueOf<typeof CONST.REPORT_DETAILS_MENU_ITEM>;
    translationKey: TranslationPaths;
    icon: IconAsset;
    isAnonymousAction: boolean;
    action: () => void;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    subtitle?: number;
    shouldShowRightIcon?: boolean;
    subtitleStyle?: StyleProp<ViewStyle>;
};

type ReportDetailsMenuItemsProps = {
    /** The report whose details page is displayed */
    report: OnyxTypes.Report;

    /** The policy the report belongs to */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** The parent of the report */
    parentReport: OnyxEntry<OnyxTypes.Report>;

    /** Account IDs of the participants displayed on the page */
    participants: number[];

    /** Members with a pending add/remove action on the report */
    pendingChatMembers: OnyxTypes.ReportMetadata['pendingChatMembers'];

    /** Personal details of all known users */
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;

    /** ID of the Concierge chat */
    conciergeReportID: string | undefined;

    /** Email of the delegate acting on behalf of the current user */
    delegateEmail: string | undefined;

    /** Report the tracked expense would be submitted/categorized/shared from */
    actionReportID: string | undefined;

    /** ID of the transaction of the money request, if any */
    iouTransactionID: string | undefined;

    /** Transaction of the money request, if any */
    iouTransaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Original transaction the money request transaction was split from, if any */
    iouOriginalTransaction: OnyxEntry<OnyxTypes.Transaction>;

    /** ID of the money request report the tracked expense lives on */
    moneyRequestReportID: string | undefined;

    /** Actions of the money request report */
    moneyRequestReportActions: OnyxEntry<OnyxTypes.ReportActions>;

    /** Where to navigate back to when leaving the details page */
    navigateBackFromReportDetailsPath: Route;

    /** Whether the report is archived */
    isReportArchived: boolean;

    /** Whether the report is an archived non-expense report */
    isArchivedRoom: boolean;

    isSelfDM: boolean;
    isChatRoom: boolean;
    isGroupChat: boolean;
    isRootGroupChat: boolean;
    isDefaultRoom: boolean;
    isChatThread: boolean;
    isSystemChat: boolean;
    isPolicyAdmin: boolean;
    isPolicyEmployee: boolean;
    isPolicyExpenseChat: boolean;
    isUserCreatedPolicyRoom: boolean;
    isTrackExpenseReport: boolean;
    isDeletedParentAction: boolean;
    isMoneyRequestReport: boolean;
    isInvoiceReport: boolean;
    isTaskReport: boolean;
    isCanceledTaskReport: boolean;
    isTaskActionable: boolean;

    /** Whether the Members row opens the room members page instead of the participants page */
    shouldOpenRoomMembersPage: boolean;
};

function ReportDetailsMenuItems({
    report,
    policy,
    parentReport,
    participants,
    pendingChatMembers,
    personalDetails,
    conciergeReportID,
    delegateEmail,
    actionReportID,
    iouTransactionID,
    iouTransaction,
    iouOriginalTransaction,
    moneyRequestReportID,
    moneyRequestReportActions,
    navigateBackFromReportDetailsPath,
    isReportArchived,
    isArchivedRoom,
    isSelfDM,
    isChatRoom,
    isGroupChat,
    isRootGroupChat,
    isDefaultRoom,
    isChatThread,
    isSystemChat,
    isPolicyAdmin,
    isPolicyEmployee,
    isPolicyExpenseChat,
    isUserCreatedPolicyRoom,
    isTrackExpenseReport,
    isDeletedParentAction,
    isMoneyRequestReport,
    isInvoiceReport,
    isTaskReport,
    isCanceledTaskReport,
    isTaskActionable,
    shouldOpenRoomMembersPage,
}: ReportDetailsMenuItemsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Users', 'Gear', 'Send', 'Folder', 'UserPlus', 'Pencil', 'Checkmark', 'Building', 'Exit', 'Bug', 'Hashtag']);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isRestrictedToPreferredPolicy, preferredPolicyID} = usePreferredPolicy();
    const activePolicy = useActivePolicy();
    const lastWorkspaceNumber = useLastWorkspaceNumber();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {showConfirmModal} = useConfirmModal();

    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const [isDebugModeEnabled = false] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);
    const [actionReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${actionReportID}`);
    const filteredPoliciesInfoSelector = createFilteredPoliciesInfoSelector(currentUserPersonalDetails?.email);
    const [filteredPoliciesInfo] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: filteredPoliciesInfoSelector});
    const hasWorkspaceToSubmitToSelector = createHasWorkspaceToSubmitToSelector(currentUserPersonalDetails.login);
    const [hasWorkspaceToSubmitTo] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: hasWorkspaceToSubmitToSelector});

    // Snapshot on focus whether the room is the screen behind the Details page, so the row doesn't flip while the page
    // is closing after it's tapped, yet still reflects the correct screen on later visits.
    const [isRoomCurrentlyOpen, setIsRoomCurrentlyOpen] = useState(() => isReportTopmostSplitNavigator() && Navigation.getTopmostReportId() === report?.reportID);
    useFocusEffect(() => {
        setIsRoomCurrentlyOpen(isReportTopmostSplitNavigator() && Navigation.getTopmostReportId() === report?.reportID);
    });

    const shouldShowGoToRoom = (isChatRoom || isPolicyExpenseChat) && !isRoomCurrentlyOpen;
    const shouldShowGoToWorkspace = shouldShowPolicy(policy, false, currentUserPersonalDetails?.email) && !policy?.isJoinRequestPending && !shouldShowGoToRoom;
    const shouldShowLeaveButton = canLeaveChat(report, policy, currentUserPersonalDetails?.accountID, isReportArchived);

    const shouldShowNotificationPref = !isMoneyRequestReport && !isHiddenForCurrentUser(report);
    const shouldShowWriteCapability = !isMoneyRequestReport;
    const shouldShowSettings = shouldShowNotificationPref || shouldShowWriteCapability || (!!report?.visibility && report.chatType !== CONST.REPORT.CHAT_TYPE.INVOICE);

    // Get the active chat members by filtering out the pending members with delete action
    const activeChatMembers = participants.flatMap((accountID) => {
        const pendingMember = pendingChatMembers?.findLast((member) => member.accountID === accountID.toString());
        const detail = personalDetails?.[accountID];
        if (!detail) {
            return [];
        }
        return pendingMember?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ? accountID : [];
    });

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

        const isWorkspaceMemberLeavingWorkspaceRoom = isWorkspaceMemberLeavingWorkspaceRoomUtil(report, isPolicyEmployee, isPolicyAdmin);
        leaveRoom(report, currentUserPersonalDetails.accountID, conciergeReportID, introSelected, isSelfTourViewed, betas, isWorkspaceMemberLeavingWorkspaceRoom);
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

    const items: ReportDetailsMenuItem[] = [];

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

    if (shouldShowSettings) {
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

ReportDetailsMenuItems.displayName = 'ReportDetailsMenuItems';

export default ReportDetailsMenuItems;
export type {ReportDetailsMenuItemsProps};
