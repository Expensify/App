/* eslint-disable @typescript-eslint/prefer-for-of */
import * as Sentry from '@sentry/react-native';
import {Str} from 'expensify-common';
import deburr from 'lodash/deburr';
import lodashOrderBy from 'lodash/orderBy';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {SetNonNullable} from 'type-fest';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import {getEnabledCategoriesCount} from '@libs/CategoryUtils';
import filterArrayByMatch from '@libs/filterArrayByMatch';
import {isReportMessageAttachment} from '@libs/isReportMessageAttachment';
import {formatPhoneNumber as formatPhoneNumberPhoneUtils} from '@libs/LocalePhoneNumber';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {translateLocal} from '@libs/Localize';
import {appendCountryCode, getPhoneNumberWithoutSpecialChars} from '@libs/LoginUtils';
import {MaxHeap} from '@libs/MaxHeap';
import {MinHeap} from '@libs/MinHeap';
import {getForReportActionTemp} from '@libs/ModifiedExpenseMessage';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import Performance from '@libs/Performance';
import Permissions from '@libs/Permissions';
import {getDisplayNameOrDefault, getPersonalDetailByEmail, getPersonalDetailsByIDs} from '@libs/PersonalDetailsUtils';
import {addSMSDomainIfPhoneNumber, parsePhoneNumber} from '@libs/PhoneNumber';
import {
    canSendInvoiceFromWorkspace,
    canSubmitPerDiemExpenseFromWorkspace,
    getCountOfEnabledTagsOfList,
    getCountOfRequiredTagLists,
    getSubmitToAccountID,
    hasDynamicExternalWorkflow,
    isCurrentUserMemberOfAnyPolicy,
} from '@libs/PolicyUtils';
import {
    getActionableMentionWhisperMessage,
    getChangedApproverActionMessage,
    getCombinedReportActions,
    getDynamicExternalWorkflowRoutedMessage,
    getExportIntegrationLastMessageText,
    getInvoiceCompanyNameUpdateMessage,
    getInvoiceCompanyWebsiteUpdateMessage,
    getIOUReportIDFromReportActionPreview,
    getJoinRequestMessage,
    getLastVisibleMessage,
    getMarkedReimbursedMessage,
    getMentionedAccountIDsFromAction,
    getMessageOfOldDotReportAction,
    getOneTransactionThreadReportID,
    getOriginalMessage,
    getPolicyChangeLogMaxExpenseAgeMessage,
    getPolicyChangeLogMaxExpenseAmountMessage,
    getRenamedAction,
    getReportActionActorAccountID,
    getReportActionHtml,
    getReportActionMessageText,
    getRoomAvatarUpdatedMessage,
    getRoomChangeLogMessage,
    getSortedReportActions,
    getTravelUpdateMessage,
    getUpdateACHAccountMessage,
    getUpdateRoomDescriptionMessage,
    hasPendingDEWSubmit,
    isActionableAddPaymentCard,
    isActionableJoinRequest,
    isActionableMentionWhisper,
    isActionOfType,
    isAddCommentAction,
    isClosedAction,
    isCreatedTaskReportAction,
    isDeletedParentAction,
    isDynamicExternalWorkflowSubmitFailedAction,
    isInviteOrRemovedAction,
    isMarkAsClosedAction,
    isModifiedExpenseAction,
    isMoneyRequestAction,
    isMovedAction,
    isMovedTransactionAction,
    isOldDotReportAction,
    isPendingRemove,
    isReimbursementDeQueuedOrCanceledAction,
    isReimbursementQueuedAction,
    isRenamedAction,
    isReportPreviewAction,
    isTaskAction,
    isThreadParentMessage,
    isUnapprovedAction,
    isWhisperAction,
    shouldReportActionBeVisible,
    withDEWRoutedActionsArray,
} from '@libs/ReportActionsUtils';
import {computeReportName} from '@libs/ReportNameUtils';
import type {OptionData} from '@libs/ReportUtils';
import {
    canUserPerformWriteAction,
    formatReportLastMessageText,
    getChatByParticipants,
    getChatRoomSubtitle,
    getDeletedParentActionMessageForChatReport,
    getDeletedTransactionMessage,
    getDisplayNameForParticipant,
    getIcons,
    getMovedActionMessage,
    getMovedTransactionMessage,
    getParticipantsAccountIDsForDisplay,
    getPolicyChangeMessage,
    getPolicyName,
    getReimbursementDeQueuedOrCanceledActionMessage,
    getReimbursementQueuedActionMessage,
    getReportLastMessage,
    getReportNotificationPreference,
    getReportOrDraftReport,
    getReportPreviewMessage,
    getReportSubtitlePrefix,
    getUnreportedTransactionMessage,
    hasIOUWaitingOnCurrentUserBankAccount,
    isArchivedNonExpenseReport,
    isChatThread,
    isDM,
    isDraftReport,
    isExpenseReport,
    isHiddenForCurrentUser,
    isInvoiceRoom,
    isMoneyRequest,
    isPolicyAdmin,
    isUnread,
    isAdminRoom as reportUtilsIsAdminRoom,
    isAnnounceRoom as reportUtilsIsAnnounceRoom,
    isChatReport as reportUtilsIsChatReport,
    isChatRoom as reportUtilsIsChatRoom,
    isGroupChat as reportUtilsIsGroupChat,
    isMoneyRequestReport as reportUtilsIsMoneyRequestReport,
    isOneOnOneChat as reportUtilsIsOneOnOneChat,
    isPolicyExpenseChat as reportUtilsIsPolicyExpenseChat,
    isSelfDM as reportUtilsIsSelfDM,
    isTaskReport as reportUtilsIsTaskReport,
    shouldDisplayViolationsRBRInLHN,
    shouldReportBeInOptionList,
} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import {getTaskCreatedMessage, getTaskReportActionMessage} from '@libs/TaskUtils';
import {generateAccountID} from '@libs/UserUtils';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {
    Beta,
    DismissedProductTraining,
    Login,
    OnyxInputOrEntry,
    PersonalDetails,
    PersonalDetailsList,
    Policy,
    PolicyCategories,
    PolicyCategory,
    PolicyTag,
    PolicyTagLists,
    Report,
    ReportAction,
    ReportActions,
    ReportAttributesDerivedValue,
    ReportMetadata,
    ReportNameValuePairs,
} from '@src/types/onyx';
import type {Attendee, Participant} from '@src/types/onyx/IOU';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {
    FilterUserToInviteConfig,
    GetOptionsConfig,
    GetUserToInviteConfig,
    GetValidReportsConfig,
    IsValidReportsConfig,
    MemberForList,
    Option,
    OptionList,
    Options,
    OrderOptionsConfig,
    OrderReportOptionsConfig,
    PayeePersonalDetails,
    PreviewConfig,
    ReportAndPersonalDetailOptions,
    SearchOption,
    SearchOptionData,
    SectionForSearchTerm,
} from './types';

/**
 * OptionsListUtils is used to build a list options passed to the OptionsList component. Several different UI views can
 * be configured to display different results based on the options passed to the private getOptions() method. Public
 * methods should be named for the views they build options for and then exported for use in a component.
 */

let allPersonalDetails: OnyxEntry<PersonalDetailsList>;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => (allPersonalDetails = isEmptyObject(value) ? {} : value),
});

const policies: OnyxCollection<Policy> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    callback: (policy, key) => {
        if (!policy || !key || !policy.name) {
            return;
        }

        policies[key] = policy;
    },
});

let allPolicies: OnyxCollection<Policy> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (val) => (allPolicies = val),
});

let allReports: OnyxCollection<Report>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReports = value;
    },
});

let allReportNameValuePairsOnyxConnect: OnyxCollection<ReportNameValuePairs>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReportNameValuePairsOnyxConnect = value;
    },
});

const lastReportActions: ReportActions = {};
const allSortedReportActions: Record<string, ReportAction[]> = {};
let allReportActions: OnyxCollection<ReportActions>;
const lastVisibleReportActions: ReportActions = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: (actions) => {
        if (!actions) {
            return;
        }

        allReportActions = actions ?? {};

        // Iterate over the report actions to build the sorted and lastVisible report actions objects
        for (const reportActions of Object.entries(allReportActions)) {
            const reportID = reportActions[0].split('_').at(1);
            if (!reportID) {
                continue;
            }

            const reportActionsArray = Object.values(reportActions[1] ?? {});
            let sortedReportActions = getSortedReportActions(withDEWRoutedActionsArray(reportActionsArray), true);
            allSortedReportActions[reportID] = sortedReportActions;
            const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
            const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`];

            // If the report is a one-transaction report and has , we need to return the combined reportActions so that the LHN can display modifications
            // to the transaction thread or the report itself
            const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, actions[reportActions[0]]);
            if (transactionThreadReportID) {
                const transactionThreadReportActionsArray = Object.values(actions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`] ?? {});
                sortedReportActions = getCombinedReportActions(sortedReportActions, transactionThreadReportID, transactionThreadReportActionsArray, reportID);
            }

            const firstReportAction = sortedReportActions.at(0);
            if (!firstReportAction) {
                delete lastReportActions[reportID];
            } else {
                lastReportActions[reportID] = firstReportAction;
            }

            const reportNameValuePairs = allReportNameValuePairsOnyxConnect?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`];
            const isReportArchived = !!reportNameValuePairs?.private_isArchived;
            const isWriteActionAllowed = canUserPerformWriteAction(report, isReportArchived);

            // The report is only visible if it is the last action not deleted that
            // does not match a closed or created state.
            const reportActionsForDisplay = sortedReportActions.filter(
                (reportAction, actionKey) =>
                    (!(isWhisperAction(reportAction) && !isReportPreviewAction(reportAction) && !isMoneyRequestAction(reportAction)) || isActionableMentionWhisper(reportAction)) &&
                    shouldReportActionBeVisible(reportAction, actionKey, isWriteActionAllowed) &&
                    reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED &&
                    reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            );
            const reportActionForDisplay = reportActionsForDisplay.at(0);
            if (!reportActionForDisplay) {
                delete lastVisibleReportActions[reportID];
                continue;
            }
            lastVisibleReportActions[reportID] = reportActionForDisplay;
        }
    },
});

let activePolicyID: OnyxEntry<string>;
Onyx.connect({
    key: ONYXKEYS.NVP_ACTIVE_POLICY_ID,
    callback: (value) => (activePolicyID = value),
});

/**
 * Returns the personal details for an array of accountIDs
 * @returns keys of the object are emails, values are PersonalDetails objects.
 */
function getPersonalDetailsForAccountIDs(accountIDs: number[] | undefined, personalDetails: OnyxInputOrEntry<PersonalDetailsList>): SetNonNullable<PersonalDetailsList> {
    const personalDetailsForAccountIDs: SetNonNullable<PersonalDetailsList> = {};
    if (!personalDetails) {
        return personalDetailsForAccountIDs;
    }
    if (accountIDs) {
        for (const accountID of accountIDs) {
            const cleanAccountID = Number(accountID);
            if (!cleanAccountID) {
                continue;
            }
            let personalDetail: OnyxEntry<PersonalDetails> = personalDetails[accountID] ?? undefined;
            if (!personalDetail) {
                personalDetail = {} as PersonalDetails;
            }

            if (cleanAccountID === CONST.ACCOUNT_ID.CONCIERGE) {
                personalDetail.avatar = CONST.CONCIERGE_ICON_URL;
            }

            personalDetail.accountID = cleanAccountID;
            personalDetailsForAccountIDs[cleanAccountID] = personalDetail;
        }
    }
    return personalDetailsForAccountIDs;
}

/**
 * Return true if personal details data is ready, i.e. report list options can be created.
 */
function isPersonalDetailsReady(personalDetails: OnyxEntry<PersonalDetailsList>): boolean {
    const personalDetailsKeys = Object.keys(personalDetails ?? {});
    return personalDetailsKeys.some((key) => personalDetails?.[key]?.accountID);
}

/**
 * Get the participant option for a report.
 */
function getParticipantsOption(participant: OptionData | Participant, personalDetails: OnyxEntry<PersonalDetailsList>): Participant {
    const detail = participant.accountID ? getPersonalDetailsForAccountIDs([participant.accountID], personalDetails)[participant.accountID] : undefined;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const login = detail?.login || participant.login || '';
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const displayName = participant?.displayName || formatPhoneNumberPhoneUtils(getDisplayNameOrDefault(detail, login || participant.text));

    return {
        keyForList: String(detail?.accountID ?? login),
        login,
        accountID: detail?.accountID,
        text: displayName,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        firstName: (detail?.firstName || participant.firstName) ?? '',
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        lastName: (detail?.lastName || participant.lastName) ?? '',
        alternateText: formatPhoneNumberPhoneUtils(login) || displayName,
        icons: [
            {
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                source: (participant.avatar || detail?.avatar) ?? FallbackAvatar,
                name: login,
                type: CONST.ICON_TYPE_AVATAR,
                id: detail?.accountID,
            },
        ],
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        phoneNumber: (detail?.phoneNumber || participant?.phoneNumber) ?? '',
        isSelected: participant.selected,
        selected: participant.selected, // Keep for backwards compatibility
        searchText: participant.searchText ?? undefined,
    };
}

/**
 * A very optimized method to remove duplicates from an array.
 * Taken from https://stackoverflow.com/a/9229821/9114791
 */
function uniqFast(items: string[]): string[] {
    const seenItems: Record<string, number> = {};
    const result: string[] = [];
    let j = 0;

    for (const item of items) {
        if (seenItems[item] !== 1) {
            seenItems[item] = 1;
            result[j++] = item;
        }
    }

    return result;
}

function getLastActorDisplayName(lastActorDetails: Partial<PersonalDetails> | null, currentUserAccountID: number) {
    if (!lastActorDetails) {
        return '';
    }

    if (lastActorDetails.accountID === CONST.ACCOUNT_ID.CONCIERGE) {
        return CONST.CONCIERGE_DISPLAY_NAME;
    }

    return lastActorDetails.accountID !== currentUserAccountID
        ? // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          lastActorDetails.firstName || formatPhoneNumberPhoneUtils(getDisplayNameOrDefault(lastActorDetails))
        : // eslint-disable-next-line @typescript-eslint/no-deprecated
          translateLocal('common.you');
}

function shouldShowLastActorDisplayName(
    report: OnyxEntry<Report>,
    lastActorDetails: Partial<PersonalDetails> | null,
    lastAction: OnyxEntry<ReportAction>,
    currentUserAccountIDParam: number,
) {
    const reportID = report?.reportID;
    const lastReportAction = (reportID ? lastVisibleReportActions[reportID] : undefined) ?? lastAction;

    // Use report.lastActionType as fallback when report actions aren't loaded yet (e.g., on cold start)
    const lastActionName = lastReportAction?.actionName ?? report?.lastActionType;

    if (
        !lastActionName ||
        !lastActorDetails ||
        reportUtilsIsSelfDM(report) ||
        (isDM(report) && lastActorDetails.accountID !== currentUserAccountIDParam) ||
        lastActionName === CONST.REPORT.ACTIONS.TYPE.IOU ||
        (lastActionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW &&
            Object.keys(report?.participants ?? {})?.some((participantID) => participantID === CONST.ACCOUNT_ID.MANAGER_MCTEST.toString()))
    ) {
        return false;
    }

    const lastActorDisplayName = getLastActorDisplayName(lastActorDetails, currentUserAccountIDParam);

    if (!lastActorDisplayName) {
        return false;
    }

    return true;
}

/**
 * Update alternate text for the option when applicable
 */
function getAlternateText(
    option: OptionData,
    {showChatPreviewLine = false, forcePolicyNamePreview = false}: PreviewConfig,
    policyTags: OnyxEntry<PolicyTagLists>,
    isReportArchived: boolean | undefined,
    currentUserAccountID: number,
    lastActorDetails: Partial<PersonalDetails> | null = {},
) {
    const report = getReportOrDraftReport(option.reportID);
    const isAdminRoom = reportUtilsIsAdminRoom(report);
    const isAnnounceRoom = reportUtilsIsAnnounceRoom(report);
    const isGroupChat = reportUtilsIsGroupChat(report);
    const isExpenseThread = isMoneyRequest(report);
    const formattedLastMessageText =
        formatReportLastMessageText(Parser.htmlToText(option.lastMessageText ?? '')) ||
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        getLastMessageTextForReport({translate: translateLocal, report, lastActorDetails, isReportArchived, currentUserAccountID, policyTags});
    const reportPrefix = getReportSubtitlePrefix(report);
    const formattedLastMessageTextWithPrefix = reportPrefix + formattedLastMessageText;

    if (isExpenseThread || option.isMoneyRequestReport) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return showChatPreviewLine && formattedLastMessageText ? formattedLastMessageTextWithPrefix : translateLocal('iou.expense');
    }

    if (option.isThread) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return showChatPreviewLine && formattedLastMessageText ? formattedLastMessageTextWithPrefix : translateLocal('threads.thread');
    }

    if (option.isChatRoom && !isAdminRoom && !isAnnounceRoom) {
        return showChatPreviewLine && formattedLastMessageText ? formattedLastMessageTextWithPrefix : option.subtitle;
    }

    if ((option.isPolicyExpenseChat ?? false) || isAdminRoom || isAnnounceRoom) {
        return showChatPreviewLine && !forcePolicyNamePreview && formattedLastMessageText ? formattedLastMessageTextWithPrefix : option.subtitle;
    }

    if (option.isTaskReport) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return showChatPreviewLine && formattedLastMessageText ? formattedLastMessageTextWithPrefix : translateLocal('task.task');
    }

    if (isGroupChat) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return showChatPreviewLine && formattedLastMessageText ? formattedLastMessageTextWithPrefix : translateLocal('common.group');
    }

    return showChatPreviewLine && formattedLastMessageText
        ? formattedLastMessageTextWithPrefix
        : formatPhoneNumberPhoneUtils(option.participantsList && option.participantsList.length > 0 ? (option.participantsList.at(0)?.login ?? '') : '');
}

/**
 * Searches for a match when provided with a value
 */
function isSearchStringMatch(searchValue: string, searchText?: string | null, participantNames = new Set<string>(), isReportChatRoom = false): boolean {
    const searchWords = new Set(searchValue.replaceAll(',', ' ').split(/\s+/));
    const valueToSearch = searchText?.replaceAll(new RegExp(/&nbsp;/g), '');
    let matching = true;
    for (const word of searchWords) {
        // if one of the word is not matching, we don't need to check further
        if (!matching) {
            continue;
        }
        const matchRegex = new RegExp(Str.escapeForRegExp(word), 'i');
        matching = matchRegex.test(valueToSearch ?? '') || (!isReportChatRoom && participantNames.has(word));
    }
    return matching;
}

function isSearchStringMatchUserDetails(personalDetail: PersonalDetails, searchValue: string) {
    let memberDetails = '';
    if (personalDetail.login) {
        memberDetails += ` ${personalDetail.login}`;
    }
    if (personalDetail.firstName) {
        memberDetails += ` ${personalDetail.firstName}`;
    }
    if (personalDetail.lastName) {
        memberDetails += ` ${personalDetail.lastName}`;
    }
    if (personalDetail.displayName) {
        memberDetails += ` ${getDisplayNameOrDefault(personalDetail)}`;
    }
    if (personalDetail.phoneNumber) {
        memberDetails += ` ${personalDetail.phoneNumber}`;
    }
    return isSearchStringMatch(searchValue.trim(), memberDetails.toLowerCase());
}

/**
 * Get IOU report ID of report last action if the action is report action preview
 */
function getIOUReportIDOfLastAction(report: OnyxEntry<Report>): string | undefined {
    if (!report?.reportID) {
        return;
    }
    const lastAction = lastVisibleReportActions[report.reportID];
    if (!isReportPreviewAction(lastAction)) {
        return;
    }
    return getReportOrDraftReport(getIOUReportIDFromReportActionPreview(lastAction))?.reportID;
}

function hasHiddenDisplayNames(accountIDs: number[]) {
    return getPersonalDetailsByIDs({accountIDs, currentUserAccountID: 0}).some((personalDetail) => !getDisplayNameOrDefault(personalDetail, undefined, false));
}

function getLastActorDisplayNameFromLastVisibleActions(
    report: OnyxEntry<Report>,
    lastActorDetails: Partial<PersonalDetails> | null,
    currentUserAccountIDParam: number,
    personalDetails: OnyxEntry<PersonalDetailsList>,
): string {
    const reportID = report?.reportID;
    const lastReportAction = reportID ? lastVisibleReportActions[reportID] : undefined;

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
            return getLastActorDisplayName(actorDetails, currentUserAccountIDParam);
        }
    }

    return getLastActorDisplayName(lastActorDetails, currentUserAccountIDParam);
}

/**
 * Get the last message text from the report directly or from other sources for special cases.
 */
function getLastMessageTextForReport({
    translate,
    report,
    lastActorDetails,
    movedFromReport,
    movedToReport,
    policy,
    isReportArchived = false,
    policyTags,
    reportMetadata,
    currentUserAccountID,
}: {
    translate: LocalizedTranslate;
    report: OnyxEntry<Report>;
    lastActorDetails: Partial<PersonalDetails> | null;
    movedFromReport?: OnyxEntry<Report>;
    movedToReport?: OnyxEntry<Report>;
    policy?: OnyxEntry<Policy>;
    isReportArchived?: boolean;
    policyTags: OnyxEntry<PolicyTagLists>;
    reportMetadata?: OnyxEntry<ReportMetadata>;
    currentUserAccountID: number;
}): string {
    const reportID = report?.reportID;
    const lastReportAction = reportID ? lastVisibleReportActions[reportID] : undefined;
    const lastVisibleMessage = getLastVisibleMessage(report?.reportID);

    // some types of actions are filtered out for lastReportAction, in some cases we need to check the actual last action
    const lastOriginalReportAction = reportID ? lastReportActions[reportID] : undefined;
    let lastMessageTextFromReport = '';

    if (isArchivedNonExpenseReport(report, isReportArchived)) {
        const archiveReason =
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            (isClosedAction(lastOriginalReportAction) && getOriginalMessage(lastOriginalReportAction)?.reason) || CONST.REPORT.ARCHIVE_REASON.DEFAULT;
        switch (archiveReason) {
            case CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED:
            case CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY:
            case CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED: {
                lastMessageTextFromReport = translate(`reportArchiveReasons.${archiveReason}`, {
                    displayName: formatPhoneNumberPhoneUtils(getDisplayNameOrDefault(lastActorDetails)),
                    policyName: getPolicyName({report, policy}),
                });
                break;
            }
            case CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED: {
                lastMessageTextFromReport = translate(`reportArchiveReasons.${archiveReason}`);
                break;
            }
            default: {
                lastMessageTextFromReport = translate(`reportArchiveReasons.default`);
            }
        }
    } else if (isMoneyRequestAction(lastReportAction)) {
        const properSchemaForMoneyRequestMessage = getReportPreviewMessage(report, lastReportAction, true, false, null, true);
        lastMessageTextFromReport = formatReportLastMessageText(Parser.htmlToText(properSchemaForMoneyRequestMessage));
    } else if (isReportPreviewAction(lastReportAction)) {
        const iouReport = getReportOrDraftReport(getIOUReportIDFromReportActionPreview(lastReportAction));
        const lastIOUMoneyReportAction = iouReport?.reportID
            ? allSortedReportActions[iouReport.reportID]?.find(
                  (reportAction, key): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                      shouldReportActionBeVisible(reportAction, key, canUserPerformWriteAction(report, isReportArchived)) &&
                      reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
                      isMoneyRequestAction(reportAction),
              )
            : undefined;
        // For workspace chats, use the report title
        if (reportUtilsIsPolicyExpenseChat(report) && !isEmptyObject(iouReport)) {
            const reportName = computeReportName(iouReport, undefined, undefined, undefined, undefined, undefined, undefined, currentUserAccountID);
            lastMessageTextFromReport = formatReportLastMessageText(reportName);
        } else {
            const reportPreviewMessage = getReportPreviewMessage(
                !isEmptyObject(iouReport) ? iouReport : null,
                lastIOUMoneyReportAction ?? lastReportAction,
                true,
                reportUtilsIsChatReport(report),
                null,
                true,
                lastReportAction,
            );
            lastMessageTextFromReport = formatReportLastMessageText(Parser.htmlToText(reportPreviewMessage));
        }
    } else if (isReimbursementQueuedAction(lastReportAction)) {
        lastMessageTextFromReport = getReimbursementQueuedActionMessage({reportAction: lastReportAction, translate, formatPhoneNumber: formatPhoneNumberPhoneUtils, report});
    } else if (isReimbursementDeQueuedOrCanceledAction(lastReportAction)) {
        lastMessageTextFromReport = getReimbursementDeQueuedOrCanceledActionMessage(translate, lastReportAction, report);
    } else if (isDeletedParentAction(lastReportAction) && reportUtilsIsChatReport(report)) {
        lastMessageTextFromReport = getDeletedParentActionMessageForChatReport(lastReportAction);
    } else if (isPendingRemove(lastReportAction) && report?.reportID && isThreadParentMessage(lastReportAction, report.reportID)) {
        lastMessageTextFromReport = translate('parentReportAction.hiddenMessage');
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED)) {
        lastMessageTextFromReport = getMarkedReimbursedMessage(lastReportAction);
    } else if (isReportMessageAttachment({text: report?.lastMessageText ?? '', html: report?.lastMessageHtml, type: ''})) {
        lastMessageTextFromReport = `[${translate('common.attachment')}]`;
    } else if (isModifiedExpenseAction(lastReportAction)) {
        const properSchemaForModifiedExpenseMessage = getForReportActionTemp({
            translate,
            reportAction: lastReportAction,
            movedFromReport,
            movedToReport,
            policyTags,
        });
        lastMessageTextFromReport = formatReportLastMessageText(properSchemaForModifiedExpenseMessage, true);
    } else if (isMovedTransactionAction(lastReportAction)) {
        lastMessageTextFromReport = Parser.htmlToText(getMovedTransactionMessage(translate, lastReportAction));
    } else if (isTaskAction(lastReportAction)) {
        lastMessageTextFromReport = formatReportLastMessageText(getTaskReportActionMessage(translate, lastReportAction).text);
    } else if (isCreatedTaskReportAction(lastReportAction)) {
        lastMessageTextFromReport = getTaskCreatedMessage(translate, lastReportAction, getReportOrDraftReport(lastReportAction?.childReportID));
    } else if (
        isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.SUBMITTED) ||
        isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED) ||
        isMarkAsClosedAction(lastReportAction)
    ) {
        const wasSubmittedViaHarvesting = !isMarkAsClosedAction(lastReportAction) ? (getOriginalMessage(lastReportAction)?.harvesting ?? false) : false;
        const isDEWPolicy = hasDynamicExternalWorkflow(policy);
        const isPendingAdd = lastReportAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;

        if (wasSubmittedViaHarvesting) {
            lastMessageTextFromReport = Parser.htmlToText(translate('iou.automaticallySubmitted'));
        } else if (hasPendingDEWSubmit(reportMetadata, isDEWPolicy) && isPendingAdd) {
            lastMessageTextFromReport = translate('iou.queuedToSubmitViaDEW');
        } else {
            lastMessageTextFromReport = translate('iou.submitted', {memo: getOriginalMessage(lastReportAction)?.message});
        }
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.APPROVED)) {
        const {automaticAction} = getOriginalMessage(lastReportAction) ?? {};
        if (automaticAction) {
            lastMessageTextFromReport = Parser.htmlToText(translate('iou.automaticallyApproved'));
        } else {
            lastMessageTextFromReport = translate('iou.approvedMessage');
        }
    } else if (isDynamicExternalWorkflowSubmitFailedAction(lastReportAction)) {
        lastMessageTextFromReport = getOriginalMessage(lastReportAction)?.message ?? translate('iou.error.genericCreateFailureMessage');
    } else if (isUnapprovedAction(lastReportAction)) {
        lastMessageTextFromReport = translate('iou.unapproved');
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.FORWARDED)) {
        const {automaticAction} = getOriginalMessage(lastReportAction) ?? {};
        if (automaticAction) {
            lastMessageTextFromReport = Parser.htmlToText(translate('iou.automaticallyForwarded'));
        } else {
            lastMessageTextFromReport = translate('iou.forwarded');
        }
    } else if (lastReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REJECTED) {
        lastMessageTextFromReport = translate('iou.rejectedThisReport');
    } else if (lastReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_UPGRADE) {
        lastMessageTextFromReport = translate('workspaceActions.upgradedWorkspace');
    } else if (lastReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_FORCE_UPGRADE) {
        lastMessageTextFromReport = Parser.htmlToText(translate('workspaceActions.forcedCorporateUpgrade'));
    } else if (lastReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.TEAM_DOWNGRADE) {
        lastMessageTextFromReport = translate('workspaceActions.downgradedWorkspace');
    } else if (isActionableAddPaymentCard(lastReportAction)) {
        lastMessageTextFromReport = getReportActionMessageText(lastReportAction);
    } else if (lastReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION) {
        lastMessageTextFromReport = getExportIntegrationLastMessageText(translate, lastReportAction);
    } else if (lastReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.RECEIPT_SCAN_FAILED) {
        lastMessageTextFromReport = translate('iou.receiptScanningFailed');
    } else if (lastReportAction?.actionName && isOldDotReportAction(lastReportAction)) {
        lastMessageTextFromReport = getMessageOfOldDotReportAction(translate, lastReportAction, false);
    } else if (isActionableJoinRequest(lastReportAction)) {
        lastMessageTextFromReport = getJoinRequestMessage(translate, lastReportAction);
    } else if (lastReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.LEAVE_ROOM) {
        lastMessageTextFromReport = translate('report.actions.type.leftTheChat');
    } else if (lastReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.RESOLVED_DUPLICATES) {
        lastMessageTextFromReport = translate('violations.resolvedDuplicates');
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_DESCRIPTION)) {
        lastMessageTextFromReport = Parser.htmlToText(getUpdateRoomDescriptionMessage(translate, lastReportAction));
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_AVATAR)) {
        lastMessageTextFromReport = getRoomAvatarUpdatedMessage(translate, lastReportAction);
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.RETRACTED)) {
        lastMessageTextFromReport = translate('iou.retracted');
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.REOPENED)) {
        lastMessageTextFromReport = translate('iou.reopened');
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.CHANGE_POLICY)) {
        lastMessageTextFromReport = getPolicyChangeMessage(translate, lastReportAction);
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE)) {
        lastMessageTextFromReport = getTravelUpdateMessage(translate, lastReportAction);
    } else if (isInviteOrRemovedAction(lastReportAction)) {
        lastMessageTextFromReport = getRoomChangeLogMessage(translate, lastReportAction);
    } else if (isRenamedAction(lastReportAction)) {
        lastMessageTextFromReport = getRenamedAction(translate, lastReportAction, isExpenseReport(report));
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.DELETED_TRANSACTION)) {
        lastMessageTextFromReport = getDeletedTransactionMessage(translate, lastReportAction);
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL) || isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.REROUTE)) {
        lastMessageTextFromReport = Parser.htmlToText(getChangedApproverActionMessage(translate, lastReportAction));
    } else if (isMovedAction(lastReportAction)) {
        lastMessageTextFromReport = Parser.htmlToText(getMovedActionMessage(translate, lastReportAction, report));
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION)) {
        lastMessageTextFromReport = Parser.htmlToText(getUnreportedTransactionMessage(translate, lastReportAction));
    } else if (isActionableMentionWhisper(lastReportAction)) {
        lastMessageTextFromReport = Parser.htmlToText(getActionableMentionWhisperMessage(translate, lastReportAction));
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED)) {
        lastMessageTextFromReport = getDynamicExternalWorkflowRoutedMessage(lastReportAction, translate);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT)) {
        lastMessageTextFromReport = getPolicyChangeLogMaxExpenseAmountMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AGE)) {
        lastMessageTextFromReport = getPolicyChangeLogMaxExpenseAgeMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ACH_ACCOUNT)) {
        lastMessageTextFromReport = getUpdateACHAccountMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_NAME)) {
        lastMessageTextFromReport = getInvoiceCompanyNameUpdateMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_WEBSITE)) {
        lastMessageTextFromReport = getInvoiceCompanyWebsiteUpdateMessage(translate, lastReportAction);
    }

    // we do not want to show report closed in LHN for non archived report so use getReportLastMessage as fallback instead of lastMessageText from report
    if (reportID && !isReportArchived && report.lastActionType === CONST.REPORT.ACTIONS.TYPE.CLOSED) {
        return lastMessageTextFromReport || (getReportLastMessage(reportID, isReportArchived, undefined).lastMessageText ?? '');
    }

    // When the last report action has unknown mentions (@Hidden), we want to consistently show @Hidden in LHN and report screen
    // so we reconstruct the last message text of the report from the last report action.
    if (!lastMessageTextFromReport && lastReportAction && hasHiddenDisplayNames(getMentionedAccountIDsFromAction(lastReportAction))) {
        lastMessageTextFromReport = Parser.htmlToText(getReportActionHtml(lastReportAction));
    }

    // If the last report action is a pending moderation action, get the last message text from the last visible report action
    if (reportID && !lastMessageTextFromReport && isPendingRemove(lastOriginalReportAction)) {
        lastMessageTextFromReport = getReportActionMessageText(lastReportAction);
    }

    if (reportID && !lastMessageTextFromReport && lastReportAction) {
        const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`];
        // If the report is a one-transaction report, get the last message text from combined report actions so the LHN can display modifications to the transaction thread or the report itself
        const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, allSortedReportActions[reportID]);
        if (transactionThreadReportID) {
            lastMessageTextFromReport = getReportActionMessageText(lastReportAction);
        }
    }

    // If the last action is AddComment and no last message text was determined yet, use getLastVisibleMessage to get the preview text
    if (reportID && !lastMessageTextFromReport && isAddCommentAction(lastReportAction)) {
        lastMessageTextFromReport = lastVisibleMessage?.lastMessageText;
    }

    // If the last action differs from last original action, it means there's a hidden action (like a whisper), then use getLastVisibleMessage to get the preview text
    if (!lastMessageTextFromReport && !lastReportAction && !!lastOriginalReportAction) {
        return lastVisibleMessage?.lastMessageText ?? '';
    }

    return lastMessageTextFromReport || (report?.lastMessageText ?? '');
}

/**
 * Creates a report list option - optimized for SearchOption context
 */
function createOption(
    accountIDs: number[],
    personalDetails: OnyxInputOrEntry<PersonalDetailsList>,
    report: OnyxInputOrEntry<Report>,
    policyTags: OnyxEntry<PolicyTagLists>,
    currentUserAccountID: number,
    config?: PreviewConfig,
    reportAttributesDerived?: ReportAttributesDerivedValue['reports'],
    privateIsArchived?: string,
): SearchOptionData {
    const {showChatPreviewLine = false, forcePolicyNamePreview = false, showPersonalDetails = false, selected, isSelected, isDisabled} = config ?? {};

    // Initialize only the properties that are actually used in SearchOption context
    const result: SearchOptionData = {
        // Core identification - used in SearchOption context
        // We use empty string as a default for reportID as in many places the application uses conditional checks that test for reportID existence with truthiness operators
        // eslint-disable-next-line rulesdir/no-default-id-values
        reportID: report?.reportID ?? '',
        accountID: 0, // Set conditionally below
        login: undefined, // Set conditionally below
        policyID: report?.policyID,
        ownerAccountID: report?.ownerAccountID,

        // Display properties - used in SearchOption context
        text: undefined, // Set below
        alternateText: undefined, // Set below
        participantsList: undefined, // Set below

        // State properties - used in SearchOption context
        isSelected: isSelected ?? selected ?? false, // Use isSelected preferentially, fallback to selected for compatibility
        isDisabled,
        brickRoadIndicator: null,

        // Type/category flags - used in SearchOption context
        isPolicyExpenseChat: report ? reportUtilsIsPolicyExpenseChat(report) : false,
        isMoneyRequestReport: report ? reportUtilsIsMoneyRequestReport(report) : false,
        isThread: report ? isChatThread(report) : false,
        isTaskReport: report ? reportUtilsIsTaskReport(report) : false,
        isSelfDM: report ? reportUtilsIsSelfDM(report) : false,
        isChatRoom: report ? reportUtilsIsChatRoom(report) : false,
        isInvoiceRoom: report ? isInvoiceRoom(report) : false,
        isDM: report ? isDM(report) : false,

        // Status properties - used in SearchOption context
        private_isArchived: undefined, // Set from reportNameValuePairs below
        lastVisibleActionCreated: report?.lastVisibleActionCreated,
        notificationPreference: report ? getReportNotificationPreference(report) : undefined,
        lastMessageText: report?.lastMessageText ?? '',

        // Display properties needed for UI rendering
        icons: undefined, // Set below - needed for avatars
        subtitle: undefined, // Set below - needed for display
        keyForList: undefined, // Set below - needed for React keys

        // Legacy property kept for backwards compatibility
        selected: isSelected ?? selected ?? false, // Duplicate of isSelected for backwards compatibility
    };

    const personalDetailMap = getPersonalDetailsForAccountIDs(accountIDs, personalDetails);
    const personalDetailList = Object.values(personalDetailMap).filter((details): details is PersonalDetails => !!details);
    const personalDetail = personalDetailList.at(0);
    let hasMultipleParticipants = personalDetailList.length > 1;
    let subtitle;
    let reportName;
    result.participantsList = personalDetailList;

    if (report) {
        const reportNameValuePairsForReport = allReportNameValuePairsOnyxConnect?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`];

        // Set properties that are used in SearchOption context
        result.private_isArchived = privateIsArchived ?? reportNameValuePairsForReport?.private_isArchived;
        result.keyForList = String(report.reportID);

        // Type/category flags already set in initialization above, but update brickRoadIndicator
        const reportAttribute = reportAttributesDerived?.[report.reportID];
        result.allReportErrors = reportAttribute?.reportErrors ?? {};
        result.brickRoadIndicator = !isEmptyObject(result.allReportErrors) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : (reportAttribute?.brickRoadStatus ?? '');

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- below is a boolean expression
        hasMultipleParticipants = personalDetailList.length > 1 || result.isChatRoom || result.isPolicyExpenseChat || reportUtilsIsGroupChat(report);
        subtitle = getChatRoomSubtitle(report, true, !!result.private_isArchived);

        // If displaying chat preview line is needed, let's overwrite the default alternate text
        const lastActorDetails = personalDetails?.[report?.lastActorAccountID ?? String(CONST.DEFAULT_NUMBER_ID)] ?? {};
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        result.lastMessageText = getLastMessageTextForReport({
            translate: translateLocal,
            report,
            lastActorDetails,
            isReportArchived: !!result.private_isArchived,
            currentUserAccountID,
            policyTags,
        });
        result.alternateText =
            showPersonalDetails && personalDetail?.login
                ? personalDetail.login
                : getAlternateText(result, {showChatPreviewLine, forcePolicyNamePreview}, policyTags, !!result.private_isArchived, currentUserAccountID, lastActorDetails);

        const personalDetailsForCompute: PersonalDetailsList | undefined = personalDetails ?? undefined;
        const computedReportName = computeReportName(
            report,
            allReports,
            allPolicies,
            undefined,
            undefined,
            personalDetailsForCompute,
            allReportActions,
            currentUserAccountID,
            result.private_isArchived,
        );
        reportName = showPersonalDetails
            ? getDisplayNameForParticipant({accountID: accountIDs.at(0), formatPhoneNumber: formatPhoneNumberPhoneUtils}) || formatPhoneNumberPhoneUtils(personalDetail?.login ?? '')
            : computedReportName;
    } else {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        reportName =
            getDisplayNameForParticipant({accountID: accountIDs.at(0), personalDetailsData: personalDetails ?? undefined, formatPhoneNumber: formatPhoneNumberPhoneUtils}) ||
            formatPhoneNumberPhoneUtils(personalDetail?.login ?? '');
        result.keyForList = String(accountIDs.at(0));

        result.alternateText = formatPhoneNumberPhoneUtils(personalDetails?.[accountIDs[0]]?.login ?? '');
    }

    // Set core display properties that are used in SearchOption context
    result.text = reportName;
    result.icons = getIcons(
        report,
        formatPhoneNumberPhoneUtils,
        personalDetails,
        personalDetail?.avatar,
        personalDetail?.login,
        personalDetail?.accountID,
        null,
        undefined,
        !!result?.private_isArchived,
    );
    result.subtitle = subtitle;

    // Set login and accountID only for single participant cases (used in SearchOption context)
    // Also always set for personal details options (showPersonalDetails: true) to ensure search filtering works correctly
    if (showPersonalDetails || (!hasMultipleParticipants && (!report || (report && !reportUtilsIsGroupChat(report) && !reportUtilsIsChatRoom(report))))) {
        result.login = personalDetail?.login;
        result.accountID = Number(personalDetail?.accountID);
    }

    return result;
}

/**
 * Get the option for a given report.
 */
function getReportOption(
    participant: Participant,
    policyTags: OnyxEntry<PolicyTagLists>,
    privateIsArchived: string | undefined,
    policy: OnyxEntry<Policy>,
    currentUserAccountID: number,
    personalDetails: OnyxEntry<PersonalDetailsList>,
    reportAttributesDerived?: ReportAttributesDerivedValue['reports'],
    reportDrafts?: OnyxCollection<Report>,
): OptionData {
    const report = getReportOrDraftReport(participant.reportID, undefined, undefined, reportDrafts);
    const visibleParticipantAccountIDs = getParticipantsAccountIDsForDisplay(report, true);

    const option = createOption(
        visibleParticipantAccountIDs,
        personalDetails ?? {},
        !isEmptyObject(report) ? report : undefined,
        policyTags,
        currentUserAccountID,
        {
            showChatPreviewLine: false,
            forcePolicyNamePreview: false,
        },
        reportAttributesDerived,
        privateIsArchived,
    );

    // Update text & alternateText because createOption returns workspace name only if report is owned by the user
    if (option.isSelfDM) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        option.alternateText = translateLocal('reportActionsView.yourSpace');
    } else if (option.isInvoiceRoom) {
        option.text = computeReportName(report, undefined, undefined, undefined, undefined, personalDetails, undefined, currentUserAccountID, privateIsArchived);
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        option.alternateText = translateLocal('workspace.common.invoices');
    } else {
        option.text = getPolicyName({report});
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        option.alternateText = translateLocal('workspace.common.workspace');

        if (report?.policyID) {
            const submitToAccountID = getSubmitToAccountID(policy, report);
            const submitsToAccountDetails = personalDetails?.[submitToAccountID];
            const subtitle = submitsToAccountDetails?.displayName ?? submitsToAccountDetails?.login;

            if (subtitle) {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                option.alternateText = translateLocal('iou.submitsTo', {name: subtitle ?? ''});
            }
        }
    }
    option.isDisabled = isDraftReport(participant.reportID);
    option.isSelected = participant.selected;
    option.selected = participant.selected; // Keep for backwards compatibility
    option.brickRoadIndicator = null;
    return option;
}

/**
 * Get the display option for a given report.
 */
function getReportDisplayOption(
    report: OnyxEntry<Report>,
    unknownUserDetails: OnyxEntry<Participant>,
    policyTags: OnyxEntry<PolicyTagLists>,
    currentUserAccountID: number,
    personalDetails: OnyxEntry<PersonalDetailsList>,
    privateIsArchived: string | undefined,
    reportAttributesDerived?: ReportAttributesDerivedValue['reports'],
): OptionData {
    const visibleParticipantAccountIDs = getParticipantsAccountIDsForDisplay(report, true);

    const option = createOption(
        visibleParticipantAccountIDs,
        personalDetails ?? {},
        !isEmptyObject(report) ? report : undefined,
        policyTags,
        currentUserAccountID,
        {
            showChatPreviewLine: false,
            forcePolicyNamePreview: false,
        },
        reportAttributesDerived,
        privateIsArchived,
    );

    // Update text & alternateText because createOption returns workspace name only if report is owned by the user
    if (option.isSelfDM) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        option.alternateText = translateLocal('reportActionsView.yourSpace');
    } else if (option.isInvoiceRoom) {
        option.text = computeReportName(report, undefined, undefined, undefined, undefined, personalDetails, undefined, currentUserAccountID, privateIsArchived);
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        option.alternateText = translateLocal('workspace.common.invoices');
    } else if (unknownUserDetails) {
        option.text = unknownUserDetails.text ?? unknownUserDetails.login;
        option.alternateText = unknownUserDetails.login;
        option.participantsList = [{...unknownUserDetails, displayName: unknownUserDetails.login, accountID: unknownUserDetails.accountID ?? CONST.DEFAULT_NUMBER_ID}];
    } else if (report?.ownerAccountID !== 0 || !option.text) {
        option.text = getPolicyName({report});
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        option.alternateText = translateLocal('workspace.common.workspace');
    }
    option.isDisabled = true;
    option.isSelected = false;
    option.selected = false; // Keep for backwards compatibility

    return option;
}
/**
 * Get the option for a policy expense report.
 */
function getPolicyExpenseReportOption(
    participant: Participant | SearchOptionData,
    policyTags: OnyxCollection<PolicyTagLists>,
    currentUserAccountID: number,
    personalDetails: OnyxEntry<PersonalDetailsList>,
    reportAttributesDerived?: ReportAttributesDerivedValue['reports'],
): SearchOptionData {
    const expenseReport = reportUtilsIsPolicyExpenseChat(participant) ? getReportOrDraftReport(participant.reportID) : null;

    const visibleParticipantAccountIDs = Object.entries(expenseReport?.participants ?? {})
        .filter(([, reportParticipant]) => reportParticipant && !isHiddenForCurrentUser(reportParticipant.notificationPreference))
        .map(([accountID]) => Number(accountID));
    const reportPolicyTags = expenseReport?.policyID ? policyTags?.[expenseReport.policyID] : CONST.POLICY.DEFAULT_TAG_LIST;
    const option = createOption(
        visibleParticipantAccountIDs,
        personalDetails ?? {},
        !isEmptyObject(expenseReport) ? expenseReport : null,
        reportPolicyTags,
        currentUserAccountID,
        {
            showChatPreviewLine: false,
            forcePolicyNamePreview: false,
        },
        reportAttributesDerived,
    );

    // Update text & alternateText because createOption returns workspace name only if report is owned by the user
    option.text = getPolicyName({report: expenseReport});
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    option.alternateText = translateLocal('workspace.common.workspace');
    option.isSelected = participant.selected;
    option.selected = participant.selected; // Keep for backwards compatibility
    return option;
}

/**
 * Checks if the given userDetails is currentUser or not.
 * Note: We can't migrate this off of using logins because this is used to check if you're trying to start a chat with
 * yourself or a different user, and people won't be starting new chats via accountID usually.
 */
function isCurrentUser(userDetails: PersonalDetails, loginList: OnyxEntry<Login>, currentUserEmail: string): boolean {
    if (!userDetails) {
        return false;
    }

    // If user login is a mobile number, append sms domain if not appended already.
    const userDetailsLogin = addSMSDomainIfPhoneNumber(userDetails.login ?? '');

    if (currentUserEmail.toLowerCase() === userDetailsLogin.toLowerCase()) {
        return true;
    }

    // Check if userDetails login exists in loginList
    return Object.keys(loginList ?? {}).some((login) => login.toLowerCase() === userDetailsLogin.toLowerCase());
}

function isDisablingOrDeletingLastEnabledCategory(
    policy: Policy | undefined,
    policyCategories: PolicyCategories | undefined,
    selectedCategories: Array<PolicyCategory | undefined>,
): boolean {
    const enabledCategoriesCount = getEnabledCategoriesCount(policyCategories);

    if (!enabledCategoriesCount) {
        return false;
    }

    if (policy?.requiresCategory && selectedCategories.filter((selectedCategory) => selectedCategory?.enabled).length === enabledCategoriesCount) {
        return true;
    }

    return false;
}

function isDisablingOrDeletingLastEnabledTag(policyTagList: PolicyTagLists[string] | undefined, selectedTags: Array<PolicyTag | undefined>): boolean {
    const enabledTagsCount = getCountOfEnabledTagsOfList(policyTagList?.tags);

    if (!enabledTagsCount) {
        return false;
    }

    if (policyTagList?.required && selectedTags.filter((selectedTag) => selectedTag?.enabled).length === enabledTagsCount) {
        return true;
    }
    return false;
}

function isMakingLastRequiredTagListOptional(policy: Policy | undefined, policyTags: PolicyTagLists | undefined, selectedTagLists: Array<PolicyTagLists[string] | undefined>): boolean {
    const requiredTagsCount = getCountOfRequiredTagLists(policyTags);

    if (!requiredTagsCount) {
        return false;
    }

    if (policy?.requiresTag && selectedTagLists.filter((selectedTagList) => selectedTagList?.required).length === requiredTagsCount) {
        return true;
    }
    return false;
}

function getSearchValueForPhoneOrEmail(searchTerm: string, countryCode: number) {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const parsedPhoneNumber = parsePhoneNumber(appendCountryCode(Str.removeSMSDomain(searchTerm), countryCode));
    return parsedPhoneNumber.possible ? (parsedPhoneNumber.number?.e164 ?? '') : searchTerm.toLowerCase();
}

/**
 * Verifies that there is at least one enabled option
 */
function hasEnabledOptions(options: PolicyCategories | PolicyTag[]): boolean {
    return Object.values(options).some((option: PolicyTag | PolicyCategory) => option.enabled && option.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
}

/**
 * Checks if a report option is selected based on matching accountID or reportID.
 *
 * @param reportOption - The report option to be checked.
 * @param selectedOptions - Array of selected options to compare with.
 * @returns true if the report option matches any of the selected options by accountID or reportID, false otherwise.
 */
function isReportSelected(reportOption: SearchOptionData, selectedOptions: Array<Partial<SearchOptionData>>) {
    if (!selectedOptions || selectedOptions.length === 0) {
        return false;
    }

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return selectedOptions.some((option) => (option.accountID && option.accountID === reportOption.accountID) || (option.reportID && option.reportID === reportOption.reportID));
}

function processReport(
    report: OnyxEntry<Report> | null,
    personalDetails: OnyxEntry<PersonalDetailsList>,
    policyTags: OnyxEntry<PolicyTagLists>,
    currentUserAccountID: number,
    reportAttributesDerived?: ReportAttributesDerivedValue['reports'],
): {
    reportMapEntry?: [number, Report]; // The entry to add to reportMapForAccountIDs if applicable
    reportOption: SearchOption<Report> | null; // The report option to add to allReportOptions if applicable
} {
    if (!report?.reportID) {
        return {reportOption: null};
    }

    const isOneOnOneChat = reportUtilsIsOneOnOneChat(report);
    const accountIDs = getParticipantsAccountIDsForDisplay(report);
    const isChatRoom = reportUtilsIsChatRoom(report);

    if ((!accountIDs || accountIDs.length === 0) && !isChatRoom) {
        return {reportOption: null};
    }

    // Determine if this report should be mapped to a personal detail
    const reportMapEntry = accountIDs.length <= 1 && isOneOnOneChat ? ([accountIDs.at(0), report] as [number, Report]) : undefined;

    return {
        reportMapEntry,
        reportOption: {
            item: report,
            ...createOption(accountIDs, personalDetails, report,  policyTags, currentUserAccountID, undefined, reportAttributesDerived),
        },
    };
}

function createOptionList(
    personalDetails: OnyxEntry<PersonalDetailsList>,
    policyTags: OnyxCollection<PolicyTagLists>,
    currentUserAccountID: number,
    reports?: OnyxCollection<Report>,
    reportAttributesDerived?: ReportAttributesDerivedValue['reports'],
) {
    const span = Sentry.startInactiveSpan({name: 'createOptionList'});

    const reportMapForAccountIDs: Record<number, Report> = {};
    const allReportOptions: Array<SearchOption<Report>> = [];

    if (reports) {
        for (const report of Object.values(reports)) {
            const reportPolicyTags = report?.policyID ? policyTags?.[report?.policyID] : CONST.POLICY.DEFAULT_TAG_LIST;
            const {reportMapEntry, reportOption} = processReport(report, personalDetails, reportPolicyTags, currentUserAccountID, reportAttributesDerived);

            if (reportMapEntry) {
                const [accountID, reportValue] = reportMapEntry;
                reportMapForAccountIDs[accountID] = reportValue;
            }

            if (reportOption) {
                allReportOptions.push(reportOption);
            }
        }
    }

    const allPersonalDetailsOptions = Object.values(personalDetails ?? {}).map((personalDetail) => {
        const report = reportMapForAccountIDs[personalDetail?.accountID ?? CONST.DEFAULT_NUMBER_ID];
        const policyTagList = report?.policyID ? policyTags?.[report?.policyID] : CONST.POLICY.DEFAULT_TAG_LIST;
        return {
            item: personalDetail,
            ...createOption(
                [personalDetail?.accountID ?? CONST.DEFAULT_NUMBER_ID],
                personalDetails,
                report,
                policyTagList,
                currentUserAccountID,
                {
                    showPersonalDetails: true,
                },
                reportAttributesDerived,
            ),
        };
    });

    span.setAttributes({
        personalDetails: allPersonalDetailsOptions.length,
        reports: allReportOptions.length,
    });
    span.end();

    return {
        reports: allReportOptions,
        personalDetails: allPersonalDetailsOptions as Array<SearchOption<PersonalDetails>>,
    };
}

/**
 * Creates an optimized option list with smart pre-filtering.
 *
 * Performance optimization approach:
 * 1. Pre-filters reports using shouldReportBeInOptionList with correct parameters (betas, etc.)
 * 2. Sorts by lastVisibleActionCreated (most recent first)
 * 3. Limits to top N reports
 * 4. Processes only those N reports
 *
 * This avoids processing thousands of reports while ensuring correct filtering.
 *
 * Use this for screens that need recent reports (NewChatPage, WorkspaceInvitePage, etc.)
 */
function createFilteredOptionList(
    personalDetails: OnyxEntry<PersonalDetailsList>,
    reports: OnyxCollection<Report>,
    policyTags: OnyxCollection<PolicyTagLists>,
    currentUserAccountID: number,
    reportAttributesDerived: ReportAttributesDerivedValue['reports'] | undefined,
    options: {
        maxRecentReports?: number;
        includeP2P?: boolean;
        searchTerm?: string;
        betas?: OnyxEntry<Beta[]>;
    } = {},
) {
    const {maxRecentReports = 500, includeP2P = true, searchTerm = ''} = options;
    const reportMapForAccountIDs: Record<number, Report> = {};

    // Step 1: Pre-filter reports to avoid processing thousands
    // Only filter out null/undefined - let shouldReportBeInOptionList handle business logic
    const reportsArray = Object.values(reports ?? {}).filter((report): report is Report => {
        return !!report;
    });

    // Step 2: Sort by lastVisibleActionCreated (most recent first)
    const sortedReports = reportsArray.sort((a, b) => {
        const aTime = new Date(a.lastVisibleActionCreated ?? 0).getTime();
        const bTime = new Date(b.lastVisibleActionCreated ?? 0).getTime();
        return bTime - aTime;
    });

    // Step 3: Limit to top N reports
    const limitedReports = sortedReports.slice(0, maxRecentReports);

    // Step 4: If search term is present, build report map with ONLY 1:1 DM reports
    // This allows personal details to have valid 1:1 DM reportIDs for proper avatar display
    // Users without 1:1 DMs will have no report mapped, causing getIcons to fall back to personal avatar
    if (searchTerm?.trim()) {
        const allReportsArray = Object.values(reports ?? {});

        // Add ONLY 1:1 DM reports (never add group/policy chats to maintain personal avatars)
        for (const report of allReportsArray) {
            if (!report) {
                continue;
            }

            // Check if this is a 1:1 DM (not a group/policy/room chat)
            const is1on1DM = reportUtilsIsOneOnOneChat(report);

            if (is1on1DM) {
                const accountIDs = getParticipantsAccountIDsForDisplay(report);
                for (const accountID of accountIDs) {
                    // ALWAYS set 1:1 DMs - prioritize them over policy/group chats
                    // This ensures proper avatar display for personal details
                    reportMapForAccountIDs[accountID] = report;
                }
            }
        }
    }

    // Step 5: Process the limited set of reports (performance optimization)
    const reportOptions: Array<SearchOption<Report>> = [];
    for (const report of limitedReports) {
        const reportPolicyTags = report?.policyID ? policyTags?.[report?.policyID] : CONST.POLICY.DEFAULT_TAG_LIST;
        const {reportMapEntry, reportOption} = processReport(report, personalDetails, reportPolicyTags, currentUserAccountID, reportAttributesDerived);

        if (reportMapEntry) {
            const [accountID, reportValue] = reportMapEntry;

            // Preserve 1:1 DMs from Step 4 - don't overwrite them with non-1:1 reports
            const existing = reportMapForAccountIDs[accountID];
            const existingIs1on1 = existing && reportUtilsIsOneOnOneChat(existing);
            const newIs1on1 = reportUtilsIsOneOnOneChat(reportValue);

            // Only overwrite if: no existing, existing is not 1:1, or both are 1:1 (prefer newer)
            const shouldOverwrite = !existing || !existingIs1on1 || newIs1on1;

            if (shouldOverwrite) {
                reportMapForAccountIDs[accountID] = reportValue;
            }
        }

        if (reportOption) {
            reportOptions.push(reportOption);
        }
    }

    // Step 6: Process personal details (all of them - needed for search functionality)
    const personalDetailsOptions = includeP2P
        ? Object.values(personalDetails ?? {}).map((personalDetail) => {
              const accountID = personalDetail?.accountID ?? CONST.DEFAULT_NUMBER_ID;
              const report = reportMapForAccountIDs[accountID];
              const reportPolicyTags = report?.policyID ? policyTags?.[report?.policyID] : undefined;

              return {
                  item: personalDetail,
                  ...createOption(
                      [accountID],
                      personalDetails,
                      reportMapForAccountIDs[accountID],
                      reportPolicyTags,
                      currentUserAccountID,
                      {showPersonalDetails: true},
                      reportAttributesDerived,
                  ),
              };
          })
        : [];

    return {
        reports: reportOptions,
        personalDetails: personalDetailsOptions as Array<SearchOption<PersonalDetails>>,
    };
}

function createOptionFromReport(
    report: Report,
    personalDetails: OnyxEntry<PersonalDetailsList>,
    policyTags: OnyxEntry<PolicyTagLists>,
    currentUserAccountID: number,
    reportAttributesDerived?: ReportAttributesDerivedValue['reports'],
    config?: PreviewConfig,
) {
    const accountIDs = getParticipantsAccountIDsForDisplay(report);

    return {
        item: report,
        ...createOption(accountIDs, personalDetails, report,  policyTags, currentUserAccountID, config, reportAttributesDerived),
    };
}

function orderPersonalDetailsOptions(options: SearchOptionData[]) {
    // PersonalDetails should be ordered Alphabetically by default - https://github.com/Expensify/App/issues/8220#issuecomment-1104009435
    return lodashOrderBy(options, [(personalDetail) => personalDetail.text?.toLowerCase()], 'asc');
}

/**
 * Orders report options without grouping them by kind.
 * Usually used when there is no search value
 */
function orderReportOptions(options: SearchOptionData[]) {
    return lodashOrderBy(options, [sortComparatorReportOptionByArchivedStatus, sortComparatorReportOptionByDate], ['asc', 'desc']);
}

/**
 * Sort personal details by displayName or login in alphabetical order
 */
const personalDetailsComparator = (personalDetail: SearchOptionData) => {
    const name = personalDetail.text ?? personalDetail.alternateText ?? personalDetail.login ?? '';
    return name.toLowerCase();
};

/**
 * Sort reports by archived status and last visible action
 */
const recentReportComparator = (option: SearchOptionData) => {
    return `${option.private_isArchived ? 0 : 1}_${option.lastVisibleActionCreated ?? ''}`;
};

/**
 * Sort options by a given comparator and return first sorted options.
 * Function uses a min heap to efficiently get the first sorted options.
 */
function optionsOrderBy<T = SearchOptionData>(options: T[], comparator: (option: T) => number | string, limit?: number, filter?: (option: T) => boolean | undefined, reversed = false): T[] {
    Timing.start(CONST.TIMING.SEARCH_MOST_RECENT_OPTIONS);
    const heap = reversed ? new MaxHeap<T>(comparator) : new MinHeap<T>(comparator);

    // If a limit is 0 or negative, return an empty array
    if (limit !== undefined && limit <= 0) {
        Timing.end(CONST.TIMING.SEARCH_MOST_RECENT_OPTIONS);
        return [];
    }

    for (const option of options) {
        if (filter && !filter(option)) {
            continue;
        }
        if (limit !== undefined && heap.size() >= limit) {
            const peekedValue = heap.peek();
            if (!peekedValue) {
                throw new Error('Heap is empty, cannot peek value');
            }
            if (reversed ? comparator(option) < comparator(peekedValue) : comparator(option) > comparator(peekedValue)) {
                heap.pop();
                heap.push(option);
            }
        } else {
            heap.push(option);
        }
    }
    Timing.end(CONST.TIMING.SEARCH_MOST_RECENT_OPTIONS);
    return [...heap].reverse();
}

/**
 * Sort options by the same manner as optionsOrderBy -> using heaps.
 * However, this function allows grouping by multiple separators.
 * Result of this function is an array of length of `separators.length + 1`
 * Incoming array of options will be at first tested by separators each separator will test if the option fits - first win, so if an option would fit to more than one separator the order of them decides.
 * All options that does not pass any of separator will be pushed into last returned array.
 */
function optionsOrderAndGroupBy<T = SearchOptionData>(
    separators: Array<(option: T) => boolean | undefined>,
    options: T[],
    comparator: (option: T) => number | string,
    limit?: number,
    filter?: (option: T) => boolean | undefined,
    reversed = false,
): T[][] {
    // Create a heap for each separator + one default heap (N+1 total)
    const heaps: Array<MinHeap<T> | MaxHeap<T>> = [];
    for (let i = 0; i < separators.length; i++) {
        heaps.push(reversed ? new MaxHeap<T>(comparator) : new MinHeap<T>(comparator));
    }
    const defaultHeap = reversed ? new MaxHeap<T>(comparator) : new MinHeap<T>(comparator);

    // If limit is 0 or negative, return N+1 empty arrays
    if (limit !== undefined && limit <= 0) {
        return Array(separators.length + 1).map(() => []);
    }

    // Process each option
    for (const option of options) {
        // Apply filter first
        if (filter && !filter(option)) {
            continue;
        }

        // Find which group this option belongs to (first-match-wins)
        let targetHeap: MinHeap<T> | MaxHeap<T> | null = null;

        for (let i = 0; i < separators.length; i++) {
            if (separators[i](option)) {
                // eslint-disable-next-line rulesdir/prefer-at
                targetHeap = heaps[i];
                break; // Early exit on first match
            }
        }

        // If no separator matched, use default heap
        if (!targetHeap) {
            targetHeap = defaultHeap;
        }

        // Add to heap with limit logic (each heap has its own limit)
        if (limit !== undefined && targetHeap.size() >= limit) {
            const peekedValue = targetHeap.peek();
            if (!peekedValue) {
                throw new Error('Heap is empty, cannot peek value');
            }
            if (comparator(option) > comparator(peekedValue)) {
                targetHeap.pop();
                targetHeap.push(option);
            }
        } else {
            targetHeap.push(option);
        }
    }

    // Extract results from each heap and reverse (to get correct order)
    // Always return N+1 arrays (some may be empty)
    const results: T[][] = [];
    for (const heap of heaps) {
        results.push([...heap].reverse());
    }
    results.push([...defaultHeap].reverse());

    return results;
}

/**
 * Ordering for report options when you have a search value, will order them by kind additionally.
 * @param options - list of options to be sorted
 * @param searchValue - search string
 * @returns a sorted list of options
 */
function orderReportOptionsWithSearch(
    options: SearchOptionData[],
    searchValue: string,
    {preferChatRoomsOverThreads = false, preferPolicyExpenseChat = false, preferRecentExpenseReports = false}: OrderReportOptionsConfig = {},
) {
    const orderedByDate = orderReportOptions(options);

    return lodashOrderBy(
        orderedByDate,
        [
            // Sorting by kind:
            (option) => {
                if (option.isPolicyExpenseChat && preferPolicyExpenseChat && option.policyID === activePolicyID) {
                    return 0;
                }

                if (option.isSelfDM) {
                    return -1;
                }
                if (preferRecentExpenseReports && !!option?.lastIOUCreationDate) {
                    return 1;
                }
                if (preferRecentExpenseReports && option.isPolicyExpenseChat) {
                    return 1;
                }
                if (preferChatRoomsOverThreads && option.isThread) {
                    return 4;
                }
                if (!!option.isChatRoom || option.private_isArchived) {
                    return 3;
                }
                if (!option.login) {
                    return 2;
                }
                if (option.login.toLowerCase() !== searchValue?.toLowerCase()) {
                    return 1;
                }

                // When option.login is an exact match with the search value, returning 0 puts it at the top of the option list
                return 0;
            },
            // For Submit Expense flow, prioritize the most recent expense reports and then policy expense chats (without expense requests)
            preferRecentExpenseReports ? (option) => option?.lastIOUCreationDate ?? '' : '',
            preferRecentExpenseReports ? (option) => option?.isPolicyExpenseChat : 0,
        ],
        ['asc', 'desc', 'desc'],
    );
}

function orderWorkspaceOptions(options: SearchOptionData[]): SearchOptionData[] {
    return options.sort((a, b) => {
        // Check if `a` is the default workspace
        if (a.isPolicyExpenseChat && a.policyID === activePolicyID) {
            return -1;
        }

        // Check if `b` is the default workspace
        if (b.isPolicyExpenseChat && b.policyID === activePolicyID) {
            return 1;
        }

        return 0;
    });
}

function sortComparatorReportOptionByArchivedStatus(option: SearchOptionData) {
    return option.private_isArchived ? 1 : 0;
}

function sortComparatorReportOptionByDate(options: SearchOptionData) {
    // If there is no date (ie. a personal detail option), the option will be sorted to the bottom
    // (comparing a dateString > '' returns true, and we are sorting descending, so the dateString will come before '')
    return options.lastVisibleActionCreated ?? '';
}

/**
 * Sorts reports and personal details independently.
 */
function orderOptions(options: ReportAndPersonalDetailOptions): ReportAndPersonalDetailOptions;

/**
 * Sorts reports and personal details independently, but prioritizes the search value.
 */
function orderOptions(options: ReportAndPersonalDetailOptions, searchValue: string, config?: OrderReportOptionsConfig): ReportAndPersonalDetailOptions;
function orderOptions(options: ReportAndPersonalDetailOptions, searchValue?: string, config?: OrderReportOptionsConfig): ReportAndPersonalDetailOptions {
    let orderedReportOptions: SearchOptionData[];
    if (searchValue) {
        orderedReportOptions = orderReportOptionsWithSearch(options.recentReports, searchValue, config);
    } else {
        orderedReportOptions = orderReportOptions(options.recentReports);
    }
    const orderedPersonalDetailsOptions = orderPersonalDetailsOptions(options.personalDetails);
    const orderedWorkspaceChats = orderWorkspaceOptions(options?.workspaceChats ?? []);

    return {
        recentReports: orderedReportOptions,
        personalDetails: orderedPersonalDetailsOptions,
        workspaceChats: orderedWorkspaceChats,
    };
}

function canCreateOptimisticPersonalDetailOption({
    recentReportOptions,
    personalDetailsOptions,
    currentUserOption,
    searchValue,
}: {
    recentReportOptions: SearchOptionData[];
    personalDetailsOptions: SearchOptionData[];
    currentUserOption?: SearchOptionData | null;
    searchValue: string;
}) {
    if (recentReportOptions.length + personalDetailsOptions.length > 0) {
        return false;
    }
    if (!currentUserOption) {
        return true;
    }
    return currentUserOption.login !== addSMSDomainIfPhoneNumber(searchValue ?? '').toLowerCase() && currentUserOption.login !== searchValue?.toLowerCase();
}

/**
 * We create a new user option if the following conditions are satisfied:
 * - There's no matching recent report and personal detail option
 * - The searchValue is a valid email or phone number
 * - If prop shouldAcceptName = true, the searchValue can be also a normal string
 * - The searchValue isn't the current personal detail login
 */
function getUserToInviteOption({
    searchValue,
    loginsToExclude = {},
    selectedOptions = [],
    showChatPreviewLine = false,
    shouldAcceptName = false,
    countryCode = CONST.DEFAULT_COUNTRY_CODE,
    loginList = {},
    currentUserEmail,
    currentUserAccountID,
}: GetUserToInviteConfig): SearchOptionData | null {
    if (!searchValue) {
        return null;
    }

    const parsedPhoneNumber = parsePhoneNumber(appendCountryCode(Str.removeSMSDomain(searchValue), countryCode));
    const isCurrentUserLogin = isCurrentUser({login: searchValue} as PersonalDetails, loginList, currentUserEmail);
    const isInSelectedOption = selectedOptions.some((option) => 'login' in option && option.login === searchValue);
    const isValidEmail = Str.isValidEmail(searchValue) && !Str.isDomainEmail(searchValue) && !Str.endsWith(searchValue, CONST.SMS.DOMAIN);
    const isValidPhoneNumber = parsedPhoneNumber.possible && Str.isValidE164Phone(getPhoneNumberWithoutSpecialChars(parsedPhoneNumber.number?.input ?? ''));
    const isInOptionToExclude = loginsToExclude[addSMSDomainIfPhoneNumber(searchValue).toLowerCase()];

    // Angle brackets are not valid characters for user names
    const hasInvalidCharacters = shouldAcceptName && (searchValue.includes('<') || searchValue.includes('>'));

    if (isCurrentUserLogin || isInSelectedOption || (!isValidEmail && !isValidPhoneNumber && !shouldAcceptName) || isInOptionToExclude || hasInvalidCharacters) {
        return null;
    }

    // Generates an optimistic account ID for new users not yet saved in Onyx
    const optimisticAccountID = generateAccountID(searchValue);
    const personalDetailsExtended = {
        ...allPersonalDetails,
        [optimisticAccountID]: {
            accountID: optimisticAccountID,
            login: searchValue,
        },
    };
    const userToInvite = createOption([optimisticAccountID], personalDetailsExtended, null, undefined, currentUserAccountID, {
        showChatPreviewLine,
    });
    userToInvite.isOptimisticAccount = true;
    userToInvite.login = searchValue;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    userToInvite.text = userToInvite.text || searchValue;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    userToInvite.alternateText = userToInvite.alternateText || searchValue;

    // If user doesn't exist, use a fallback avatar
    userToInvite.icons = [
        {
            source: FallbackAvatar,
            id: optimisticAccountID,
            name: searchValue,
            type: CONST.ICON_TYPE_AVATAR,
        },
    ];

    return userToInvite;
}

function getUserToInviteContactOption({
    searchValue = '',
    optionsToExclude = [],
    selectedOptions = [],
    firstName = '',
    lastName = '',
    email = '',
    phone = '',
    avatar = '',
    countryCode = CONST.DEFAULT_COUNTRY_CODE,
    loginList = {},
    currentUserEmail,
}: GetUserToInviteConfig): SearchOption<PersonalDetails> | null {
    // If email is provided, use it as the primary identifier
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const effectiveSearchValue = email || searchValue;

    // Handle phone number parsing for either provided phone or searchValue
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const phoneToCheck = phone || searchValue;
    const normalizedPhoneNumber = appendCountryCode(Str.removeSMSDomain(phoneToCheck), countryCode);
    const parsedPhoneNumber = parsePhoneNumber(normalizedPhoneNumber);

    // Validate email (either provided email or searchValue)
    const isValidEmail = Str.isValidEmail(effectiveSearchValue) && !Str.isDomainEmail(effectiveSearchValue) && !Str.endsWith(effectiveSearchValue, CONST.SMS.DOMAIN);

    const isValidPhoneNumber = parsedPhoneNumber.possible && Str.isValidE164Phone(getPhoneNumberWithoutSpecialChars(parsedPhoneNumber.number?.input ?? ''));

    const sanitizedPhoneLogin = isValidPhoneNumber ? addSMSDomainIfPhoneNumber(parsedPhoneNumber.number?.e164 ?? normalizedPhoneNumber) : '';
    const login = email ? effectiveSearchValue : (sanitizedPhoneLogin ?? searchValue);
    const normalizedLoginToExclude = addSMSDomainIfPhoneNumber(login).toLowerCase();

    const isCurrentUserLogin = isCurrentUser({login} as PersonalDetails, loginList, currentUserEmail);
    const isInSelectedOption = selectedOptions.some((option) => 'login' in option && option.login === login);

    const isInOptionToExclude = optionsToExclude.findIndex((optionToExclude) => 'login' in optionToExclude && optionToExclude.login === normalizedLoginToExclude) !== -1;

    if (!effectiveSearchValue || isCurrentUserLogin || isInSelectedOption || (!isValidEmail && !isValidPhoneNumber) || isInOptionToExclude) {
        return null;
    }

    // Generates an optimistic account ID for new users not yet saved in Onyx
    const optimisticAccountID = generateAccountID(login);

    // Construct display name if firstName/lastName are provided
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const displayName = firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || effectiveSearchValue;

    // Create the base user details that will be used in both item and participantsList
    const userDetails = {
        accountID: optimisticAccountID,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        avatar: avatar || FallbackAvatar,
        firstName: firstName ?? '',
        lastName: lastName ?? '',
        displayName,
        login,
        pronouns: '',
        phoneNumber: phone ?? '',
        validated: true,
    };

    const userToInvite = {
        item: userDetails,
        text: displayName,
        displayName,
        firstName,
        lastName,
        alternateText: displayName !== login ? login : undefined,
        brickRoadIndicator: null,
        icons: [
            {
                source: userDetails.avatar,
                type: CONST.ICON_TYPE_AVATAR,
                name: login,
                id: optimisticAccountID,
            },
        ],
        tooltipText: null,
        participantsList: [userDetails],
        accountID: optimisticAccountID,
        login,
        reportID: '',
        phoneNumber: phone ?? '',
        hasDraftComment: false,
        keyForList: optimisticAccountID.toString(),
        isDefaultRoom: false,
        isPinned: false,
        isWaitingOnBankAccount: false,
        isIOUReportOwner: false,
        iouReportAmount: 0,
        isChatRoom: false,
        shouldShowSubscript: false,
        isPolicyExpenseChat: false,
        isExpenseReport: false,
        lastMessageText: '',
        isBold: true,
        isOptimisticAccount: true,
    };

    return userToInvite;
}

function isValidReport(option: SearchOption<Report>, policy: OnyxEntry<Policy>, config: IsValidReportsConfig, draftComment: string | undefined): boolean {
    const {
        betas = [],
        includeMultipleParticipantReports = false,
        includeOwnedWorkspaceChats = false,
        includeThreads = false,
        includeTasks = false,
        includeMoneyRequests = false,
        includeReadOnly = true,
        transactionViolations = {},
        includeSelfDM = false,
        includeInvoiceRooms = false,
        action,
        includeP2P = true,
        includeDomainEmail = false,
        loginsToExclude = {},
        excludeNonAdminWorkspaces,
        isRestrictedToPreferredPolicy,
        preferredPolicyID,
        currentUserAccountID,
        shouldAlwaysIncludeDM,
    } = config;
    const topmostReportId = Navigation.getTopmostReportId();

    const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${option.item.chatReportID}`];
    const doesReportHaveViolations = shouldDisplayViolationsRBRInLHN(option.item, transactionViolations);

    const shouldBeInOptionList = shouldReportBeInOptionList({
        report: option.item,
        chatReport,
        currentReportId: topmostReportId,
        betas,
        doesReportHaveViolations,
        isInFocusMode: false,
        excludeEmptyChats: false,
        includeSelfDM,
        login: option.login,
        includeDomainEmail,
        isReportArchived: !!option.private_isArchived,
        draftComment,
    });

    if (!shouldBeInOptionList) {
        return false;
    }

    const isThread = option.isThread;
    const isTaskReport = option.isTaskReport;
    const isPolicyExpenseChat = option.isPolicyExpenseChat;
    const isMoneyRequestReport = option.isMoneyRequestReport;
    const isSelfDM = option.isSelfDM;
    const isChatRoom = option.isChatRoom;
    const accountIDs = getParticipantsAccountIDsForDisplay(option.item);

    if (excludeNonAdminWorkspaces && !isPolicyAdmin(policy)) {
        return false;
    }

    if (isPolicyExpenseChat && !includeOwnedWorkspaceChats) {
        return false;
    }

    if (isPolicyExpenseChat && isRestrictedToPreferredPolicy && option.policyID !== preferredPolicyID) {
        return false;
    }

    // When passing includeP2P false we are trying to hide features from users that are not ready for P2P and limited to expense chats only.
    if (!includeP2P && !isPolicyExpenseChat) {
        return false;
    }

    if (isSelfDM && !includeSelfDM) {
        return false;
    }

    if (isThread && !includeThreads) {
        return false;
    }

    if (isTaskReport && !includeTasks) {
        return false;
    }

    if (isMoneyRequestReport && !includeMoneyRequests) {
        return false;
    }

    if (!canUserPerformWriteAction(option.item, !!option.private_isArchived) && !includeReadOnly) {
        return false;
    }

    // In case user needs to add credit bank account, don't allow them to submit an expense from the workspace.
    if (includeOwnedWorkspaceChats && hasIOUWaitingOnCurrentUserBankAccount(option.item)) {
        return false;
    }

    if ((!accountIDs || accountIDs.length === 0) && !isChatRoom) {
        return false;
    }

    if (option.login === CONST.EMAIL.NOTIFICATIONS) {
        return false;
    }
    const isCurrentUserOwnedPolicyExpenseChatThatCouldShow =
        option.isPolicyExpenseChat && option.ownerAccountID === currentUserAccountID && includeOwnedWorkspaceChats && !option.private_isArchived;

    const shouldShowInvoiceRoom = includeInvoiceRooms && isInvoiceRoom(option.item) && isPolicyAdmin(policy) && !option.private_isArchived && canSendInvoiceFromWorkspace(option.policyID);

    /*
    Exclude the report option if it doesn't meet any of the following conditions:
    - It is not an owned policy expense chat that could be shown
    - Multiple participant reports are not included
    - It doesn't have a login
    - It is not an invoice room that should be shown
    */
    if (!isCurrentUserOwnedPolicyExpenseChatThatCouldShow && !includeMultipleParticipantReports && !option.login && (!option.isDM || !shouldAlwaysIncludeDM) && !shouldShowInvoiceRoom) {
        return false;
    }

    // If we're excluding threads, check the report to see if it has a single participant and if the participant is already selected
    if (!includeThreads && ((!!option.login && loginsToExclude[option.login]) || loginsToExclude[option.reportID])) {
        return false;
    }

    if (action === CONST.IOU.ACTION.CATEGORIZE) {
        if (!policy?.areCategoriesEnabled) {
            return false;
        }
    }
    return true;
}

/**
 * Prepares report options for display by enriching them with UI-specific properties and filtering out invalid options.
 *
 * Not every property of the report option can be computed on the initial computing in the OptionListContextProvider. Some of them are based on the context (config) so they are computed here.
 *
 * @param options - Array of report options to prepare
 * @param config - Configuration object specifying display preferences and filtering criteria
 * @returns Array of enriched and filtered report options ready for UI display
 */
function prepareReportOptionsForDisplay(
    options: Array<SearchOption<Report>>,
    policiesCollection: OnyxCollection<Policy>,
    currentUserAccountID: number,
    config: GetValidReportsConfig,
    policyTags: OnyxCollection<PolicyTagLists>,
): Array<SearchOption<Report>> {
    const {
        showChatPreviewLine = false,
        forcePolicyNamePreview = false,
        action,
        selectedOptions = [],
        shouldBoldTitleByDefault = true,
        shouldSeparateWorkspaceChat,
        isPerDiemRequest = false,
        showRBR = true,
        shouldShowGBR = false,
        shouldUnreadBeBold = false,
        personalDetails,
    } = config;

    const validOptions: Array<SearchOption<Report>> = [];

    const preferRecentExpenseReports = action === CONST.IOU.ACTION.CREATE;

    for (let i = 0; i < options.length; i++) {
        const option = options.at(i);
        if (!option) {
            continue;
        }
        const report = option.item;
        const reportPolicyTags = policyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${report.policyID}`];

        /**
         * By default, generated options does not have the chat preview line enabled.
         * If showChatPreviewLine or forcePolicyNamePreview are true, let's generate and overwrite the alternate text.
         */
        const alternateText = getAlternateText(option, {showChatPreviewLine, forcePolicyNamePreview}, reportPolicyTags, !!option.private_isArchived, currentUserAccountID);
        const isSelected = isReportSelected(option, selectedOptions);

        let isOptionUnread = option.isUnread;
        if (shouldUnreadBeBold) {
            const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report.chatReportID}`];
            const oneTransactionThreadReportID =
                report.type === CONST.REPORT.TYPE.IOU || report.type === CONST.REPORT.TYPE.EXPENSE || report.type === CONST.REPORT.TYPE.INVOICE
                    ? getOneTransactionThreadReportID(report, chatReport, allSortedReportActions[report.reportID])
                    : undefined;
            const oneTransactionThreadReport = oneTransactionThreadReportID ? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${oneTransactionThreadReportID}`] : undefined;

            isOptionUnread = isUnread(report, oneTransactionThreadReport, !!option.private_isArchived) && !!report.lastActorAccountID;
        }

        let lastIOUCreationDate;
        // Add a field to sort the recent reports by the time of last IOU request for create actions
        if (preferRecentExpenseReports) {
            const reportPreviewAction = allSortedReportActions[option.reportID]?.find((reportAction) => isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW));

            if (reportPreviewAction) {
                const iouReportID = getIOUReportIDFromReportActionPreview(reportPreviewAction);
                const iouReportActions = iouReportID ? (allSortedReportActions[iouReportID] ?? []) : [];
                const lastIOUAction = iouReportActions.find((iouAction) => iouAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU);
                if (lastIOUAction) {
                    lastIOUCreationDate = lastIOUAction.lastModified;
                }
            }
        }

        const newReportOption = {
            ...option,
            alternateText,
            isSelected,
            isUnread: isOptionUnread,
            lastIOUCreationDate,
            brickRoadIndicator: showRBR ? option.brickRoadIndicator : null,
        };

        newReportOption.isBold = shouldBoldTitleByDefault || shouldUseBoldText(newReportOption);

        if (newReportOption.brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO) {
            newReportOption.brickRoadIndicator = shouldShowGBR ? CONST.BRICK_ROAD_INDICATOR_STATUS.INFO : null;
        }

        if (shouldSeparateWorkspaceChat && newReportOption.isPolicyExpenseChat && !newReportOption.private_isArchived) {
            newReportOption.text = getPolicyName({report});
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            newReportOption.alternateText = translateLocal('workspace.common.workspace');

            if (report?.policyID) {
                const policy = policiesCollection?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
                const submitToAccountID = getSubmitToAccountID(policy, report);
                const submitsToAccountDetails = (personalDetails ?? allPersonalDetails)?.[submitToAccountID];
                const subtitle = submitsToAccountDetails?.displayName ?? submitsToAccountDetails?.login;

                if (subtitle) {
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    newReportOption.alternateText = translateLocal('iou.submitsTo', {name: subtitle ?? ''});
                }
                const canSubmitPerDiemExpense = canSubmitPerDiemExpenseFromWorkspace(policy);
                if (!canSubmitPerDiemExpense && isPerDiemRequest) {
                    continue;
                }
            }
        }

        validOptions.push(newReportOption);
    }

    return validOptions;
}

/**
 * Whether user submitted already an expense or scanned receipt
 */
function getIsUserSubmittedExpenseOrScannedReceipt(nvpDismissedProductTraining: OnyxEntry<DismissedProductTraining>): boolean {
    return !!nvpDismissedProductTraining?.[CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP];
}

/**
 * Whether the report is a Manager McTest report
 */
function isManagerMcTestReport(report: SearchOption<Report>): boolean {
    return report.participantsList?.some((participant) => participant.accountID === CONST.ACCOUNT_ID.MANAGER_MCTEST) ?? false;
}

/**
 * Returns a list of logins that should be restricted (i.e., hidden or excluded in the UI)
 * based on dynamic business logic and feature flags.
 * Centralizes restriction logic to avoid scattering conditions across the codebase.
 */
function getRestrictedLogins(
    config: GetOptionsConfig,
    options: OptionList,
    canShowManagerMcTest: boolean,
    nvpDismissedProductTraining: OnyxEntry<DismissedProductTraining>,
): Record<string, boolean> {
    const userHasReportWithManagerMcTest = Object.values(options.reports).some((report) => isManagerMcTestReport(report));
    return {
        [CONST.EMAIL.MANAGER_MCTEST]:
            !canShowManagerMcTest ||
            (getIsUserSubmittedExpenseOrScannedReceipt(nvpDismissedProductTraining) && !userHasReportWithManagerMcTest) ||
            !Permissions.isBetaEnabled(CONST.BETAS.NEWDOT_MANAGER_MCTEST, config.betas) ||
            isCurrentUserMemberOfAnyPolicy(),
    };
}

/**
 * Options are reports and personal details. This function filters out the options that are not valid to be displayed.
 */
function getValidOptions(
    options: OptionList,
    policiesCollection: OnyxCollection<Policy>,
    draftComments: OnyxCollection<string> | undefined,
    nvpDismissedProductTraining: OnyxEntry<DismissedProductTraining>,
    policyTags: OnyxCollection<PolicyTagLists>,
    loginList: OnyxEntry<Login>,
    currentUserAccountID: number,
    currentUserEmail: string,
    {
        excludeLogins = {},
        includeSelectedOptions = false,
        includeRecentReports = true,
        recentAttendees,
        selectedOptions = [],
        shouldSeparateSelfDMChat = false,
        shouldSeparateWorkspaceChat = false,
        excludeHiddenThreads = false,
        canShowManagerMcTest = false,
        searchString,
        maxElements,
        includeUserToInvite = false,
        maxRecentReportElements = undefined,
        shouldAcceptName = false,
        personalDetails,
        ...config
    }: GetOptionsConfig = {},
    countryCode: number = CONST.DEFAULT_COUNTRY_CODE,
): Options {
    const restrictedLogins = getRestrictedLogins(config, options, canShowManagerMcTest, nvpDismissedProductTraining);

    // Gather shared configs:
    const loginsToExclude: Record<string, boolean> = {
        [CONST.EMAIL.NOTIFICATIONS]: true,
        ...excludeLogins,
        ...restrictedLogins,
    };
    // If we're including selected options from the search results, we only want to exclude them if the search input is empty
    // This is because on certain pages, we show the selected options at the top when the search input is empty
    // This prevents the issue of seeing the selected option twice if you have them as a recent chat and select them
    if (!includeSelectedOptions) {
        for (const option of selectedOptions) {
            if (!option.login) {
                continue;
            }
            loginsToExclude[option.login] = true;
        }
    }
    const {includeP2P = true, shouldBoldTitleByDefault = true, includeDomainEmail = false, shouldShowGBR = false, ...getValidReportsConfig} = config;

    // Get valid recent reports:
    let recentReportOptions: Array<SearchOption<Report>> = [];
    let workspaceChats: Array<SearchOption<Report>> = [];
    let selfDMChat: SearchOptionData | undefined;

    const searchTerms = processSearchString(searchString);
    if (includeRecentReports) {
        // if maxElements is passed, filter the recent reports by searchString and return only most recent reports (@see recentReportsComparator)

        const isWorkspaceChat = (report: SearchOption<Report>) => shouldSeparateWorkspaceChat && report.isPolicyExpenseChat && !report.private_isArchived;
        const isSelfDMChat = (report: SearchOption<Report>) => shouldSeparateSelfDMChat && report.isSelfDM && !report.private_isArchived;

        const isSearchTermsFound = (report: SearchOption<Report>) => {
            let searchText = `${report.text ?? ''}${report.login ?? ''}`;
            if (report.isThread) {
                searchText += report.alternateText ?? '';
            } else if (report.isChatRoom) {
                searchText += report.subtitle ?? '';
            } else if (report.isPolicyExpenseChat) {
                searchText += `${report.subtitle ?? ''}${report.item.policyName ?? ''}`;
            }
            searchText = deburr(searchText.toLocaleLowerCase());
            return searchTerms.every((term) => searchText.includes(term));
        };

        const filteringFunction = (report: SearchOption<Report>) => {
            const policy = policiesCollection?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
            if (!isSearchTermsFound(report)) {
                return false;
            }

            const draftComment = draftComments?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${report.reportID}`];

            return isValidReport(
                report,
                policy,
                {
                    ...getValidReportsConfig,
                    includeP2P,
                    includeDomainEmail,
                    loginsToExclude,
                    currentUserAccountID,
                },
                draftComment,
            );
        };

        let selfDMChats: Array<SearchOption<Report>>;
        [selfDMChats, workspaceChats, recentReportOptions] = optionsOrderAndGroupBy([isSelfDMChat, isWorkspaceChat], options.reports, recentReportComparator, maxElements, filteringFunction);

        if (selfDMChats.length > 0) {
            selfDMChat = prepareReportOptionsForDisplay(
                selfDMChats,
                policiesCollection,
                currentUserAccountID,
                {
                    ...getValidReportsConfig,
                    selectedOptions,
                    shouldBoldTitleByDefault,
                    shouldSeparateSelfDMChat,
                    shouldSeparateWorkspaceChat,
                    shouldShowGBR,
                    personalDetails,
                },
                policyTags,
            ).at(0);
        }

        if (maxRecentReportElements) {
            recentReportOptions = recentReportOptions.splice(0, maxRecentReportElements);
        }
        recentReportOptions = prepareReportOptionsForDisplay(
            recentReportOptions,
            policiesCollection,
            currentUserAccountID,
            {
                ...getValidReportsConfig,
                selectedOptions,
                shouldBoldTitleByDefault,
                shouldSeparateSelfDMChat,
                shouldSeparateWorkspaceChat,
                shouldShowGBR,
                personalDetails,
            },
            policyTags,
        );

        workspaceChats = prepareReportOptionsForDisplay(
            workspaceChats,
            policiesCollection,
            currentUserAccountID,
            {
                ...getValidReportsConfig,
                selectedOptions,
                shouldBoldTitleByDefault,
                shouldSeparateSelfDMChat,
                shouldSeparateWorkspaceChat,
                shouldShowGBR,
                personalDetails,
            },
            policyTags,
        );
    } else if (recentAttendees && recentAttendees?.length > 0) {
        recentAttendees.filter((attendee) => {
            const login = attendee.login ?? attendee.displayName;
            if (login) {
                loginsToExclude[login] = true;
                return true;
            }

            return false;
        });
        recentReportOptions = filterReports(recentAttendees as SearchOptionData[], searchTerms) as Array<SearchOption<Report>>;

        if (maxRecentReportElements) {
            recentReportOptions = recentReportOptions.slice(0, maxRecentReportElements);
        }
    }

    // Get valid personal details and check if we can find the current user:
    let personalDetailsOptions: SearchOptionData[] = [];
    const currentUserRef = {
        current: undefined as SearchOptionData | undefined,
    };

    if (includeP2P) {
        let personalDetailLoginsToExclude = loginsToExclude;
        if (currentUserEmail) {
            personalDetailLoginsToExclude = {
                ...loginsToExclude,
                [currentUserEmail]: !config.includeCurrentUser,
            };
        }

        const filteringFunction = (personalDetail: OptionData) => {
            if (
                !personalDetail?.login ||
                !personalDetail.accountID ||
                !!personalDetail?.isOptimisticPersonalDetail ||
                (!includeDomainEmail && Str.isDomainEmail(personalDetail.login)) ||
                // Exclude the setup specialist from the list of personal details as it's a fallback if guide is not assigned
                personalDetail?.login === CONST.SETUP_SPECIALIST_LOGIN
            ) {
                return false;
            }
            if (personalDetailLoginsToExclude[personalDetail.login]) {
                return false;
            }
            const searchText = deburr(`${personalDetail.text ?? ''} ${personalDetail.login ?? ''}`.toLocaleLowerCase());

            return searchTerms.every((term) => searchText.includes(term));
        };

        // when we expect that function return eg. 50 elements and we already found 40 recent reports, we should adjust the max personal details number
        const maxPersonalDetailsElements = maxElements ? Math.max(maxElements - recentReportOptions.length - workspaceChats.length - (!selfDMChat ? 1 : 0), 0) : undefined;
        personalDetailsOptions = optionsOrderBy(options.personalDetails, personalDetailsComparator, maxPersonalDetailsElements, filteringFunction, true);

        for (let i = 0; i < personalDetailsOptions.length; i++) {
            const personalDetail = personalDetailsOptions.at(i);
            if (!personalDetail) {
                continue;
            }
            if (!!currentUserEmail && personalDetail?.login === currentUserEmail) {
                currentUserRef.current = personalDetail;
            }
            personalDetail.isBold = shouldBoldTitleByDefault;
            if (personalDetail.brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO) {
                personalDetail.brickRoadIndicator = shouldShowGBR ? CONST.BRICK_ROAD_INDICATOR_STATUS.INFO : '';
            }
        }
    }

    if (excludeHiddenThreads) {
        recentReportOptions = recentReportOptions.filter((option) => !option.isThread || option.notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN);
    }

    let userToInvite: SearchOptionData | null = null;
    if (includeUserToInvite) {
        userToInvite = filterUserToInvite(
            {currentUserOption: currentUserRef.current, recentReports: recentReportOptions, personalDetails: personalDetailsOptions},
            searchString ?? '',
            loginList,
            currentUserEmail,
            currentUserAccountID,
            countryCode,
            {
                excludeLogins: loginsToExclude,
                shouldAcceptName,
            },
        );
    }

    return {
        personalDetails: personalDetailsOptions,
        recentReports: recentReportOptions,
        currentUserOption: currentUserRef.current,
        userToInvite,
        workspaceChats,
        selfDMChat,
    };
}

type SearchOptionsConfig = {
    options: OptionList;
    nvpDismissedProductTraining: OnyxEntry<DismissedProductTraining>;
    draftComments: OnyxCollection<string>;
    betas?: Beta[];
    isUsedInChatFinder?: boolean;
    includeReadOnly?: boolean;
    searchQuery?: string;
    maxResults?: number;
    includeUserToInvite?: boolean;
    includeRecentReports?: boolean;
    includeCurrentUser?: boolean;
    countryCode?: number;
    shouldShowGBR?: boolean;
    policyTags: OnyxCollection<PolicyTagLists>;
    shouldUnreadBeBold?: boolean;
    loginList: OnyxEntry<Login>;
    currentUserAccountID: number;
    currentUserEmail: string;
    personalDetails?: OnyxEntry<PersonalDetailsList>;
};

/**
 * Build the options for the Search view
 */
function getSearchOptions({
    options,
    draftComments,
    nvpDismissedProductTraining,
    betas,
    policyTags,
    isUsedInChatFinder = true,
    includeReadOnly = true,
    searchQuery = '',
    maxResults,
    includeUserToInvite,
    includeRecentReports = true,
    includeCurrentUser = false,
    countryCode = CONST.DEFAULT_COUNTRY_CODE,
    shouldShowGBR = false,
    shouldUnreadBeBold = false,
    loginList,
    currentUserAccountID,
    currentUserEmail,
}: SearchOptionsConfig): Options {
    Timing.start(CONST.TIMING.LOAD_SEARCH_OPTIONS);
    Performance.markStart(CONST.TIMING.LOAD_SEARCH_OPTIONS);

    const optionList = getValidOptions(
        options,
        allPolicies,
        draftComments,
        nvpDismissedProductTraining,
        policyTags,
        loginList,
        currentUserAccountID,
        currentUserEmail,

        {
            betas,
            includeRecentReports,
            includeMultipleParticipantReports: true,
            showChatPreviewLine: isUsedInChatFinder,
            includeP2P: true,
            includeOwnedWorkspaceChats: true,
            includeThreads: true,
            includeMoneyRequests: true,
            includeTasks: true,
            includeReadOnly,
            includeSelfDM: true,
            shouldBoldTitleByDefault: !isUsedInChatFinder,
            excludeHiddenThreads: true,
            maxElements: maxResults,
            includeCurrentUser,
            searchString: searchQuery,
            includeUserToInvite,
            shouldShowGBR,
            shouldUnreadBeBold,
        },
        countryCode,
    );

    Timing.end(CONST.TIMING.LOAD_SEARCH_OPTIONS);
    Performance.markEnd(CONST.TIMING.LOAD_SEARCH_OPTIONS);

    return optionList;
}

/**
 * Build the IOUConfirmation options for showing the payee personalDetail
 */
function getIOUConfirmationOptionsFromPayeePersonalDetail(personalDetail: OnyxEntry<PersonalDetails>, amountText?: string): PayeePersonalDetails {
    const login = personalDetail?.login ?? '';
    return {
        text: formatPhoneNumberPhoneUtils(getDisplayNameOrDefault(personalDetail, login)),
        alternateText: formatPhoneNumberPhoneUtils(login || getDisplayNameOrDefault(personalDetail, '', false)),
        icons: [
            {
                source: personalDetail?.avatar ?? FallbackAvatar,
                name: personalDetail?.login ?? '',
                type: CONST.ICON_TYPE_AVATAR,
                id: personalDetail?.accountID,
            },
        ],
        descriptiveText: amountText ?? '',
        login: personalDetail?.login ?? '',
        accountID: personalDetail?.accountID ?? CONST.DEFAULT_NUMBER_ID,
        keyForList: String(personalDetail?.accountID ?? CONST.DEFAULT_NUMBER_ID),
        isInteractive: false,
    };
}

function getFilteredRecentAttendees(
    personalDetails: OnyxEntry<PersonalDetailsList>,
    attendees: Attendee[],
    recentAttendees: Attendee[],
    currentUserEmail: string,
    currentUserAccountID: number,
): Option[] {
    const recentAttendeeHasCurrentUser = recentAttendees.find((attendee) => attendee.email === currentUserEmail || attendee.login === currentUserEmail);
    if (!recentAttendeeHasCurrentUser && currentUserEmail) {
        const details = getPersonalDetailByEmail(currentUserEmail);
        recentAttendees.push({
            email: currentUserEmail,
            login: currentUserEmail,
            displayName: details?.displayName ?? currentUserEmail,
            accountID: currentUserAccountID,
            text: details?.displayName ?? currentUserEmail,
            searchText: details?.displayName ?? currentUserEmail,
            avatarUrl: details?.avatarThumbnail ?? '',
        });
    }

    const filteredRecentAttendees = recentAttendees
        .filter((attendee) => !attendees.find(({email, displayName}) => (attendee.email ? email === attendee.email : displayName === attendee.displayName)))
        .map((attendee) => ({
            ...attendee,
            login: attendee.email ? attendee.email : attendee.displayName,
            ...getPersonalDetailByEmail(attendee.email),
        }))
        .map((attendee) => getParticipantsOption(attendee, personalDetails));

    return filteredRecentAttendees;
}

/**
 * Format personalDetails or userToInvite to be shown in the list
 *
 * @param member - personalDetails or userToInvite
 * @param config - keys to overwrite the default values
 */
function formatMemberForList(member: SearchOptionData): MemberForList {
    const accountID = member.accountID;

    return {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        text: member.text || member.displayName || '',
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        alternateText: member.alternateText || member.login || '',
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        keyForList: member.keyForList || String(accountID ?? CONST.DEFAULT_NUMBER_ID) || '',
        isSelected: member.isSelected ?? false,
        isDisabled: member.isDisabled ?? false,
        accountID,
        login: member.login ?? '',
        icons: member.icons,
        pendingAction: member.pendingAction,
        reportID: member.reportID,
    };
}

/**
 * Build the options for the Workspace Member Invite view
 * This method will be removed. See https://github.com/Expensify/App/issues/66615 for more information.
 */
function getMemberInviteOptions(
    personalDetails: Array<SearchOption<PersonalDetails>>,
    nvpDismissedProductTraining: OnyxEntry<DismissedProductTraining>,
    loginList: OnyxEntry<Login>,
    currentUserAccountID: number,
    currentUserEmail: string,
    betas: Beta[] = [],
    excludeLogins: Record<string, boolean> = {},
    includeSelectedOptions = false,
    countryCode: number = CONST.DEFAULT_COUNTRY_CODE,
): Options {
    return getValidOptions(
        {personalDetails, reports: []},
        allPolicies,
        undefined,
        nvpDismissedProductTraining,
        {},
        loginList,
        currentUserAccountID,
        currentUserEmail,
        {
            betas,
            includeP2P: true,
            excludeLogins,
            includeSelectedOptions,
            includeRecentReports: false,
            searchString: '',
            maxElements: undefined,
        },
        countryCode,
    );
}

/**
 * Helper method that returns the text to be used for the header's message and title (if any)
 */
function getHeaderMessage(hasSelectableOptions: boolean, hasUserToInvite: boolean, searchValue: string, countryCode: number, hasMatchedParticipant = false): string {
    const isValidPhone = parsePhoneNumber(appendCountryCode(searchValue, countryCode)).possible;

    const isValidEmail = Str.isValidEmail(searchValue);

    if (searchValue && CONST.REGEX.DIGITS_AND_PLUS.test(searchValue) && !isValidPhone && !hasSelectableOptions) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('messages.errorMessageInvalidPhone');
    }

    // Without a search value, it would be very confusing to see a search validation message.
    // Therefore, this skips the validation when there is no search value.
    if (searchValue && !hasSelectableOptions && !hasUserToInvite) {
        if (/^\d+$/.test(searchValue) && !isValidPhone) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('messages.errorMessageInvalidPhone');
        }
        if (/@/.test(searchValue) && !isValidEmail) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('messages.errorMessageInvalidEmail');
        }
        if (hasMatchedParticipant && (isValidEmail || isValidPhone)) {
            return '';
        }
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('common.noResultsFound');
    }

    return '';
}

/**
 * Helper method for non-user lists (eg. categories and tags) that returns the text to be used for the header's message and title (if any)
 */
function getHeaderMessageForNonUserList(hasSelectableOptions: boolean, searchValue: string): string {
    if (searchValue && !hasSelectableOptions) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('common.noResultsFound');
    }
    return '';
}

/**
 * Helper method to check whether an option can show tooltip or not
 */
function shouldOptionShowTooltip(option: SearchOptionData): boolean {
    return !option.private_isArchived;
}

/**
 * Handles the logic for displaying selected participants from the search term
 */
function formatSectionsFromSearchTerm(
    searchTerm: string,
    selectedOptions: SearchOptionData[],
    filteredRecentReports: SearchOptionData[],
    filteredPersonalDetails: SearchOptionData[],
    policyTags: OnyxCollection<PolicyTagLists>,
    currentUserAccountID: number,
    personalDetails: OnyxEntry<PersonalDetailsList> = {},
    shouldGetOptionDetails = false,
    filteredWorkspaceChats: SearchOptionData[] = [],
    reportAttributesDerived?: ReportAttributesDerivedValue['reports'],
): SectionForSearchTerm {
    // We show the selected participants at the top of the list when there is no search term or maximum number of participants has already been selected
    // However, if there is a search term we remove the selected participants from the top of the list unless they are part of the search results
    // This clears up space on mobile views, where if you create a group with 4+ people you can't see the selected participants and the search results at the same time
    if (searchTerm === '') {
        return {
            section: {
                title: undefined,
                data: shouldGetOptionDetails
                    ? selectedOptions.map((participant) => {
                          const isReportPolicyExpenseChat = participant.isPolicyExpenseChat ?? false;
                          return isReportPolicyExpenseChat
                              ? getPolicyExpenseReportOption(participant, policyTags, currentUserAccountID, personalDetails, reportAttributesDerived)
                              : getParticipantsOption(participant, personalDetails);
                      })
                    : selectedOptions,
                shouldShow: selectedOptions.length > 0,
            },
        };
    }

    const cleanSearchTerm = searchTerm.trim().toLowerCase();
    // If you select a new user you don't have a contact for, they won't get returned as part of a recent report or personal details
    // This will add them to the list of options, deduping them if they already exist in the other lists
    const selectedParticipantsWithoutDetails = selectedOptions.filter((participant) => {
        const accountID = participant.accountID ?? null;
        const isPartOfSearchTerm = getPersonalDetailSearchTerms(participant, currentUserAccountID).join(' ').toLowerCase().includes(cleanSearchTerm);
        const isReportInRecentReports = filteredRecentReports.some((report) => report.accountID === accountID) || filteredWorkspaceChats.some((report) => report.accountID === accountID);
        const isReportInPersonalDetails = filteredPersonalDetails.some((personalDetail) => personalDetail.accountID === accountID);

        return isPartOfSearchTerm && !isReportInRecentReports && !isReportInPersonalDetails;
    });

    return {
        section: {
            title: undefined,
            data: shouldGetOptionDetails
                ? selectedParticipantsWithoutDetails.map((participant) => {
                      const isReportPolicyExpenseChat = participant.isPolicyExpenseChat ?? false;
                      return isReportPolicyExpenseChat
                          ? getPolicyExpenseReportOption(participant, policyTags, currentUserAccountID, personalDetails, reportAttributesDerived)
                          : getParticipantsOption(participant, personalDetails);
                  })
                : selectedParticipantsWithoutDetails,
            shouldShow: selectedParticipantsWithoutDetails.length > 0,
        },
    };
}

/**
 * Helper method to get the `keyForList` for the first option in the OptionsList
 */
function getFirstKeyForList(data?: Option[] | null) {
    if (!data?.length) {
        return '';
    }

    const firstNonEmptyDataObj = data.at(0);

    return firstNonEmptyDataObj?.keyForList ? firstNonEmptyDataObj?.keyForList : '';
}

function getPersonalDetailSearchTerms(item: Partial<SearchOptionData>, currentUserAccountID: number) {
    if (item.accountID === currentUserAccountID) {
        return getCurrentUserSearchTerms(item);
    }
    return [item.participantsList?.[0]?.displayName ?? item.displayName ?? '', item.login ?? '', item.login?.replace(CONST.EMAIL_SEARCH_REGEX, '') ?? ''];
}

function getCurrentUserSearchTerms(item: Partial<SearchOptionData>) {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return [item.text ?? item.displayName ?? '', item.login ?? '', item.login?.replace(CONST.EMAIL_SEARCH_REGEX, '') ?? '', translateLocal('common.you'), translateLocal('common.me')];
}

/**
 * Remove the personal details for the DMs that are already in the recent reports so that we don't show duplicates.
 */
function filteredPersonalDetailsOfRecentReports(recentReports: SearchOptionData[], personalDetails: SearchOptionData[]) {
    const excludedLogins = new Set(recentReports.map((report) => report.login));
    return personalDetails.filter((personalDetail) => !excludedLogins.has(personalDetail.login));
}

/**
 * Filters options based on the search input value
 */
function filterReports(reports: SearchOptionData[], searchTerms: string[]): SearchOptionData[] {
    const normalizedSearchTerms = searchTerms.map((term) => StringUtils.normalizeAccents(term));
    // We search eventually for multiple whitespace separated search terms.
    // We start with the search term at the end, and then narrow down those filtered search results with the next search term.
    // We repeat (reduce) this until all search terms have been used:
    const filteredReports = normalizedSearchTerms.reduceRight(
        (items, term) =>
            filterArrayByMatch(items, term, (item) => {
                const values: string[] = [];
                if (item.text) {
                    values.push(StringUtils.normalizeAccents(item.text));
                    values.push(StringUtils.normalizeAccents(item.text).replaceAll(/['-]/g, ''));
                }

                if (item.login) {
                    values.push(StringUtils.normalizeAccents(item.login));
                    values.push(StringUtils.normalizeAccents(item.login.replace(CONST.EMAIL_SEARCH_REGEX, '')));
                }

                if (item.isThread) {
                    if (item.alternateText) {
                        values.push(StringUtils.normalizeAccents(item.alternateText));
                    }
                } else if (!!item.isChatRoom || !!item.isPolicyExpenseChat) {
                    if (item.subtitle) {
                        values.push(StringUtils.normalizeAccents(item.subtitle));
                    }
                }

                return uniqFast(values);
            }),
        // We start from all unfiltered reports:
        reports,
    );

    return filteredReports;
}

function filterWorkspaceChats(reports: SearchOptionData[], searchTerms: string[]): SearchOptionData[] {
    const filteredReports = searchTerms.reduceRight(
        (items, term) =>
            filterArrayByMatch(items, term, (item) => {
                const values: string[] = [];
                if (item.text) {
                    values.push(item.text);
                }
                return uniqFast(values);
            }),
        // We start from all unfiltered reports:
        reports,
    );

    return filteredReports;
}

function filterPersonalDetails(personalDetails: SearchOptionData[], searchTerms: string[], currentUserAccountID: number): SearchOptionData[] {
    return searchTerms.reduceRight(
        (items, term) =>
            filterArrayByMatch(items, term, (item) => {
                const values = getPersonalDetailSearchTerms(item, currentUserAccountID);
                return uniqFast(values);
            }),
        personalDetails,
    );
}

function filterCurrentUserOption(currentUserOption: SearchOptionData | null | undefined, searchTerms: string[]): SearchOptionData | null | undefined {
    return searchTerms.reduceRight((item, term) => {
        if (!item) {
            return null;
        }

        const currentUserOptionSearchText = uniqFast(getCurrentUserSearchTerms(item)).join(' ');
        return isSearchStringMatch(term, currentUserOptionSearchText) ? item : null;
    }, currentUserOption);
}

function filterUserToInvite(
    options: Omit<Options, 'userToInvite'>,
    searchValue: string,
    loginList: OnyxEntry<Login>,
    currentUserEmail: string,
    currentUserAccountID: number,
    countryCode: number = CONST.DEFAULT_COUNTRY_CODE,
    config?: FilterUserToInviteConfig,
): SearchOptionData | null {
    const {canInviteUser = true, excludeLogins = {}} = config ?? {};
    if (!canInviteUser) {
        return null;
    }

    const canCreateOptimisticDetail = canCreateOptimisticPersonalDetailOption({
        recentReportOptions: options.recentReports,
        personalDetailsOptions: options.personalDetails,
        currentUserOption: options.currentUserOption,
        searchValue,
    });

    if (!canCreateOptimisticDetail) {
        return null;
    }

    const loginsToExclude: Record<string, boolean> = {
        [CONST.EMAIL.NOTIFICATIONS]: true,
        ...excludeLogins,
    };
    return getUserToInviteOption({
        searchValue,
        loginsToExclude,
        countryCode,
        loginList,
        currentUserEmail,
        currentUserAccountID,
        ...config,
    });
}

function filterSelfDMChat(report: SearchOptionData, searchTerms: string[]): SearchOptionData | undefined {
    const isMatch = searchTerms.every((term) => {
        const values: string[] = [];

        if (report.text) {
            values.push(report.text);
        }
        if (report.login) {
            values.push(report.login);
            values.push(report.login.replace(CONST.EMAIL_SEARCH_REGEX, ''));
        }
        if (report.isThread) {
            if (report.alternateText) {
                values.push(report.alternateText);
            }
        } else if (!!report.isChatRoom || !!report.isPolicyExpenseChat) {
            if (report.subtitle) {
                values.push(report.subtitle);
            }
        }

        // Remove duplicate values and check if the term matches any value
        return uniqFast(values)
            .map((val) => val.toLocaleLowerCase())
            .some((value) => value.includes(term.toLocaleLowerCase()));
    });

    return isMatch ? report : undefined;
}

function filterOptions(
    options: Options,
    searchInputValue: string,
    countryCode: number,
    loginList: OnyxEntry<Login>,
    currentUserEmail: string,
    currentUserAccountID: number,
    config?: FilterUserToInviteConfig,
): Options {
    const trimmedSearchInput = searchInputValue.trim();

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const parsedPhoneNumber = parsePhoneNumber(appendCountryCode(Str.removeSMSDomain(trimmedSearchInput), countryCode || CONST.DEFAULT_COUNTRY_CODE));
    const searchValue = parsedPhoneNumber.possible && parsedPhoneNumber.number?.e164 ? parsedPhoneNumber.number.e164 : trimmedSearchInput.toLowerCase();
    const searchTerms = searchValue ? searchValue.split(' ') : [];

    const recentReports = filterReports(options.recentReports, searchTerms);
    const personalDetails = filterPersonalDetails(options.personalDetails, searchTerms, currentUserAccountID);
    const currentUserOption = filterCurrentUserOption(options.currentUserOption, searchTerms);
    const userToInvite = filterUserToInvite(
        {
            recentReports,
            personalDetails,
            currentUserOption,
        },
        searchValue,
        loginList,
        currentUserEmail,
        currentUserAccountID,
        countryCode,
        config,
    );
    const workspaceChats = filterWorkspaceChats(options.workspaceChats ?? [], searchTerms);

    const selfDMChat = options.selfDMChat ? filterSelfDMChat(options.selfDMChat, searchTerms) : undefined;

    return {
        personalDetails,
        recentReports,
        userToInvite,
        currentUserOption,
        workspaceChats,
        selfDMChat,
    };
}

type AllOrderConfigs = OrderReportOptionsConfig & OrderOptionsConfig;
type FilterAndOrderConfig = FilterUserToInviteConfig & AllOrderConfigs;

/**
 * Orders the reports and personal details based on the search input value.
 * Personal details will be filtered out if they are part of the recent reports.
 * Additional configs can be applied.
 */
function combineOrderingOfReportsAndPersonalDetails(
    options: ReportAndPersonalDetailOptions,
    searchInputValue: string,
    {maxRecentReportsToShow, sortByReportTypeInSearch, ...orderReportOptionsConfig}: AllOrderConfigs = {},
): ReportAndPersonalDetailOptions {
    // sortByReportTypeInSearch will show the personal details as part of the recent reports
    if (sortByReportTypeInSearch) {
        const personalDetailsWithoutDMs = filteredPersonalDetailsOfRecentReports(options.recentReports, options.personalDetails);
        const reportsAndPersonalDetails = options.recentReports.concat(personalDetailsWithoutDMs);
        return orderOptions({recentReports: reportsAndPersonalDetails, personalDetails: []}, searchInputValue, orderReportOptionsConfig);
    }

    let orderedReports = orderReportOptionsWithSearch(options.recentReports, searchInputValue, orderReportOptionsConfig);
    if (typeof maxRecentReportsToShow === 'number') {
        orderedReports = orderedReports.slice(0, maxRecentReportsToShow);
    }

    const personalDetailsWithoutDMs = filteredPersonalDetailsOfRecentReports(orderedReports, options.personalDetails);
    const orderedPersonalDetails = orderPersonalDetailsOptions(personalDetailsWithoutDMs);

    return {
        recentReports: orderedReports,
        personalDetails: orderedPersonalDetails,
    };
}

/**
 * Filters and orders the options based on the search input value.
 * Note that personal details that are part of the recent reports will always be shown as part of the recent reports (ie. DMs).
 */
function filterAndOrderOptions(
    options: Options,
    searchInputValue: string,
    countryCode: number,
    loginList: OnyxEntry<Login>,
    currentUserEmail: string,
    currentUserAccountID: number,
    config?: FilterAndOrderConfig,
): Options {
    let filterResult = options;
    if (searchInputValue.trim().length > 0) {
        filterResult = filterOptions(options, searchInputValue, countryCode, loginList, currentUserEmail, currentUserAccountID, config);
    }

    const orderedOptions = combineOrderingOfReportsAndPersonalDetails(filterResult, searchInputValue, config);

    // on staging server, in specific cases (see issue) BE returns duplicated personalDetails entries
    const uniqueLogins = new Set<string>();
    orderedOptions.personalDetails = orderedOptions.personalDetails.filter((detail) => {
        const login = detail.login ?? '';
        if (uniqueLogins.has(login)) {
            return false;
        }
        uniqueLogins.add(login);
        return true;
    });

    return {
        ...filterResult,
        ...orderedOptions,
    };
}

/**
 * Filter out selected options from personal details and recent reports
 * @param options - The options to filter
 * @param selectedOptions - The selected options to filter out.
 * @returns The filtered options
 */
function filterSelectedOptions(options: Options, selectedOptions: Set<number | undefined>): Options {
    const filteredOptions = {
        ...options,
        personalDetails: options.personalDetails.filter(({accountID}) => !selectedOptions.has(accountID)),
        recentReports: options.recentReports.filter(({accountID}) => !selectedOptions.has(accountID)),
    };
    return filteredOptions;
}

function sortAlphabetically<T extends Partial<Record<TKey, string | undefined>>, TKey extends keyof T>(items: T[], key: TKey, localeCompare: LocaleContextProps['localeCompare']): T[] {
    return items.sort((a, b) => localeCompare(a[key]?.toLowerCase() ?? '', b[key]?.toLowerCase() ?? ''));
}

function getEmptyOptions(): Options {
    return {
        recentReports: [],
        personalDetails: [],
        userToInvite: null,
        currentUserOption: null,
    };
}

function shouldUseBoldText(report: SearchOptionData): boolean {
    const notificationPreference = report.notificationPreference ?? getReportNotificationPreference(report);
    return report.isUnread === true && notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE && !isHiddenForCurrentUser(notificationPreference);
}

function getManagerMcTestParticipant(currentUserAccountID: number, personalDetails?: OnyxEntry<PersonalDetailsList>): Participant | undefined {
    const managerMcTestPersonalDetails = Object.values(personalDetails ?? allPersonalDetails ?? {}).find((personalDetail) => personalDetail?.login === CONST.EMAIL.MANAGER_MCTEST);
    const managerMcTestReport =
        managerMcTestPersonalDetails?.accountID && currentUserAccountID ? getChatByParticipants([managerMcTestPersonalDetails?.accountID, currentUserAccountID]) : undefined;
    return managerMcTestPersonalDetails ? {...getParticipantsOption(managerMcTestPersonalDetails, allPersonalDetails), reportID: managerMcTestReport?.reportID} : undefined;
}

function shallowOptionsListCompare(a: OptionList, b: OptionList): boolean {
    if (!a || !b) {
        return false;
    }
    if (a.reports.length !== b.reports.length || a.personalDetails.length !== b.personalDetails.length) {
        return false;
    }
    for (let i = 0; i < a.reports.length; i++) {
        if (a.reports.at(i)?.reportID !== b.reports.at(i)?.reportID) {
            return false;
        }
    }
    for (let i = 0; i < a.personalDetails.length; i++) {
        if (a.personalDetails.at(i)?.login !== b.personalDetails.at(i)?.login) {
            return false;
        }
    }
    return true;
}

/**
 * Process a search string into normalized search terms
 * @param searchString - The raw search string to process
 * @returns Array of normalized search terms
 */
function processSearchString(searchString: string | undefined): string[] {
    return deburr(searchString ?? '')
        .toLowerCase()
        .split(' ')
        .filter((term) => term.length > 0);
}

export {
    canCreateOptimisticPersonalDetailOption,
    combineOrderingOfReportsAndPersonalDetails,
    createOptionFromReport,
    createOptionList,
    createFilteredOptionList,
    createOption,
    filterAndOrderOptions,
    filterOptions,
    filterReports,
    filterSelectedOptions,
    filterSelfDMChat,
    filterUserToInvite,
    filterWorkspaceChats,
    filteredPersonalDetailsOfRecentReports,
    formatMemberForList,
    formatSectionsFromSearchTerm,
    getAlternateText,
    getFilteredRecentAttendees,
    getCurrentUserSearchTerms,
    getEmptyOptions,
    getFirstKeyForList,
    getHeaderMessage,
    getHeaderMessageForNonUserList,
    getIOUConfirmationOptionsFromPayeePersonalDetail,
    getIOUReportIDOfLastAction,
    getIsUserSubmittedExpenseOrScannedReceipt,
    getLastActorDisplayName,
    getLastActorDisplayNameFromLastVisibleActions,
    getLastMessageTextForReport,
    getManagerMcTestParticipant,
    getMemberInviteOptions,
    getParticipantsOption,
    getPersonalDetailSearchTerms,
    getPersonalDetailsForAccountIDs,
    getPolicyExpenseReportOption,
    getReportDisplayOption,
    getReportOption,
    getSearchOptions,
    getSearchValueForPhoneOrEmail,
    getUserToInviteContactOption,
    getUserToInviteOption,
    getValidOptions,
    hasEnabledOptions,
    isCurrentUser,
    isDisablingOrDeletingLastEnabledCategory,
    isDisablingOrDeletingLastEnabledTag,
    isMakingLastRequiredTagListOptional,
    isPersonalDetailsReady,
    isSearchStringMatch,
    isSearchStringMatchUserDetails,
    optionsOrderBy,
    orderOptions,
    orderPersonalDetailsOptions,
    orderReportOptions,
    orderReportOptionsWithSearch,
    orderWorkspaceOptions,
    processReport,
    recentReportComparator,
    shallowOptionsListCompare,
    shouldOptionShowTooltip,
    shouldShowLastActorDisplayName,
    shouldUseBoldText,
    sortAlphabetically,
};

export type {
    FilterUserToInviteConfig,
    GetOptionsConfig,
    GetUserToInviteConfig,
    GetValidOptionsSharedConfig,
    GetValidReportsConfig,
    MemberForList,
    Option,
    OptionList,
    OptionTree,
    Options,
    OrderOptionsConfig,
    OrderReportOptionsConfig,
    PayeePersonalDetails,
    PreviewConfig,
    ReportAndPersonalDetailOptions,
    SearchOption,
    SearchOptionData,
    Section,
    SectionBase,
    SectionForSearchTerm,
} from './types';
