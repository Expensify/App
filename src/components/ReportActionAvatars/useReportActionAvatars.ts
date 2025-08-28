import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {getDelegateAccountIDFromReportAction, getOriginalMessage, getReportAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {
    getDefaultWorkspaceAvatar,
    getDisplayNameForParticipant,
    getIcons,
    getReportActionActorAccountID,
    getWorkspaceIcon,
    isChatThread,
    isInvoiceReport,
    isPolicyExpenseChat,
    isTripRoom,
    shouldReportShowSubscript,
} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InvitedEmailsToAccountIDs, OnyxInputOrEntry, Report, ReportAction} from '@src/types/onyx';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';
import useReportPreviewSenderID from './useReportPreviewSenderID';

function useReportActionAvatars({
    report,
    action: passedAction,
    shouldStackHorizontally = false,
    shouldUseCardFeed = false,
    accountIDs = [],
    policyID: passedPolicyID,
    fallbackDisplayName = '',
    invitedEmailsToAccountIDs,
}: {
    report: OnyxEntry<Report>;
    action: OnyxEntry<ReportAction>;
    shouldStackHorizontally?: boolean;
    shouldUseCardFeed?: boolean;
    accountIDs?: number[];
    policyID?: string;
    fallbackDisplayName?: string;
    invitedEmailsToAccountIDs?: InvitedEmailsToAccountIDs;
}) {
    /* Get avatar type */
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        canBeMissing: true,
    });

    const isReportAChatReport = report?.type === CONST.REPORT.TYPE.CHAT && report?.chatType !== CONST.REPORT.CHAT_TYPE.TRIP_ROOM;

    const [reportChatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`, {canBeMissing: true});

    const chatReport = isReportAChatReport ? report : reportChatReport;
    const iouReport = isReportAChatReport ? undefined : report;

    let action;

    if (passedAction) {
        action = passedAction;
    } else if (iouReport?.parentReportActionID) {
        action = getReportAction(chatReport?.reportID ?? iouReport?.chatReportID, iouReport?.parentReportActionID);
    } else if (!!reportChatReport && !!chatReport?.parentReportActionID && !iouReport) {
        action = getReportAction(reportChatReport?.reportID, chatReport.parentReportActionID);
    }

    const [actionChildReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${action?.childReportID}`, {canBeMissing: true});

    const isAReportPreviewAction = action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW;

    const isReportArchived = useReportIsArchived(iouReport?.reportID);

    const reportPreviewSenderID = useReportPreviewSenderID({
        iouReport,
        action,
        chatReport,
    });

    const reportPolicyID = iouReport?.policyID ?? chatReport?.policyID;
    const chatReportPolicyIDExists = chatReport?.policyID === CONST.POLICY.ID_FAKE || !chatReport?.policyID;
    const changedPolicyID = actionChildReport?.policyID ?? iouReport?.policyID;
    const shouldUseChangedPolicyID = !!changedPolicyID && changedPolicyID !== (chatReport?.policyID ?? iouReport?.policyID);
    const retrievedPolicyID = chatReportPolicyIDExists ? reportPolicyID : chatReport?.policyID;

    const policyID = shouldUseChangedPolicyID ? changedPolicyID : (passedPolicyID ?? retrievedPolicyID);
    const policy = usePolicy(policyID);

    const invoiceReceiverPolicyID = chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined;
    const invoiceReceiverPolicy = usePolicy(invoiceReceiverPolicyID);

    const {chatReportIDAdmins, chatReportIDAnnounce, workspaceAccountID} = policy ?? {};

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [policyChatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportIDAnnounce || chatReportIDAdmins}`, {canBeMissing: true});

    const delegateAccountID = getDelegateAccountIDFromReportAction(action);
    const delegatePersonalDetails = delegateAccountID ? personalDetails?.[delegateAccountID] : undefined;
    const actorAccountID = getReportActionActorAccountID(action, iouReport, chatReport, delegatePersonalDetails);

    const isAInvoiceReport = isInvoiceReport(iouReport ?? null);

    const shouldUseActorAccountID = isAInvoiceReport && !isAReportPreviewAction;
    const accountIDsToMap = shouldUseActorAccountID && actorAccountID ? [actorAccountID] : accountIDs;

    const avatarsForAccountIDs: IconType[] = accountIDsToMap.map((id) => {
        const invitedEmail = invitedEmailsToAccountIDs ? Object.keys(invitedEmailsToAccountIDs).find((email) => invitedEmailsToAccountIDs[email] === id) : undefined;
        return {
            id,
            type: CONST.ICON_TYPE_AVATAR,
            source: personalDetails?.[id]?.avatar ?? FallbackAvatar,
            name: personalDetails?.[id]?.[shouldUseActorAccountID ? 'displayName' : 'login'] ?? invitedEmail ?? '',
        };
    });

    const fallbackWorkspaceAvatar: IconType = {
        id: policyID,
        type: CONST.ICON_TYPE_WORKSPACE,
        name: fallbackDisplayName,
        source: getDefaultWorkspaceAvatar(fallbackDisplayName),
    };

    if (passedPolicyID) {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const workspaceAvatar = policyChatReport ? getWorkspaceIcon(policyChatReport, policy) : {source: policy?.avatarURL || getDefaultWorkspaceAvatar(policy?.name)};
        const policyChatReportAvatar = policy ? {...workspaceAvatar, id: policyID, name: policy.name, type: CONST.ICON_TYPE_WORKSPACE} : fallbackWorkspaceAvatar;
        const firstAccountAvatar = avatarsForAccountIDs.at(0);

        return {
            avatars: firstAccountAvatar ? [policyChatReportAvatar, firstAccountAvatar] : [policyChatReportAvatar],
            avatarType: firstAccountAvatar ? CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT : CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE,
            details: {
                ...(personalDetails?.[workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID] ?? {}),
                shouldDisplayAllActors: false,
                isWorkspaceActor: false,
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                actorHint: String(policyID).replace(CONST.REGEX.MERGED_ACCOUNT_PREFIX, ''),
                accountID: workspaceAccountID,
                delegateAccountID: undefined,
            },
            source: {
                policyChatReport,
            },
        };
    }

    const isWorkspacePolicy = !!policy && policy.type !== CONST.POLICY.TYPE.PERSONAL;
    const isATripRoom = isTripRoom(chatReport);
    const isWorkspaceWithoutChatReportProp = !chatReport && isWorkspacePolicy;
    const isAWorkspaceChat = isPolicyExpenseChat(chatReport) || isWorkspaceWithoutChatReportProp;
    const isATripPreview = action?.actionName === CONST.REPORT.ACTIONS.TYPE.TRIP_PREVIEW;
    const isReportPreviewOrNoAction = !action || isAReportPreviewAction;
    const isReportPreviewInTripRoom = isAReportPreviewAction && isATripRoom;

    // We want to display only the sender's avatar next to the report preview if it only contains one person's expenses.
    const displayAllActors = isAReportPreviewAction && !isATripRoom && !isAWorkspaceChat && !reportPreviewSenderID;

    const shouldUseAccountIDs = accountIDs.length > 0;
    const shouldShowAllActors = displayAllActors && !reportPreviewSenderID;
    const isChatThreadOutsideTripRoom = isChatThread(chatReport) && !isATripRoom;
    const shouldShowSubscriptAvatar = shouldReportShowSubscript(iouReport ?? chatReport, isReportArchived) && isWorkspacePolicy;
    const shouldShowConvertedSubscriptAvatar = (shouldStackHorizontally || shouldUseAccountIDs) && shouldShowSubscriptAvatar && !reportPreviewSenderID;
    const isExpense = isMoneyRequestAction(action) && getOriginalMessage(action)?.type === CONST.IOU.ACTION.CREATE;
    const isWorkspaceExpense = isWorkspacePolicy && isExpense;

    const shouldUseSubscriptAvatar =
        (((shouldShowSubscriptAvatar && isReportPreviewOrNoAction) || isReportPreviewInTripRoom || isATripPreview || isWorkspaceExpense) &&
            !shouldStackHorizontally &&
            !(isChatThreadOutsideTripRoom && !isWorkspaceExpense) &&
            !shouldShowConvertedSubscriptAvatar) ||
        shouldUseCardFeed;

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const shouldUseMultipleAvatars = shouldUseAccountIDs || shouldShowAllActors || shouldShowConvertedSubscriptAvatar;

    let avatarType: ValueOf<typeof CONST.REPORT_ACTION_AVATARS.TYPE> = CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE;

    if (shouldUseSubscriptAvatar) {
        avatarType = CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT;
    } else if (shouldUseMultipleAvatars) {
        avatarType = CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE;
    }

    /* Get correct primary & secondary icon */

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const accountID = reportPreviewSenderID || (actorAccountID ?? CONST.DEFAULT_NUMBER_ID);
    const {avatar, fallbackIcon, login} = personalDetails?.[delegatePersonalDetails ? delegatePersonalDetails.accountID : accountID] ?? {};

    const defaultDisplayName = getDisplayNameForParticipant({accountID, personalDetailsData: personalDetails}) ?? '';
    const invoiceReport = [iouReport, chatReport, reportChatReport].find((susReport) => isInvoiceReport(susReport) || susReport?.chatType === CONST.REPORT.TYPE.INVOICE);
    const isNestedInInvoiceReport = !!invoiceReport;
    const isWorkspaceActor = isAInvoiceReport || (isAWorkspaceChat && (!actorAccountID || displayAllActors));
    const isChatReportOnlyProp = !iouReport && chatReport;
    const isWorkspaceChatWithoutChatReport = !chatReport && isAWorkspaceChat;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const usePersonalDetailsAvatars = (isChatReportOnlyProp || isWorkspaceChatWithoutChatReport) && isReportPreviewOrNoAction && !isATripPreview;
    const useNearestReportAvatars = (!accountID || !action) && accountIDs.length === 0;

    const getIconsWithDefaults = (onyxReport: OnyxInputOrEntry<Report>) =>
        getIcons(onyxReport, personalDetails, avatar ?? fallbackIcon ?? FallbackAvatar, defaultDisplayName, accountID, policy, invoiceReceiverPolicy);

    const reportIcons = getIconsWithDefaults(chatReport ?? iouReport);

    const delegateAvatar: IconType | undefined = delegatePersonalDetails
        ? {
              source: delegatePersonalDetails.avatar ?? '',
              name: delegatePersonalDetails.displayName,
              id: delegatePersonalDetails.accountID,
              type: CONST.ICON_TYPE_AVATAR,
              fill: undefined,
              fallbackIcon,
          }
        : undefined;

    const invoiceFallbackAvatar: IconType = {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        source: policy?.avatarURL || getDefaultWorkspaceAvatar(policy?.name),
        id: policy?.id,
        name: policy?.name,
        type: CONST.ICON_TYPE_WORKSPACE,
        fill: undefined,
        fallbackIcon,
    };

    const userFallbackAvatar: IconType = {
        source: avatar ?? FallbackAvatar,
        id: accountID,
        name: defaultDisplayName ?? fallbackDisplayName,
        type: CONST.ICON_TYPE_AVATAR,
        fill: undefined,
        fallbackIcon,
    };

    const secondUserFallbackAvatar: IconType = {
        name: '',
        source: '',
        type: CONST.ICON_TYPE_AVATAR,
        id: 0,
        fill: undefined,
        fallbackIcon,
    };

    let primaryAvatar;

    if (useNearestReportAvatars) {
        primaryAvatar = getIconsWithDefaults(iouReport ?? chatReport).at(0);
    } else if (isWorkspaceActor || usePersonalDetailsAvatars) {
        primaryAvatar = reportIcons.at(0);
    } else if (delegateAvatar) {
        primaryAvatar = delegateAvatar;
    } else if (isAReportPreviewAction && isATripRoom) {
        primaryAvatar = reportIcons.at(0);
    }

    if (!primaryAvatar?.id) {
        primaryAvatar = isNestedInInvoiceReport ? invoiceFallbackAvatar : userFallbackAvatar;
    }

    let secondaryAvatar;

    if (useNearestReportAvatars) {
        secondaryAvatar = getIconsWithDefaults(iouReport ?? chatReport).at(1);
    } else if (usePersonalDetailsAvatars) {
        secondaryAvatar = reportIcons.at(1);
    } else if (isATripPreview) {
        secondaryAvatar = reportIcons.at(0);
    } else if (isReportPreviewInTripRoom || displayAllActors) {
        const iouReportIcons = getIconsWithDefaults(iouReport);
        secondaryAvatar = iouReportIcons.at(iouReportIcons.at(1)?.id === primaryAvatar.id ? 0 : 1);
    } else if (!isWorkspaceActor) {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        secondaryAvatar = reportIcons.at(chatReport?.isOwnPolicyExpenseChat || isAWorkspaceChat ? 0 : 1);
    } else if (isAInvoiceReport) {
        secondaryAvatar = reportIcons.at(1);
    }

    if (!secondaryAvatar?.id) {
        secondaryAvatar = secondUserFallbackAvatar;
    }

    const shouldUseMappedAccountIDs = avatarsForAccountIDs.length > 0 && (avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE || shouldUseActorAccountID || shouldUseCardFeed);
    const shouldUsePrimaryAvatarID = isWorkspaceActor && !!primaryAvatar.id;
    const shouldUseInvoiceExpenseIcons = isWorkspaceExpense && isNestedInInvoiceReport && !!accountID;

    let avatars = [primaryAvatar, secondaryAvatar];

    const isUserWithWorkspaceAvatar =
        avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT && avatars.at(0)?.type === CONST.ICON_TYPE_AVATAR && avatars.at(1)?.type === CONST.ICON_TYPE_WORKSPACE;
    const isWorkspaceWithUserAvatar =
        avatars.at(0)?.type === CONST.ICON_TYPE_WORKSPACE && avatars.at(1)?.type === CONST.ICON_TYPE_AVATAR && avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE;
    // eslint-disable-next-line rulesdir/no-negated-variables
    const wasReportPreviewMovedToDifferentPolicy = shouldUseChangedPolicyID && isAReportPreviewAction;

    if (shouldUseInvoiceExpenseIcons) {
        avatars = getIconsWithDefaults(invoiceReport);
    } else if (shouldUseMappedAccountIDs) {
        avatars = avatarsForAccountIDs;
    }

    if (isNestedInInvoiceReport && !!avatars.at(1)?.id) {
        // If we have B2B Invoice between two workspaces we only should show subscript if it is not a report preview
        if (avatars.every(({type}) => type === CONST.ICON_TYPE_WORKSPACE)) {
            avatarType = isAReportPreviewAction ? CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE : CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT;
            // But if it is a report preview between workspace and another user it should never be displayed as a multiple avatar
        } else if (isWorkspaceWithUserAvatar && isAReportPreviewAction) {
            avatarType = CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT;
        }
    } else if (isUserWithWorkspaceAvatar && wasReportPreviewMovedToDifferentPolicy) {
        const policyChatReportIcon = {...getWorkspaceIcon(policyChatReport, policy), id: policyID, name: policy?.name};
        const [firstAvatar] = avatars;
        avatars = [firstAvatar, policyChatReportIcon];
    }

    return {
        avatars,
        avatarType,
        details: {
            ...(personalDetails?.[accountID] ?? {}),
            shouldDisplayAllActors: displayAllActors,
            isWorkspaceActor,
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            actorHint: String(shouldUsePrimaryAvatarID ? primaryAvatar.id : login || defaultDisplayName || fallbackDisplayName).replace(CONST.REGEX.MERGED_ACCOUNT_PREFIX, ''),
            accountID,
            delegateAccountID: !isWorkspaceActor && !!delegateAccountID ? actorAccountID : undefined,
        },
        source: {
            iouReport,
            chatReport,
            action,
        },
    };
}

export default useReportActionAvatars;
