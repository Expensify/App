import getAvatarLayout from '@components/Avatar/layouts/getAvatarLayout';
import type {AvatarIcon} from '@components/Avatar/types';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import useReportPreviewSenderID from '@components/ReportActionAvatars/useReportPreviewSenderID';

import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {useAllPersonalDetails} from '@hooks/usePersonalDetails';
import useReportIsArchived from '@hooks/useReportIsArchived';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {
    getDelegateAccountIDFromReportAction,
    getHumanAgentAccountIDFromReportAction,
    getHumanAgentFirstName,
    getOriginalMessage,
    getReportActionActorAccountID,
    isMoneyRequestAction,
} from '@libs/ReportActionsUtils';
import {
    getDefaultWorkspaceAvatar,
    getDisplayNameForParticipant,
    getIcons,
    getWorkspaceIcon,
    isChatThread,
    isGroupChat,
    isInvoiceReport,
    isInvoiceRoom,
    isIOUReport,
    isPolicyExpenseChat,
    isSupportTicket,
    isTripRoom,
    shouldReportShowSubscript,
} from '@libs/ReportUtils';
import {buildUserIcon} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxInputOrEntry, PersonalDetails, Policy, Report, ReportAction, ReportActions} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {getStableReportSelector} from '@selectors/Report';
import {getReportActionByIDSelector} from '@selectors/ReportAction';
import {pendingDeleteMemberAccountIDsSelector} from '@selectors/ReportMetaData';

import useInvoiceReportIcons from './useInvoiceReportIcons';
import useIOUReportIcons from './useIOUReportIcons';

type ActionAvatarLayout = ValueOf<Pick<typeof CONST.REPORT_ACTION_AVATARS.TYPE, 'SINGLE' | 'SUBSCRIPT' | 'MULTIPLE_DIAGONAL'>>;

type ActionAvatarData = {
    /** The requested layout before a nameless secondary avatar downgrades it. The header names both actors only for MULTIPLE */
    avatarType: ValueOf<typeof CONST.REPORT_ACTION_AVATARS.TYPE>;

    /** The layout to render */
    layout: ActionAvatarLayout;

    /** The main avatar, badged with the copilot when one took the action */
    primaryAvatar: AvatarIcon;

    /** The subscript or the second diagonal avatar */
    secondaryAvatar: Icon | undefined;

    /** The account the action is credited to: the report's single sender, or the actor */
    accountID: number;

    /** Personal details of the account the action is credited to, for its emoji status, login and pending avatar. On Search they come from the snapshot, falling back to the live list while it loads */
    actorPersonalDetails: PersonalDetails | undefined;

    /** The account a copilot acted for, when a copilot took the action */
    actedForAccountID: number | undefined;

    /** Whether the action is credited to a workspace, so pressing it opens the workspace instead of a profile */
    isWorkspaceActor: boolean;

    /** Whether a report preview shows every account on the report because there is no single sender */
    shouldDisplayAllActors: boolean;

    /** Accessibility label naming the actor */
    actorHint: string;

    /** The one account every expense on the previewed report comes from, if there is one */
    reportPreviewSenderID: number | undefined;

    /** The chat the action sits in */
    chatReportID: string | undefined;

    /** The money request or invoice report the action belongs to, if any */
    iouReportID: string | undefined;
};

/** The policy fields avatars read: the workspace icon, its type and the rooms that carry its icon. */
type ActionAvatarPolicy = Pick<Policy, 'id' | 'type' | 'name' | 'avatarURL' | 'chatReportIDAdmins' | 'chatReportIDAnnounce'>;

const actionAvatarPolicySelector = (policy: OnyxEntry<Policy>): ActionAvatarPolicy | undefined =>
    policy
        ? {
              id: policy.id,
              type: policy.type,
              name: policy.name,
              avatarURL: policy.avatarURL,
              chatReportIDAdmins: policy.chatReportIDAdmins,
              chatReportIDAnnounce: policy.chatReportIDAnnounce,
          }
        : undefined;

/** Hands the selected policy fields to the icon helpers, which take a whole policy but only read its name and avatar. */
function toIconPolicy(policy: ActionAvatarPolicy | undefined): OnyxInputOrEntry<Policy> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the icon helpers only read fields the selector keeps
    return policy as OnyxInputOrEntry<Policy>;
}

const policyIDSelector = (report: OnyxEntry<Report>) => report?.policyID;

type UseActionAvatarParams = {
    /** The report action whose avatar to show. When missing, it is read off the report's parent */
    action: OnyxEntry<ReportAction>;

    /** The money request or invoice report a report preview points at, or else the report the action sits in */
    report: OnyxEntry<Report>;

    /** Whether to credit automatic actions to their real author rather than Concierge, as Search does */
    shouldUseRealActor: boolean;
};

/**
 * Resolves a report action's avatar and the details its header shows, once, for both.
 * IOU and invoice report previews come from their report's avatar hooks. Every other action follows the rules of `useReportActionAvatars`,
 * subscribing only to what its kind of action reads.
 */
function useActionAvatar({action: passedAction, report, shouldUseRealActor}: UseActionAvatarParams): ActionAvatarData {
    const defaultAvatars = useDefaultAvatars();
    const {formatPhoneNumber, translate} = useLocalize();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const livePersonalDetails = usePersonalDetails();
    const [personalDetailsFromSnapshot] = useAllPersonalDetails();
    // On Search, the snapshot can hold an account missing from the live list. Fall back to the live list while the snapshot loads.
    const personalDetails = personalDetailsFromSnapshot ?? livePersonalDetails;

    const isReportAChatReport = report?.type === CONST.REPORT.TYPE.CHAT && report?.chatType !== CONST.REPORT.CHAT_TYPE.TRIP_ROOM;
    const [reportChatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.chatReportID)}`, {selector: getStableReportSelector});
    const chatReport = isReportAChatReport ? report : reportChatReport;
    const iouReport = isReportAChatReport ? undefined : report;

    // Without an action, the action is the one the report hangs off.
    const derivedActionReportID = iouReport?.parentReportActionID ? (chatReport?.reportID ?? iouReport?.chatReportID) : reportChatReport?.reportID;
    const derivedActionID = iouReport?.parentReportActionID ?? (!iouReport ? chatReport?.parentReportActionID : undefined);
    const derivedActionSelector = (reportActions: OnyxEntry<ReportActions>) => getReportActionByIDSelector(reportActions, derivedActionID);
    const [derivedAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(!passedAction ? derivedActionReportID : undefined)}`, {selector: derivedActionSelector});
    // Support tickets use the assigned rep's avatar, not the parent message's author.
    const action = passedAction ?? (isSupportTicket(report) ? undefined : derivedAction);

    const isAReportPreviewAction = action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW;
    const isIOUReportPreview = isAReportPreviewAction && isIOUReport(iouReport ?? null);
    const isInvoiceReportPreview = isAReportPreviewAction && isInvoiceReport(iouReport ?? null);
    const isOtherAction = !isIOUReportPreview && !isInvoiceReportPreview;

    const iouReportIcons = useIOUReportIcons(isIOUReportPreview ? iouReport?.reportID : undefined, isIOUReportPreview ? action : undefined);
    const invoiceReportIcons = useInvoiceReportIcons(isInvoiceReportPreview ? iouReport?.reportID : undefined);

    // An IOU report preview finds its sender inside its avatar hook. Other report previews look it up here, every other action has none.
    const shouldLookUpSender = isAReportPreviewAction && !isIOUReportPreview;
    const senderAccountIDFromLookup = useReportPreviewSenderID({
        iouReport: shouldLookUpSender ? iouReport : undefined,
        action: shouldLookUpSender ? action : undefined,
        chatReport: shouldLookUpSender ? chatReport : undefined,
    });
    const reportPreviewSenderID = isIOUReportPreview ? iouReportIcons.senderAccountID : senderAccountIDFromLookup;

    const delegateAccountIDFromAction = getDelegateAccountIDFromReportAction(action);
    const delegatePersonalDetails = delegateAccountIDFromAction ? personalDetails?.[delegateAccountIDFromAction] : undefined;
    const actorAccountID = getReportActionActorAccountID(action, iouReport, chatReport, delegatePersonalDetails, shouldUseRealActor);
    const accountID = reportPreviewSenderID || (actorAccountID ?? CONST.DEFAULT_NUMBER_ID);
    const actorPersonalDetails = personalDetails?.[accountID] ?? undefined;
    const {avatar, fallbackIcon, login} = personalDetails?.[delegatePersonalDetails ? delegatePersonalDetails.accountID : accountID] ?? {};
    const defaultDisplayName = getDisplayNameForParticipant({accountID, personalDetailsData: personalDetails, formatPhoneNumber, hiddenTranslation: translate('common.hidden')}) ?? '';
    const personActorHint = String(login || defaultDisplayName).replaceAll(CONST.REGEX.MERGED_ACCOUNT_PREFIX, '');

    // A report preview moved to another workspace takes the new workspace's icon, so it reads the policyID its report now has.
    const [actionChildReportPolicyID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(isOtherAction && isAReportPreviewAction ? action?.childReportID : undefined)}`, {
        selector: policyIDSelector,
    });
    const isReportArchived = useReportIsArchived(isOtherAction ? iouReport?.reportID : undefined);

    const reportPolicyID = iouReport?.policyID ?? chatReport?.policyID;
    const chatReportPolicyIDExists = chatReport?.policyID === CONST.POLICY.ID_FAKE || !chatReport?.policyID;
    const changedPolicyID = actionChildReportPolicyID ?? iouReport?.policyID;
    const shouldUseChangedPolicyID = !!changedPolicyID && changedPolicyID !== (reportPolicyID ?? iouReport?.policyID);
    const retrievedPolicyID = chatReportPolicyIDExists ? reportPolicyID : chatReport?.policyID;
    const policyID = shouldUseChangedPolicyID ? changedPolicyID : retrievedPolicyID;
    const [avatarPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(isOtherAction ? policyID : undefined)}`, {selector: actionAvatarPolicySelector});
    const policy = toIconPolicy(avatarPolicy);

    const invoiceReceiverPolicyID = chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined;
    const [avatarInvoiceReceiverPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(isOtherAction ? invoiceReceiverPolicyID : undefined)}`, {
        selector: actionAvatarPolicySelector,
    });
    const invoiceReceiverPolicy = toIconPolicy(avatarInvoiceReceiverPolicy);

    const wasReportPreviewMovedToDifferentPolicy = isOtherAction && shouldUseChangedPolicyID && isAReportPreviewAction;
    const {chatReportIDAdmins, chatReportIDAnnounce} = avatarPolicy ?? {};
    const policyChatReportID = String((Number(chatReportIDAnnounce) ? chatReportIDAnnounce : chatReportIDAdmins) ?? '');
    const [policyChatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(wasReportPreviewMovedToDifferentPolicy ? policyChatReportID : undefined)}`, {
        selector: getStableReportSelector,
    });

    // Only a group chat's icons leave out members being removed.
    const [chatReportPendingDeleteMemberAccountIDs] = useOnyx(
        `${ONYXKEYS.COLLECTION.REPORT_METADATA}${getNonEmptyStringOnyxID(isOtherAction && isGroupChat(chatReport ?? undefined) ? chatReport?.reportID : undefined)}`,
        {selector: pendingDeleteMemberAccountIDsSelector},
    );

    const iouReportID = iouReport?.reportID;
    const chatReportID = chatReport?.reportID;

    if (isIOUReportPreview) {
        const {primaryAvatar, secondaryAvatar, singleAvatar, hasSeveralSenders, layout} = iouReportIcons;
        return {
            avatarType: hasSeveralSenders ? CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE : CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE,
            layout,
            // Only the single avatar carries the copilot badge.
            primaryAvatar: layout === CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE ? singleAvatar : primaryAvatar,
            secondaryAvatar,
            accountID,
            actorPersonalDetails,
            actedForAccountID: delegateAccountIDFromAction ? actorAccountID : undefined,
            isWorkspaceActor: false,
            shouldDisplayAllActors: hasSeveralSenders,
            actorHint: personActorHint,
            reportPreviewSenderID,
            chatReportID,
            iouReportID,
        };
    }

    if (isInvoiceReportPreview) {
        const {primaryAvatar, receiverIcon, layout, isBusinessToBusiness} = invoiceReportIcons;
        let avatarType: ValueOf<typeof CONST.REPORT_ACTION_AVATARS.TYPE> = CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT;
        if (isBusinessToBusiness) {
            avatarType = CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE;
        } else if (layout === CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE) {
            avatarType = CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE;
        }
        return {
            avatarType,
            layout,
            primaryAvatar,
            secondaryAvatar: receiverIcon,
            accountID,
            actorPersonalDetails,
            actedForAccountID: undefined,
            isWorkspaceActor: true,
            shouldDisplayAllActors: !reportPreviewSenderID,
            // Until the invoice names its workspace, the unknown account (ID 0) stands in, so the label names the person instead.
            actorHint: primaryAvatar.id ? String(primaryAvatar.id).replaceAll(CONST.REGEX.MERGED_ACCOUNT_PREFIX, '') : personActorHint,
            reportPreviewSenderID,
            chatReportID,
            iouReportID,
        };
    }

    // Every other action follows `useReportActionAvatars` with an action passed in. That hook still renders other surfaces until
    // https://github.com/Expensify/App/issues/94591 deletes it, so a fix to these rules belongs in both places until then.
    const humanAgentAccountID = getHumanAgentAccountIDFromReportAction(action);
    const isAInvoiceReport = isInvoiceReport(iouReport ?? null);
    // Actions inside an invoice report picture their actor, named by display name.
    const shouldUseActorAccountID = isAInvoiceReport && !isAReportPreviewAction;
    const actorIcons: Icon[] =
        shouldUseActorAccountID && actorAccountID
            ? [buildUserIcon({accountID: actorAccountID, personalDetails, defaultAvatars, name: personalDetails?.[actorAccountID]?.displayName ?? ''})]
            : [];

    const shouldUseConciergeAvatar = !passedAction && !!conciergeReportID && isChatThread(chatReport) && chatReport?.parentReportID === conciergeReportID;

    const isWorkspacePolicy = !!avatarPolicy && avatarPolicy.type !== CONST.POLICY.TYPE.PERSONAL;
    const isATripRoom = isTripRoom(chatReport);
    const isWorkspaceWithoutChatReportProp = !chatReport?.reportID && isWorkspacePolicy;
    const isAnInvoiceRoom = isInvoiceRoom(chatReport);
    const isAWorkspaceChat = (isPolicyExpenseChat(chatReport) || isWorkspaceWithoutChatReportProp) && !isAnInvoiceRoom;
    const isATripPreview = action?.actionName === CONST.REPORT.ACTIONS.TYPE.TRIP_PREVIEW;
    const isReportPreviewOrNoAction = !action || isAReportPreviewAction;
    const isReportPreviewInTripRoom = isAReportPreviewAction && isATripRoom;

    // Only the sender's avatar shows next to a report preview when it holds one person's expenses.
    const displayAllActors = isAReportPreviewAction && !isATripRoom && !isAWorkspaceChat && !reportPreviewSenderID;
    const isChatThreadOutsideTripRoom = isChatThread(chatReport) && !isATripRoom;
    const shouldShowSubscriptAvatar = shouldReportShowSubscript(iouReport ?? chatReport, isReportArchived);
    const isExpense = isMoneyRequestAction(action) && getOriginalMessage(action)?.type === CONST.IOU.ACTION.CREATE;
    const isWorkspaceExpense = isWorkspacePolicy && isExpense;

    const shouldUseSubscriptAvatar =
        ((shouldShowSubscriptAvatar && isReportPreviewOrNoAction) || isReportPreviewInTripRoom || isATripPreview || isWorkspaceExpense) &&
        !(isChatThreadOutsideTripRoom && !isWorkspaceExpense);

    let avatarType: ValueOf<typeof CONST.REPORT_ACTION_AVATARS.TYPE> = CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE;
    if (shouldUseSubscriptAvatar) {
        avatarType = CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT;
    } else if (displayAllActors) {
        avatarType = CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE;
    }

    const invoiceReport = [iouReport, chatReport, reportChatReport].find((reportToCheck) => isInvoiceReport(reportToCheck) || reportToCheck?.chatType === CONST.REPORT.TYPE.INVOICE);
    const isNestedInInvoiceReport = !!invoiceReport && !isChatThread(report);
    const isInvoiceReportActor = isAInvoiceReport && (!actorAccountID || displayAllActors || isAReportPreviewAction);
    const isWorkspaceActor = isInvoiceReportActor || (isAWorkspaceChat && (!actorAccountID || displayAllActors));
    const isChatReportOnlyProp = !iouReport && chatReport?.reportID;
    const isWorkspaceChatWithoutChatReport = !chatReport?.reportID && isAWorkspaceChat;
    const isAccessPlaceholderReportPreview = isAReportPreviewAction && isAWorkspaceChat && !iouReport;
    const usePersonalDetailsAvatars =
        (isChatReportOnlyProp || isWorkspaceChatWithoutChatReport) && isReportPreviewOrNoAction && !isATripPreview && !isAnInvoiceRoom && !isAccessPlaceholderReportPreview;
    const useNearestReportAvatars = !accountID || !action;

    const getIconsWithDefaults = (onyxReport: OnyxInputOrEntry<Report>) =>
        getIcons(
            onyxReport,
            formatPhoneNumber,
            translate,
            personalDetails,
            avatar ?? fallbackIcon ?? defaultAvatars.FallbackAvatar,
            defaultDisplayName,
            accountID,
            policy,
            invoiceReceiverPolicy,
            false,
            // Only a chat report can be a group chat, the other reports passed here (IOU/invoice) never need it.
            onyxReport?.reportID === chatReport?.reportID ? chatReportPendingDeleteMemberAccountIDs : undefined,
            conciergeReportID,
        );

    const reportIcons = getIconsWithDefaults(chatReport?.reportID ? chatReport : iouReport);

    const delegateAvatar: Icon | undefined = delegatePersonalDetails
        ? {source: delegatePersonalDetails.avatar ?? '', name: delegatePersonalDetails.displayName, id: delegatePersonalDetails.accountID, type: CONST.ICON_TYPE_AVATAR, fallbackIcon}
        : undefined;
    const invoiceFallbackAvatar: Icon = {
        source: avatarPolicy?.avatarURL || getDefaultWorkspaceAvatar(avatarPolicy?.name),
        id: avatarPolicy?.id,
        name: avatarPolicy?.name,
        type: CONST.ICON_TYPE_WORKSPACE,
        fallbackIcon,
    };
    const userFallbackAvatar: Icon = {source: avatar ?? defaultAvatars.FallbackAvatar, id: accountID, name: defaultDisplayName, type: CONST.ICON_TYPE_AVATAR, fallbackIcon};
    const secondUserFallbackAvatar: Icon = {name: '', source: '', type: CONST.ICON_TYPE_AVATAR, id: 0, fallbackIcon};

    let primaryAvatar: Icon | undefined;
    if (useNearestReportAvatars) {
        primaryAvatar = getIconsWithDefaults(iouReport ?? chatReport).at(0);
    } else if (shouldUseConciergeAvatar || isWorkspaceActor || usePersonalDetailsAvatars) {
        primaryAvatar = reportIcons.at(0);
    } else if (delegateAvatar) {
        primaryAvatar = delegateAvatar;
    } else if (isReportPreviewInTripRoom) {
        primaryAvatar = reportIcons.at(0);
    }
    if (!primaryAvatar?.id) {
        primaryAvatar = isNestedInInvoiceReport && !isAnInvoiceRoom ? invoiceFallbackAvatar : userFallbackAvatar;
    }

    let secondaryAvatar: Icon | undefined;
    if (useNearestReportAvatars) {
        secondaryAvatar = getIconsWithDefaults(iouReport ?? chatReport).at(1);
    } else if (usePersonalDetailsAvatars) {
        secondaryAvatar = reportIcons.at(1);
    } else if (isATripPreview) {
        secondaryAvatar = reportIcons.at(0);
    } else if (isReportPreviewInTripRoom || displayAllActors) {
        const reportPreviewIcons = getIconsWithDefaults(iouReport);
        secondaryAvatar = reportPreviewIcons.at(reportPreviewIcons.at(1)?.id === primaryAvatar.id ? 0 : 1);
    } else if (!isWorkspaceActor) {
        secondaryAvatar = reportIcons.at(chatReport?.isOwnPolicyExpenseChat || isAWorkspaceChat ? 0 : 1);
    } else if (isAInvoiceReport) {
        secondaryAvatar = reportIcons.at(1);
    }
    if (!secondaryAvatar?.id) {
        secondaryAvatar = secondUserFallbackAvatar;
    }

    let avatars: Icon[] = [primaryAvatar, secondaryAvatar];
    const isUserWithWorkspaceAvatar =
        avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT && avatars.at(0)?.type === CONST.ICON_TYPE_AVATAR && avatars.at(1)?.type === CONST.ICON_TYPE_WORKSPACE;
    const isWorkspaceWithUserAvatar =
        avatars.at(0)?.type === CONST.ICON_TYPE_WORKSPACE && avatars.at(1)?.type === CONST.ICON_TYPE_AVATAR && avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE;

    if (isWorkspaceExpense && isNestedInInvoiceReport && !!accountID) {
        avatars = getIconsWithDefaults(invoiceReport);
    } else if (actorIcons.length > 0) {
        avatars = actorIcons;
    }

    if (isNestedInInvoiceReport && !!avatars.at(1)?.id) {
        // Between two workspaces, only a report preview shows both diagonally. Between a workspace and a person, a report preview keeps the subscript.
        if (avatars.every(({type}) => type === CONST.ICON_TYPE_WORKSPACE)) {
            avatarType = isAReportPreviewAction ? CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE : CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT;
        } else if (isWorkspaceWithUserAvatar && isAReportPreviewAction) {
            avatarType = CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT;
        }
    } else if (isUserWithWorkspaceAvatar && wasReportPreviewMovedToDifferentPolicy) {
        const policyChatReportIcon = {...getWorkspaceIcon(policyChatReport, translate, policy), id: policyID, name: avatarPolicy?.name};
        avatars = [avatars.at(0) ?? primaryAvatar, policyChatReportIcon];
    }

    // A human agent revealing themselves behind Concierge shows as Concierge's subscript.
    const humanAgentDetails = humanAgentAccountID ? personalDetails?.[humanAgentAccountID] : undefined;
    if (humanAgentAccountID && humanAgentDetails && avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE) {
        const agentAvatar: Icon = {
            id: humanAgentAccountID,
            type: CONST.ICON_TYPE_AVATAR,
            source: humanAgentDetails.avatar ?? defaultAvatars.FallbackAvatar,
            name: getHumanAgentFirstName(action, personalDetails) ?? translate('reportAction.humanSupportAgent'),
        };
        avatars = [avatars.at(0) ?? primaryAvatar, agentAvatar];
        avatarType = CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT;
    }

    const {layout, primaryIcon, secondaryIcon} = getAvatarLayout({icons: avatars, avatarType, shouldRequireSecondaryIconName: true});
    const resolvedPrimaryAvatar = primaryIcon ?? primaryAvatar;
    const actedForAccountID = !isWorkspaceActor && !!delegateAccountIDFromAction ? actorAccountID : undefined;
    // The copilot badge names who the copilot acted for. Concierge never shows one, even when a copilot's request created its action.
    const copilotAccountID = shouldUseConciergeAvatar ? undefined : delegateAccountIDFromAction;

    return {
        avatarType,
        layout: layout === CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT || layout === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL ? layout : CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE,
        primaryAvatar:
            layout === CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE && actedForAccountID && copilotAccountID
                ? {...resolvedPrimaryAvatar, copilot: {accountID: copilotAccountID, actedForAccountID}}
                : resolvedPrimaryAvatar,
        secondaryAvatar: secondaryIcon,
        accountID,
        actorPersonalDetails,
        actedForAccountID,
        isWorkspaceActor,
        shouldDisplayAllActors: displayAllActors,
        actorHint: String(isWorkspaceActor && !!resolvedPrimaryAvatar.id ? resolvedPrimaryAvatar.id : login || defaultDisplayName).replaceAll(CONST.REGEX.MERGED_ACCOUNT_PREFIX, ''),
        reportPreviewSenderID,
        chatReportID,
        iouReportID,
    };
}

export default useActionAvatar;
