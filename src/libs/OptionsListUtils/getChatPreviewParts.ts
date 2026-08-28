import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import {formatPhoneNumber as formatPhoneNumberPhoneUtils} from '@libs/LocalePhoneNumber';
import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {
    getLastVisibleAction,
    getLastVisibleActionIncludingTransactionThread,
    getOriginalMessage,
    getRenamedAction,
    getReportActionActorAccountID,
    getReportActionMessageText,
    isActionOfType,
    isCardIssuedAction,
    isInviteOrRemovedAction,
    isMovedTransactionAction,
    isOldDotReportAction,
    isPolicyCopyReportAction,
    isRenamedAction,
    isReportActionVisibleAsLastAction,
    isTaskAction,
} from '@libs/ReportActionsUtils';
import {getReportName} from '@libs/ReportNameUtils';
import {
    canUserPerformWriteAction,
    formatReportLastMessageText,
    getReportOrDraftReport,
    isChatThread,
    isDeprecatedGroupDM,
    isDM,
    isExpenseReport,
    isChatRoom as reportUtilsIsChatRoom,
    isGroupChat as reportUtilsIsGroupChat,
    isPolicyExpenseChat as reportUtilsIsPolicyExpenseChat,
    isSelfDM as reportUtilsIsSelfDM,
    isTaskReport as reportUtilsIsTaskReport,
    isThread as reportUtilsIsThread,
} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {PersonalDetails, PersonalDetailsList, Report, ReportAction, ReportAttributesDerivedValue, VisibleReportActionsDerivedValue} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

function getLastActorDisplayName(lastActorDetails: Partial<PersonalDetails> | null, currentUserAccountID: number, translate: LocalizedTranslate) {
    if (!lastActorDetails) {
        return '';
    }

    if (lastActorDetails.accountID === CONST.ACCOUNT_ID.CONCIERGE) {
        return CONST.CONCIERGE_DISPLAY_NAME;
    }

    return lastActorDetails.accountID !== currentUserAccountID
        ? // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          lastActorDetails.firstName || temporaryGetDisplayNameOrDefault({passedPersonalDetails: lastActorDetails, translate, formatPhoneNumber: formatPhoneNumberPhoneUtils})
        : translate('common.you');
}

function shouldShowLastActorDisplayName(
    report: OnyxEntry<Report>,
    lastActorDetails: Partial<PersonalDetails> | null,
    lastAction: OnyxEntry<ReportAction>,
    currentUserAccountIDParam: number,
    translate: LocalizedTranslate,
) {
    // Use lastAction directly instead of getLastVisibleReportAction to avoid using stale cache data
    const lastReportAction = lastAction;

    // Use report.lastActionType as fallback when report actions aren't loaded yet (e.g., on cold start)
    const lastActionName = lastReportAction?.actionName ?? report?.lastActionType;

    if (
        !lastActionName ||
        !lastActorDetails ||
        reportUtilsIsSelfDM(report) ||
        (isDM(report) && lastActorDetails.accountID !== currentUserAccountIDParam) ||
        lastActionName === CONST.REPORT.ACTIONS.TYPE.IOU
    ) {
        return false;
    }

    const lastActorDisplayName = getLastActorDisplayName(lastActorDetails, currentUserAccountIDParam, translate);

    if (!lastActorDisplayName) {
        return false;
    }

    return true;
}

function getLastActorDisplayNameFromLastVisibleActions(
    report: OnyxEntry<Report>,
    lastActorDetails: Partial<PersonalDetails> | null,
    currentUserAccountIDParam: number,
    personalDetails: OnyxEntry<PersonalDetailsList>,
    privateIsArchived: boolean | undefined,
    translate: LocalizedTranslate,
    visibleReportActionsData?: VisibleReportActionsDerivedValue,
    lastAction?: OnyxEntry<ReportAction>,
): string {
    const reportID = report?.reportID;
    const canUserPerformWrite = canUserPerformWriteAction(report, privateIsArchived);
    const lastReportAction = lastAction ?? getLastVisibleAction(reportID, canUserPerformWrite, {}, undefined, visibleReportActionsData);

    if (lastReportAction) {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const lastActorAccountID = getReportActionActorAccountID(lastReportAction, undefined, undefined) || report?.lastActorAccountID;
        let actorDetails: Partial<PersonalDetails> | null = lastActorAccountID ? (personalDetails?.[lastActorAccountID] ?? null) : null;

        if (!actorDetails && lastReportAction.person?.at(0)?.text) {
            actorDetails = {
                displayName: lastReportAction.person?.at(0)?.text,
                accountID: lastActorAccountID,
            };
        }

        if (actorDetails) {
            return getLastActorDisplayName(actorDetails, currentUserAccountIDParam, translate);
        }
    }

    return getLastActorDisplayName(lastActorDetails, currentUserAccountIDParam, translate);
}

// These POLICY_CHANGE_LOG actions have no custom alternate text branch in SidebarUtils.getOptionData,
// so the LHN renders them with the generic `Name: message` prefix and search must keep the prefix too.
const POLICY_CHANGE_LOG_ACTIONS_WITHOUT_CUSTOM_TEXT = new Set<string>([
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CUSTOM_UNIT,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CATEGORIES,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.REPLACE_CATEGORIES,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SET_AUTO_REIMBURSEMENT,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DISABLED_FIELDS,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MULTIPLE_TAGS_APPROVER_RULES,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_COMMUTER_EXCLUSIONS,
]);
const POLICY_CHANGE_LOG_ACTION_NAMES = new Set<string>(
    Object.values(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG).filter((actionName) => !POLICY_CHANGE_LOG_ACTIONS_WITHOUT_CUSTOM_TEXT.has(actionName)),
);
const ROOM_CHANGE_LOG_ACTION_NAMES = new Set<string>(Object.values(CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG));
const CUSTOM_ALTERNATE_TEXT_ACTION_NAMES = new Set<string>([
    CONST.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED,
    CONST.REPORT.ACTIONS.TYPE.COMPANY_CARD_CONNECTION_BROKEN,
    CONST.REPORT.ACTIONS.TYPE.PLAID_BALANCE_FAILURE,
    CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION,
    CONST.REPORT.ACTIONS.TYPE.RETRACTED,
    CONST.REPORT.ACTIONS.TYPE.REOPENED,
    CONST.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE,
    CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL,
    CONST.REPORT.ACTIONS.TYPE.REROUTE,
    CONST.REPORT.ACTIONS.TYPE.REASSIGN_APPROVER,
    CONST.REPORT.ACTIONS.TYPE.SETTLEMENT_ACCOUNT_LOCKED,
]);

function isActionWithCustomAlternateText(lastAction: OnyxEntry<ReportAction>): boolean {
    const actionName = lastAction?.actionName;
    if (!lastAction || !actionName) {
        return false;
    }
    return (
        isRenamedAction(lastAction) ||
        isTaskAction(lastAction) ||
        isInviteOrRemovedAction(lastAction) ||
        isCardIssuedAction(lastAction) ||
        isOldDotReportAction(lastAction) ||
        isPolicyCopyReportAction(lastAction) ||
        isMovedTransactionAction(lastAction) ||
        (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT) && !!getOriginalMessage(lastAction)?.resolution) ||
        POLICY_CHANGE_LOG_ACTION_NAMES.has(actionName) ||
        ROOM_CHANGE_LOG_ACTION_NAMES.has(actionName) ||
        CUSTOM_ALTERNATE_TEXT_ACTION_NAMES.has(actionName)
    );
}

/**
 * Pieces of the chat preview line that the LHN renders for the last message.
 */
type ChatPreviewParts = {
    /** The `Name: ` prefix identifying the author of the last message, or an empty string when no prefix should be shown */
    actorPrefix: string;

    /** Replacement preview text for actions whose LHN alternate text embeds the actor (e.g. rename, leave room, invite/remove) */
    customAlternateText?: string;
};

/**
 * Returns the chat preview pieces that the LHN (SidebarUtils.getOptionData) renders for the last message:
 * the `Name: ` actor prefix, plus a replacement text for the actions whose LHN alternate text embeds the actor
 * (rename, leave room, invite/remove) — excluding those from the generic prefix alone would drop the actor.
 */
function getChatPreviewParts({
    report,
    personalDetails,
    isReportArchived,
    translate,
    visibleReportActionsData,
    currentUserAccountID,
    sortedActions,
    reportAttributesDerived,
    oneTransactionThreadReportID,
}: {
    report: OnyxEntry<Report>;
    personalDetails: OnyxEntry<PersonalDetailsList>;
    isReportArchived: boolean | undefined;
    translate: LocalizedTranslate;
    visibleReportActionsData?: VisibleReportActionsDerivedValue;
    currentUserAccountID: number | undefined;
    sortedActions?: Record<string, ReportAction[]>;
    reportAttributesDerived?: ReportAttributesDerivedValue['reports'];
    oneTransactionThreadReportID?: string;
}): ChatPreviewParts {
    if (!report || isReportArchived || currentUserAccountID === undefined) {
        return {actorPrefix: ''};
    }
    const canUserPerformWrite = canUserPerformWriteAction(report, isReportArchived);
    const sortedActionsForReport = sortedActions?.[report.reportID];

    const lastAction = sortedActionsForReport
        ? sortedActionsForReport.find((action) => isReportActionVisibleAsLastAction(action, canUserPerformWrite, visibleReportActionsData, report.reportID, currentUserAccountID))
        : getLastVisibleActionIncludingTransactionThread(report.reportID, canUserPerformWrite, undefined, visibleReportActionsData, oneTransactionThreadReportID, currentUserAccountID);

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const lastActorAccountID = getReportActionActorAccountID(lastAction, undefined, undefined) || report.lastActorAccountID;
    let resolvedLastActorDetails: Partial<PersonalDetails> | null = lastActorAccountID ? (personalDetails?.[lastActorAccountID] ?? null) : null;
    if (!resolvedLastActorDetails && lastAction?.person?.at(0)?.text) {
        resolvedLastActorDetails = {
            displayName: lastAction.person.at(0)?.text,
            accountID: report.lastActorAccountID,
        };
    }
    const lastActorDisplayName = getLastActorDisplayName(resolvedLastActorDetails, currentUserAccountID, translate);

    const isThreadMessage =
        reportUtilsIsThread(report) && lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT && lastAction?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const usesChatPrefixRules =
        reportUtilsIsChatRoom(report) ||
        reportUtilsIsPolicyExpenseChat(report) ||
        isChatThread(report) ||
        reportUtilsIsTaskReport(report) ||
        isThreadMessage ||
        reportUtilsIsGroupChat(report) ||
        isDeprecatedGroupDM(report, isReportArchived);

    let customAlternateText: string | undefined;
    if (usesChatPrefixRules) {
        if (isRenamedAction(lastAction)) {
            customAlternateText = getRenamedAction(translate, lastAction, isExpenseReport(report), lastActorDisplayName);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_ROOM) {
            const actionMessage = getReportActionMessageText(lastAction);
            customAlternateText = actionMessage ? `${lastActorDisplayName}: ${actionMessage}` : '';
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.LEAVE_ROOM) {
            customAlternateText = translate('report.actions.type.leftTheChatWithName', lastActorDisplayName);
        } else if (isInviteOrRemovedAction(lastAction)) {
            let actorDetails: Partial<PersonalDetails> | undefined;
            if (lastAction.actorAccountID) {
                actorDetails = personalDetails?.[lastAction.actorAccountID] ?? undefined;
            }
            let actorDisplayName = lastAction.person?.[0]?.text;
            if (!actorDetails && actorDisplayName && lastAction.actorAccountID) {
                actorDetails = {
                    displayName: actorDisplayName,
                    accountID: lastAction.actorAccountID,
                };
            }
            actorDisplayName = actorDetails ? getLastActorDisplayName(actorDetails, currentUserAccountID, translate) : undefined;
            const lastActionOriginalMessage = getOriginalMessage(lastAction);
            const targetAccountIDs = lastActionOriginalMessage?.targetAccountIDs ?? [];
            const targetAccountIDsLength = targetAccountIDs.length !== 0 ? targetAccountIDs.length : (report.lastMessageHtml?.match(/<mention-user[^>]*><\/mention-user>/g)?.length ?? 0);
            const isInvite =
                lastAction.actionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM || lastAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM;
            const verb = isInvite ? translate('workspace.invite.invited') : translate('workspace.invite.removed');
            const users = translate(targetAccountIDsLength > 1 ? 'common.members' : 'common.member')?.toLocaleLowerCase();
            customAlternateText = formatReportLastMessageText(`${actorDisplayName ?? lastActorDisplayName}: ${verb} ${targetAccountIDsLength} ${users}`);
            const lastActionReport = lastActionOriginalMessage?.reportID ? getReportOrDraftReport(String(lastActionOriginalMessage.reportID)) : undefined;
            const derivedReportName = lastActionReport?.reportID ? reportAttributesDerived?.[lastActionReport.reportID]?.reportName : undefined;
            const roomName = getReportName(lastActionReport, derivedReportName) || lastActionOriginalMessage?.roomName;
            if (roomName) {
                const preposition = isInvite ? ` ${translate('workspace.invite.to')}` : ` ${translate('workspace.invite.from')}`;
                customAlternateText += `${preposition} ${roomName}`;
            }
        }
    }

    const shouldShowActorPrefix = usesChatPrefixRules
        ? lastAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW && !!lastActorDisplayName && !isActionWithCustomAlternateText(lastAction)
        : shouldShowLastActorDisplayName(report, resolvedLastActorDetails, lastAction, currentUserAccountID, translate);
    if (!shouldShowActorPrefix) {
        return {actorPrefix: '', customAlternateText};
    }
    const displayName =
        getLastActorDisplayNameFromLastVisibleActions(
            report,
            resolvedLastActorDetails,
            currentUserAccountID,
            personalDetails,
            isReportArchived,
            translate,
            visibleReportActionsData,
            lastAction,
        ) || lastActorDisplayName;
    return {actorPrefix: displayName ? `${displayName}: ` : '', customAlternateText};
}

export {getChatPreviewParts, getLastActorDisplayName, getLastActorDisplayNameFromLastVisibleActions, shouldShowLastActorDisplayName};
