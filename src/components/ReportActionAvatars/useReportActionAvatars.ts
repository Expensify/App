import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {getReportAction} from '@libs/ReportActionsUtils';
import {
    getDisplayNameForParticipant,
    getIcons,
    getReportActionActorAccountID,
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
}: {
    report: OnyxEntry<Report>;
    action: OnyxEntry<ReportAction>;
    shouldStackHorizontally?: boolean;
    shouldUseCardFeed?: boolean;
    accountIDs?: number[];
}) {
    /* Get avatar type */

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        canBeMissing: true,
    });
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});

    const isReportAChatReport = report?.type === CONST.REPORT.TYPE.CHAT && report?.chatType !== CONST.REPORT.CHAT_TYPE.TRIP_ROOM;

    const [reportChatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`, {canBeMissing: true});

    const chatReport = isReportAChatReport ? report : reportChatReport;
    const iouReport = isReportAChatReport ? undefined : report;

    const action = passedAction ?? (iouReport?.parentReportActionID ? getReportAction(chatReport?.reportID ?? iouReport?.chatReportID, iouReport?.parentReportActionID) : undefined);

    const isReportArchived = useReportIsArchived(iouReport?.reportID);

    const reportPreviewSenderID = useReportPreviewSenderID({
        iouReport,
        action,
        chatReport,
    });

    const policyID = chatReport?.policyID === CONST.POLICY.ID_FAKE || !chatReport?.policyID ? (iouReport?.policyID ?? chatReport?.policyID) : chatReport?.policyID;
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];

    const isATripRoom = isTripRoom(chatReport);
    const isWorkspaceWithoutChatReportProp = !chatReport && policy?.type !== CONST.POLICY.TYPE.PERSONAL;
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
    const shouldShowSubscriptAvatar = shouldReportShowSubscript(iouReport ?? chatReport, isReportArchived) && policy?.type !== CONST.POLICY.TYPE.PERSONAL;
    const shouldShowConvertedSubscriptAvatar = (shouldStackHorizontally || shouldUseAccountIDs) && shouldShowSubscriptAvatar && !reportPreviewSenderID;

    const shouldUseSubscriptAvatar =
        (((shouldShowSubscriptAvatar && isReportPreviewOrNoAction) || isReportPreviewInTripRoom || isATripPreview) &&
            !shouldStackHorizontally &&
            !isChatThreadOutsideTripRoom &&
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

    const defaultDisplayName = getDisplayNameForParticipant({accountID, personalDetailsData: personalDetails}) ?? '';
    const isAInvoiceReport = isInvoiceReport(iouReport ?? null);
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

    return {
        avatars: shouldUseMappedAccountIDs ? avatarsForAccountIDs : [primaryAvatar, secondaryAvatar],
        avatarType,
        details: {
            ...(personalDetails?.[accountID] ?? {}),
            shouldDisplayAllActors: displayAllActors,
            isWorkspaceActor,
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            actorHint: String(isWorkspaceActor ? primaryAvatar.id : login || (defaultDisplayName ?? '')).replace(CONST.REGEX.MERGED_ACCOUNT_PREFIX, ''),
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
