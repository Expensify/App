import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {getOriginalMessage, getReportAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {
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
import type {OnyxInputOrEntry, Report, ReportAction} from '@src/types/onyx';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';
import useReportPreviewSenderID from './useReportPreviewSenderID';

function useReportActionAvatars({
    report,
    action: passedAction,
    shouldStackHorizontally = false,
    shouldUseCardFeed = false,
    accountIDs = [],
    policyID: passedPolicyID,
}: {
    report: OnyxEntry<Report>;
    action: OnyxEntry<ReportAction>;
    shouldStackHorizontally?: boolean;
    shouldUseCardFeed?: boolean;
    accountIDs?: number[];
    policyID?: string;
}) {
    /* Get avatar type */
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        canBeMissing: true,
    });
    const {formatPhoneNumber} = useLocalize();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});

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

    const isReportArchived = useReportIsArchived(iouReport?.reportID);

    const reportPreviewSenderID = useReportPreviewSenderID({
        iouReport,
        action,
        chatReport,
    });

    const policyID = passedPolicyID ?? (chatReport?.policyID === CONST.POLICY.ID_FAKE || !chatReport?.policyID ? (iouReport?.policyID ?? chatReport?.policyID) : chatReport?.policyID);
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];

    const {chatReportIDAdmins, chatReportIDAnnounce, workspaceAccountID} = policy ?? {};
    const [policyChatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportIDAnnounce ?? chatReportIDAdmins}`, {canBeMissing: true});

    if (passedPolicyID) {
        const policyChatReportAvatar = {...getWorkspaceIcon(policyChatReport, policy), id: policyID, name: policy?.name};

        return {
            avatars: [policyChatReportAvatar],
            avatarType: CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE,
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
    const isAReportPreviewAction = action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW;
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

    const delegatePersonalDetails = action?.delegateAccountID ? personalDetails?.[action?.delegateAccountID] : undefined;
    const actorAccountID = getReportActionActorAccountID(action, iouReport, chatReport, delegatePersonalDetails);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const accountID = reportPreviewSenderID || (actorAccountID ?? CONST.DEFAULT_NUMBER_ID);
    const invoiceReceiverPolicy =
        chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${chatReport.invoiceReceiver.policyID}`] : undefined;
    const {avatar, fallbackIcon, login} = personalDetails?.[accountID] ?? {};

    const defaultDisplayName = getDisplayNameForParticipant({formatPhoneNumber, accountID, personalDetailsData: personalDetails}) ?? '';
    const isAInvoiceReport = isInvoiceReport(iouReport ?? null);
    const invoiceReport = [iouReport, chatReport, reportChatReport].find(isInvoiceReport);
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

    let primaryAvatar;

    if (useNearestReportAvatars) {
        primaryAvatar = getIconsWithDefaults(iouReport ?? chatReport).at(0);
    } else if (isWorkspaceActor || usePersonalDetailsAvatars) {
        primaryAvatar = reportIcons.at(0);
    } else if (delegatePersonalDetails) {
        primaryAvatar = getIconsWithDefaults(iouReport).at(0);
    } else if (isAReportPreviewAction && isATripRoom) {
        primaryAvatar = reportIcons.at(0);
    }

    primaryAvatar ??= {
        source: avatar ?? FallbackAvatar,
        id: accountID,
        name: defaultDisplayName,
        type: CONST.ICON_TYPE_AVATAR,
        fill: undefined,
        fallbackIcon,
    };

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

    secondaryAvatar ??= {
        name: '',
        source: '',
        type: CONST.ICON_TYPE_AVATAR,
        id: 0,
        fill: undefined,
        fallbackIcon,
    };

    const shouldUseActorAccountID = isAInvoiceReport && !isAReportPreviewAction;
    const accountIDsToMap = shouldUseActorAccountID && actorAccountID ? [actorAccountID] : accountIDs;

    const avatarsForAccountIDs: IconType[] = accountIDsToMap.map((id) => ({
        id,
        type: CONST.ICON_TYPE_AVATAR,
        source: personalDetails?.[id]?.avatar ?? FallbackAvatar,
        name: personalDetails?.[id]?.[shouldUseActorAccountID ? 'displayName' : 'login'] ?? '',
    }));

    const shouldUseMappedAccountIDs = avatarsForAccountIDs.length > 0 && (avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE || shouldUseActorAccountID);
    const shouldUsePrimaryAvatarID = isWorkspaceActor && !!primaryAvatar.id;
    const shouldUseInvoiceExpenseIcons = isWorkspaceExpense && isNestedInInvoiceReport && !!accountID;

    let avatars = [primaryAvatar, secondaryAvatar];

    if (shouldUseInvoiceExpenseIcons) {
        avatars = getIconsWithDefaults(invoiceReport);
    } else if (shouldUseMappedAccountIDs) {
        avatars = avatarsForAccountIDs;
    }

    return {
        avatars,
        avatarType,
        details: {
            ...(personalDetails?.[accountID] ?? {}),
            shouldDisplayAllActors: displayAllActors,
            isWorkspaceActor,
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            actorHint: String(shouldUsePrimaryAvatarID ? primaryAvatar.id : login || defaultDisplayName || 'Unknown user').replace(CONST.REGEX.MERGED_ACCOUNT_PREFIX, ''),
            accountID,
            delegateAccountID: !isWorkspaceActor && delegatePersonalDetails ? actorAccountID : undefined,
        },
        source: {
            iouReport,
            chatReport,
            action,
        },
    };
}

export default useReportActionAvatars;
