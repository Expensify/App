/* eslint-disable no-continue */
import {Str} from 'expensify-common';
import lodashOrderBy from 'lodash/orderBy';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {SetNonNullable} from 'type-fest';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import type {IOUAction} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {
    Beta,
    Login,
    OnyxInputOrEntry,
    PersonalDetails,
    PersonalDetailsList,
    Policy,
    PolicyCategories,
    PolicyCategory,
    PolicyTag,
    Report,
    ReportAction,
    ReportActions,
    TransactionViolation,
} from '@src/types/onyx';
import type {Attendee, Participant} from '@src/types/onyx/IOU';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import Timing from './actions/Timing';
import filterArrayByMatch from './filterArrayByMatch';
import {formatPhoneNumber} from './LocalePhoneNumber';
import {translate, translateLocal} from './Localize';
import {appendCountryCode, getPhoneNumberWithoutSpecialChars} from './LoginUtils';
import ModifiedExpenseMessage from './ModifiedExpenseMessage';
import Navigation from './Navigation/Navigation';
import Parser from './Parser';
import Performance from './Performance';
import {getDisplayNameOrDefault} from './PersonalDetailsUtils';
import {addSMSDomainIfPhoneNumber, parsePhoneNumber} from './PhoneNumber';
import {canSendInvoiceFromWorkspace} from './PolicyUtils';
import {
    getCombinedReportActions,
    getExportIntegrationLastMessageText,
    getIOUReportIDFromReportActionPreview,
    getMessageOfOldDotReportAction,
    getOneTransactionThreadReportID,
    getOriginalMessage,
    getReportActionMessageText,
    getSortedReportActions,
    isActionableAddPaymentCard,
    isActionOfType,
    isClosedAction,
    isCreatedTaskReportAction,
    isDeletedParentAction,
    isModifiedExpenseAction,
    isMoneyRequestAction,
    isOldDotReportAction,
    isPendingRemove,
    isReimbursementDeQueuedAction,
    isReimbursementQueuedAction,
    isReportPreviewAction,
    isTaskAction,
    isThreadParentMessage,
    isUnapprovedAction,
    isWhisperAction,
    shouldReportActionBeVisible,
} from './ReportActionsUtils';
import {
    canUserPerformWriteAction,
    formatReportLastMessageText,
    getAllReportErrors,
    getChatRoomSubtitle,
    getDeletedParentActionMessageForChatReport,
    getDisplayNameForParticipant,
    getDowngradeWorkspaceMessage,
    getIcons,
    getIOUApprovedMessage,
    getIOUForwardedMessage,
    getIOUSubmittedMessage,
    getIOUUnapprovedMessage,
    getMoneyRequestSpendBreakdown,
    getParticipantsAccountIDsForDisplay,
    getPolicyName,
    getReimbursementDeQueuedActionMessage,
    getReimbursementQueuedActionMessage,
    getRejectedReportMessage,
    getReportAutomaticallyApprovedMessage,
    getReportAutomaticallyForwardedMessage,
    getReportAutomaticallySubmittedMessage,
    getReportLastMessage,
    getReportName,
    getReportNotificationPreference,
    getReportOrDraftReport,
    getReportParticipantsTitle,
    getReportPreviewMessage,
    getUpgradeWorkspaceMessage,
    hasIOUWaitingOnCurrentUserBankAccount,
    isAdminRoom,
    isAnnounceRoom,
    isArchivedNonExpenseReport,
    isChatReport,
    isChatRoom,
    isChatThread,
    isDefaultRoom,
    isDraftReport,
    isExpenseReport,
    isGroupChat,
    isHiddenForCurrentUser,
    isInvoiceRoom,
    isIOUOwnedByCurrentUser,
    isMoneyRequest,
    isMoneyRequestReport,
    isOneOnOneChat,
    isPolicyAdmin,
    isPolicyExpenseChat,
    isReportMessageAttachment,
    isSelfDM,
    isTaskReport,
    isUnread,
    shouldDisplayViolationsRBRInLHN,
    shouldReportBeInOptionList,
    shouldReportShowSubscript,
} from './ReportUtils';
import type {OptionData} from './ReportUtils';
import {getTaskCreatedMessage, getTaskReportActionMessage} from './TaskUtils';
import {generateAccountID} from './UserUtils';

type SearchOption<T> = OptionData & {
    item: T;
};

type OptionList = {
    reports: Array<SearchOption<Report>>;
    personalDetails: Array<SearchOption<PersonalDetails>>;
};

type Option = Partial<OptionData>;

/**
 * A narrowed version of `Option` is used when we have a guarantee that given values exist.
 */
type OptionTree = {
    text: string;
    keyForList: string;
    searchText: string;
    tooltipText: string;
    isDisabled: boolean;
    isSelected: boolean;
    pendingAction?: OnyxCommon.PendingAction;
} & Option;

type PayeePersonalDetails = {
    text: string;
    alternateText: string;
    icons: OnyxCommon.Icon[];
    descriptiveText: string;
    login: string;
    accountID: number;
    keyForList: string;
};

type SectionBase = {
    title: string | undefined;
    shouldShow: boolean;
};

type Section = SectionBase & {
    data: Option[];
};

type GetOptionsConfig = {
    betas?: OnyxEntry<Beta[]>;
    selectedOptions?: Option[];
    excludeLogins?: string[];
    includeMultipleParticipantReports?: boolean;
    includeRecentReports?: boolean;
    includeSelfDM?: boolean;
    showChatPreviewLine?: boolean;
    forcePolicyNamePreview?: boolean;
    includeOwnedWorkspaceChats?: boolean;
    includeThreads?: boolean;
    includeTasks?: boolean;
    includeMoneyRequests?: boolean;
    includeP2P?: boolean;
    includeSelectedOptions?: boolean;
    transactionViolations?: OnyxCollection<TransactionViolation[]>;
    includeInvoiceRooms?: boolean;
    includeDomainEmail?: boolean;
    action?: IOUAction;
    recentAttendees?: Attendee[];
    shouldBoldTitleByDefault?: boolean;
};

type GetUserToInviteConfig = {
    searchValue: string | undefined;
    optionsToExclude?: Array<Partial<OptionData>>;
    reportActions?: ReportActions;
    shouldAcceptName?: boolean;
} & Pick<GetOptionsConfig, 'selectedOptions' | 'showChatPreviewLine'>;

type MemberForList = {
    text: string;
    alternateText: string;
    keyForList: string;
    isSelected: boolean;
    isDisabled: boolean;
    accountID?: number;
    login: string;
    icons?: OnyxCommon.Icon[];
    pendingAction?: OnyxCommon.PendingAction;
    reportID: string;
};

type SectionForSearchTerm = {
    section: Section;
};
type Options = {
    recentReports: OptionData[];
    personalDetails: OptionData[];
    userToInvite: OptionData | null;
    currentUserOption: OptionData | null | undefined;
};

type PreviewConfig = {showChatPreviewLine?: boolean; forcePolicyNamePreview?: boolean; showPersonalDetails?: boolean};

type FilterUserToInviteConfig = Pick<GetUserToInviteConfig, 'selectedOptions' | 'shouldAcceptName'> & {
    canInviteUser?: boolean;
    excludeLogins?: string[];
};

type OrderOptionsConfig =
    | {
          maxRecentReportsToShow?: never;
          /* When sortByReportTypeInSearch flag is true, recentReports will include the personalDetails options as well. */
          sortByReportTypeInSearch?: true;
      }
    | {
          // When specifying maxRecentReportsToShow, you can't sort by report type in search
          maxRecentReportsToShow?: number;
          sortByReportTypeInSearch?: false;
      };

type OrderReportOptionsConfig = {
    preferChatroomsOverThreads?: boolean;
    preferPolicyExpenseChat?: boolean;
    preferRecentExpenseReports?: boolean;
};

type ReportAndPersonalDetailOptions = Pick<Options, 'recentReports' | 'personalDetails'>;

/**
 * OptionsListUtils is used to build a list options passed to the OptionsList component. Several different UI views can
 * be configured to display different results based on the options passed to the private getOptions() method. Public
 * methods should be named for the views they build options for and then exported for use in a component.
 */
let currentUserLogin: string | undefined;
let currentUserAccountID: number | undefined;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        currentUserLogin = value?.email;
        currentUserAccountID = value?.accountID;
    },
});

let loginList: OnyxEntry<Login>;
Onyx.connect({
    key: ONYXKEYS.LOGIN_LIST,
    callback: (value) => (loginList = isEmptyObject(value) ? {} : value),
});

let allPersonalDetails: OnyxEntry<PersonalDetailsList>;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => (allPersonalDetails = isEmptyObject(value) ? {} : value),
});

let preferredLocale: DeepValueOf<typeof CONST.LOCALES> = CONST.LOCALES.DEFAULT;
Onyx.connect({
    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    callback: (value) => {
        if (!value) {
            return;
        }
        preferredLocale = value;
    },
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
        Object.entries(allReportActions).forEach((reportActions) => {
            const reportID = reportActions[0].split('_').at(1);
            if (!reportID) {
                return;
            }

            const reportActionsArray = Object.values(reportActions[1] ?? {});
            let sortedReportActions = getSortedReportActions(reportActionsArray, true);
            allSortedReportActions[reportID] = sortedReportActions;

            // If the report is a one-transaction report and has , we need to return the combined reportActions so that the LHN can display modifications
            // to the transaction thread or the report itself
            const transactionThreadReportID = getOneTransactionThreadReportID(reportID, actions[reportActions[0]]);
            if (transactionThreadReportID) {
                const transactionThreadReportActionsArray = Object.values(actions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`] ?? {});
                sortedReportActions = getCombinedReportActions(sortedReportActions, transactionThreadReportID, transactionThreadReportActionsArray, reportID, false);
            }

            const firstReportAction = sortedReportActions.at(0);
            if (!firstReportAction) {
                delete lastReportActions[reportID];
            } else {
                lastReportActions[reportID] = firstReportAction;
            }

            const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];

            // The report is only visible if it is the last action not deleted that
            // does not match a closed or created state.
            const reportActionsForDisplay = sortedReportActions.filter(
                (reportAction, actionKey) =>
                    shouldReportActionBeVisible(reportAction, actionKey, canUserPerformWriteAction(report)) &&
                    !isWhisperAction(reportAction) &&
                    reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED &&
                    reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            );
            const reportActionForDisplay = reportActionsForDisplay.at(0);
            if (!reportActionForDisplay) {
                delete lastVisibleReportActions[reportID];
                return;
            }
            lastVisibleReportActions[reportID] = reportActionForDisplay;
        });
    },
});

let activePolicyID: OnyxEntry<string>;
Onyx.connect({
    key: ONYXKEYS.NVP_ACTIVE_POLICY_ID,
    callback: (value) => (activePolicyID = value),
});

/**
 * @param defaultValues {login: accountID} In workspace invite page, when new user is added we pass available data to opt in
 * @returns Returns avatar data for a list of user accountIDs
 */
function getAvatarsForAccountIDs(accountIDs: number[], personalDetails: OnyxEntry<PersonalDetailsList>, defaultValues: Record<string, number> = {}): OnyxCommon.Icon[] {
    const reversedDefaultValues: Record<number, string> = {};

    Object.entries(defaultValues).forEach((item) => {
        reversedDefaultValues[item[1]] = item[0];
    });

    return accountIDs.map((accountID) => {
        const login = reversedDefaultValues[accountID] ?? '';
        const userPersonalDetail = personalDetails?.[accountID] ?? {login, accountID};

        return {
            id: accountID,
            source: userPersonalDetail.avatar ?? FallbackAvatar,
            type: CONST.ICON_TYPE_AVATAR,
            name: userPersonalDetail.login ?? '',
        };
    });
}

/**
 * Returns the personal details for an array of accountIDs
 * @returns keys of the object are emails, values are PersonalDetails objects.
 */
function getPersonalDetailsForAccountIDs(accountIDs: number[] | undefined, personalDetails: OnyxInputOrEntry<PersonalDetailsList>): SetNonNullable<PersonalDetailsList> {
    const personalDetailsForAccountIDs: SetNonNullable<PersonalDetailsList> = {};
    if (!personalDetails) {
        return personalDetailsForAccountIDs;
    }
    accountIDs?.forEach((accountID) => {
        const cleanAccountID = Number(accountID);
        if (!cleanAccountID) {
            return;
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
    });
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
    const displayName = formatPhoneNumber(getDisplayNameOrDefault(detail, login || participant.text));

    return {
        keyForList: String(detail?.accountID),
        login,
        accountID: detail?.accountID,
        text: displayName,
        firstName: detail?.firstName ?? '',
        lastName: detail?.lastName ?? '',
        alternateText: formatPhoneNumber(login) || displayName,
        icons: [
            {
                source: detail?.avatar ?? FallbackAvatar,
                name: login,
                type: CONST.ICON_TYPE_AVATAR,
                id: detail?.accountID,
            },
        ],
        phoneNumber: detail?.phoneNumber ?? '',
        selected: participant.selected,
        isSelected: participant.selected,
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

/**
 * Get the last actor display name from last actor details.
 */
function getLastActorDisplayName(lastActorDetails: Partial<PersonalDetails> | null, hasMultipleParticipants: boolean) {
    return hasMultipleParticipants && lastActorDetails && lastActorDetails.accountID !== currentUserAccountID
        ? // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          lastActorDetails.firstName || formatPhoneNumber(getDisplayNameOrDefault(lastActorDetails))
        : '';
}

/**
 * Update alternate text for the option when applicable
 */
function getAlternateText(option: OptionData, {showChatPreviewLine = false, forcePolicyNamePreview = false}: PreviewConfig) {
    const report = getReportOrDraftReport(option.reportID);
    const isAdminRoomValue = isAdminRoom(report);
    const isAnnounceRoomValue = isAnnounceRoom(report);
    const isExpenseThread = isMoneyRequest(report);
    const formattedLastMessageText = formatReportLastMessageText(Parser.htmlToText(option.lastMessageText ?? ''));

    if (isExpenseThread || option.isMoneyRequestReport) {
        return showChatPreviewLine && formattedLastMessageText ? formattedLastMessageText : translate(preferredLocale, 'iou.expense');
    }

    if (option.isThread) {
        return showChatPreviewLine && formattedLastMessageText ? formattedLastMessageText : translate(preferredLocale, 'threads.thread');
    }

    if (option.isChatRoom && !isAdminRoomValue && !isAnnounceRoomValue) {
        return showChatPreviewLine && formattedLastMessageText ? formattedLastMessageText : option.subtitle;
    }

    if ((option.isPolicyExpenseChat ?? false) || isAdminRoomValue || isAnnounceRoomValue) {
        return showChatPreviewLine && !forcePolicyNamePreview && formattedLastMessageText ? formattedLastMessageText : option.subtitle;
    }

    if (option.isTaskReport) {
        return showChatPreviewLine && formattedLastMessageText ? formattedLastMessageText : translate(preferredLocale, 'task.task');
    }

    if (isGroupChat(report)) {
        return showChatPreviewLine && formattedLastMessageText ? formattedLastMessageText : translate(preferredLocale, 'common.group');
    }

    return showChatPreviewLine && formattedLastMessageText
        ? formattedLastMessageText
        : formatPhoneNumber(option.participantsList && option.participantsList.length > 0 ? option.participantsList.at(0)?.login ?? '' : '');
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

/**
 * Get the last message text from the report directly or from other sources for special cases.
 */
function getLastMessageTextForReport(report: OnyxEntry<Report>, lastActorDetails: Partial<PersonalDetails> | null, policy?: OnyxEntry<Policy>): string {
    const reportID = report?.reportID;
    const lastReportAction = reportID ? lastVisibleReportActions[reportID] : undefined;

    // some types of actions are filtered out for lastReportAction, in some cases we need to check the actual last action
    const lastOriginalReportAction = reportID ? lastReportActions[reportID] : undefined;
    let lastMessageTextFromReport = '';

    if (isArchivedNonExpenseReport(report)) {
        const archiveReason =
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            (isClosedAction(lastOriginalReportAction) && getOriginalMessage(lastOriginalReportAction)?.reason) || CONST.REPORT.ARCHIVE_REASON.DEFAULT;
        switch (archiveReason) {
            case CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED:
            case CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY:
            case CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED: {
                lastMessageTextFromReport = translate(preferredLocale, `reportArchiveReasons.${archiveReason}`, {
                    displayName: formatPhoneNumber(getDisplayNameOrDefault(lastActorDetails)),
                    policyName: getPolicyName(report, false, policy),
                });
                break;
            }
            case CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED: {
                lastMessageTextFromReport = translate(preferredLocale, `reportArchiveReasons.${archiveReason}`);
                break;
            }
            default: {
                lastMessageTextFromReport = translate(preferredLocale, `reportArchiveReasons.default`);
            }
        }
    } else if (isMoneyRequestAction(lastReportAction)) {
        const properSchemaForMoneyRequestMessage = getReportPreviewMessage(report, lastReportAction, true, false, null, true);
        lastMessageTextFromReport = formatReportLastMessageText(properSchemaForMoneyRequestMessage);
    } else if (isReportPreviewAction(lastReportAction)) {
        const iouReport = getReportOrDraftReport(getIOUReportIDFromReportActionPreview(lastReportAction));
        const lastIOUMoneyReportAction = iouReport?.reportID
            ? allSortedReportActions[iouReport.reportID]?.find(
                  (reportAction, key): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                      shouldReportActionBeVisible(reportAction, key, canUserPerformWriteAction(report)) &&
                      reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
                      isMoneyRequestAction(reportAction),
              )
            : undefined;
        const reportPreviewMessage = getReportPreviewMessage(
            !isEmptyObject(iouReport) ? iouReport : null,
            lastIOUMoneyReportAction,
            true,
            isChatReport(report),
            null,
            true,
            lastReportAction,
        );
        lastMessageTextFromReport = formatReportLastMessageText(reportPreviewMessage);
    } else if (isReimbursementQueuedAction(lastReportAction)) {
        lastMessageTextFromReport = getReimbursementQueuedActionMessage(lastReportAction, report);
    } else if (isReimbursementDeQueuedAction(lastReportAction)) {
        lastMessageTextFromReport = getReimbursementDeQueuedActionMessage(lastReportAction, report, true);
    } else if (isDeletedParentAction(lastReportAction) && isChatReport(report)) {
        lastMessageTextFromReport = getDeletedParentActionMessageForChatReport(lastReportAction);
    } else if (isPendingRemove(lastReportAction) && report?.reportID && isThreadParentMessage(lastReportAction, report.reportID)) {
        lastMessageTextFromReport = translateLocal('parentReportAction.hiddenMessage');
    } else if (isReportMessageAttachment({text: report?.lastMessageText ?? '', html: report?.lastMessageHtml, type: ''})) {
        lastMessageTextFromReport = `[${translateLocal('common.attachment')}]`;
    } else if (isModifiedExpenseAction(lastReportAction)) {
        const properSchemaForModifiedExpenseMessage = ModifiedExpenseMessage.getForReportAction(report?.reportID, lastReportAction);
        lastMessageTextFromReport = formatReportLastMessageText(properSchemaForModifiedExpenseMessage, true);
    } else if (isTaskAction(lastReportAction)) {
        lastMessageTextFromReport = formatReportLastMessageText(getTaskReportActionMessage(lastReportAction).text);
    } else if (isCreatedTaskReportAction(lastReportAction)) {
        lastMessageTextFromReport = getTaskCreatedMessage(lastReportAction);
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.SUBMITTED) || isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED)) {
        const wasSubmittedViaHarvesting = getOriginalMessage(lastReportAction)?.harvesting ?? false;
        if (wasSubmittedViaHarvesting) {
            lastMessageTextFromReport = getReportAutomaticallySubmittedMessage(lastReportAction);
        } else {
            lastMessageTextFromReport = getIOUSubmittedMessage(lastReportAction);
        }
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.APPROVED)) {
        const {automaticAction} = getOriginalMessage(lastReportAction) ?? {};
        if (automaticAction) {
            lastMessageTextFromReport = getReportAutomaticallyApprovedMessage(lastReportAction);
        } else {
            lastMessageTextFromReport = getIOUApprovedMessage(lastReportAction);
        }
    } else if (isUnapprovedAction(lastReportAction)) {
        lastMessageTextFromReport = getIOUUnapprovedMessage(lastReportAction);
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.FORWARDED)) {
        const {automaticAction} = getOriginalMessage(lastReportAction) ?? {};
        if (automaticAction) {
            lastMessageTextFromReport = getReportAutomaticallyForwardedMessage(lastReportAction, reportID);
        } else {
            lastMessageTextFromReport = getIOUForwardedMessage(lastReportAction, report);
        }
    } else if (lastReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REJECTED) {
        lastMessageTextFromReport = getRejectedReportMessage();
    } else if (lastReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_UPGRADE) {
        lastMessageTextFromReport = getUpgradeWorkspaceMessage();
    } else if (lastReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.TEAM_DOWNGRADE) {
        lastMessageTextFromReport = getDowngradeWorkspaceMessage();
    } else if (isActionableAddPaymentCard(lastReportAction)) {
        lastMessageTextFromReport = getReportActionMessageText(lastReportAction);
    } else if (lastReportAction?.actionName === 'EXPORTINTEGRATION') {
        lastMessageTextFromReport = getExportIntegrationLastMessageText(lastReportAction);
    } else if (lastReportAction?.actionName && isOldDotReportAction(lastReportAction)) {
        lastMessageTextFromReport = getMessageOfOldDotReportAction(lastReportAction, false);
    }

    // we do not want to show report closed in LHN for non archived report so use getReportLastMessage as fallback instead of lastMessageText from report
    if (reportID && !report.private_isArchived && report.lastActionType === CONST.REPORT.ACTIONS.TYPE.CLOSED) {
        return lastMessageTextFromReport || (getReportLastMessage(reportID).lastMessageText ?? '');
    }
    return lastMessageTextFromReport || (report?.lastMessageText ?? '');
}

function hasReportErrors(report: Report, reportActions: OnyxEntry<ReportActions>) {
    return !isEmptyObject(getAllReportErrors(report, reportActions));
}

/**
 * Creates a report list option
 */
function createOption(
    accountIDs: number[],
    personalDetails: OnyxInputOrEntry<PersonalDetailsList>,
    report: OnyxInputOrEntry<Report>,
    reportActions: ReportActions,
    config?: PreviewConfig,
): OptionData {
    const {showChatPreviewLine = false, forcePolicyNamePreview = false, showPersonalDetails = false} = config ?? {};
    const result: OptionData = {
        text: undefined,
        alternateText: undefined,
        pendingAction: undefined,
        allReportErrors: undefined,
        brickRoadIndicator: null,
        icons: undefined,
        tooltipText: null,
        ownerAccountID: undefined,
        subtitle: undefined,
        participantsList: undefined,
        accountID: 0,
        login: undefined,
        reportID: '',
        phoneNumber: undefined,
        hasDraftComment: false,
        keyForList: undefined,
        isDefaultRoom: false,
        isPinned: false,
        isWaitingOnBankAccount: false,
        iouReportID: undefined,
        isIOUReportOwner: null,
        iouReportAmount: 0,
        isChatRoom: false,
        shouldShowSubscript: false,
        isPolicyExpenseChat: false,
        isOwnPolicyExpenseChat: false,
        isExpenseReport: false,
        policyID: undefined,
        isOptimisticPersonalDetail: false,
        lastMessageText: '',
        lastVisibleActionCreated: undefined,
    };

    const personalDetailMap = getPersonalDetailsForAccountIDs(accountIDs, personalDetails);
    const personalDetailList = Object.values(personalDetailMap).filter((details): details is PersonalDetails => !!details);
    const personalDetail = personalDetailList.at(0);
    let hasMultipleParticipants = personalDetailList.length > 1;
    let subtitle;
    let reportName;
    result.participantsList = personalDetailList;
    result.isOptimisticPersonalDetail = personalDetail?.isOptimisticPersonalDetail;
    if (report) {
        result.isChatRoom = isChatRoom(report);
        result.isDefaultRoom = isDefaultRoom(report);
        // eslint-disable-next-line @typescript-eslint/naming-convention
        result.private_isArchived = report.private_isArchived;
        result.isExpenseReport = isExpenseReport(report);
        result.isInvoiceRoom = isInvoiceRoom(report);
        result.isMoneyRequestReport = isMoneyRequestReport(report);
        result.isThread = isChatThread(report);
        result.isTaskReport = isTaskReport(report);
        result.shouldShowSubscript = shouldReportShowSubscript(report);
        result.isPolicyExpenseChat = isPolicyExpenseChat(report);
        result.isOwnPolicyExpenseChat = report.isOwnPolicyExpenseChat ?? false;
        result.allReportErrors = getAllReportErrors(report, reportActions);
        result.brickRoadIndicator = hasReportErrors(report, reportActions) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
        result.pendingAction = report.pendingFields ? report.pendingFields.addWorkspaceRoom ?? report.pendingFields.createChat : undefined;
        result.ownerAccountID = report.ownerAccountID;
        result.reportID = report.reportID;
        result.isUnread = isUnread(report);
        result.isPinned = report.isPinned;
        result.iouReportID = report.iouReportID;
        result.keyForList = String(report.reportID);
        result.isWaitingOnBankAccount = report.isWaitingOnBankAccount;
        result.policyID = report.policyID;
        result.isSelfDM = isSelfDM(report);
        result.notificationPreference = getReportNotificationPreference(report);
        result.lastVisibleActionCreated = report.lastVisibleActionCreated;

        const visibleParticipantAccountIDs = getParticipantsAccountIDsForDisplay(report, true);

        result.tooltipText = getReportParticipantsTitle(visibleParticipantAccountIDs);

        hasMultipleParticipants = personalDetailList.length > 1 || result.isChatRoom || result.isPolicyExpenseChat || isGroupChat(report);
        subtitle = getChatRoomSubtitle(report);

        const lastActorDetails = report.lastActorAccountID ? personalDetailMap[report.lastActorAccountID] : null;
        const lastActorDisplayName = getLastActorDisplayName(lastActorDetails, hasMultipleParticipants);
        const lastMessageTextFromReport = getLastMessageTextForReport(report, lastActorDetails);
        let lastMessageText = lastMessageTextFromReport;

        const lastAction = lastVisibleReportActions[report.reportID];
        const shouldDisplayLastActorName = lastAction && lastAction.actionName !== CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW && lastAction.actionName !== CONST.REPORT.ACTIONS.TYPE.IOU;

        if (shouldDisplayLastActorName && lastActorDisplayName && lastMessageTextFromReport) {
            lastMessageText = `${lastActorDisplayName}: ${lastMessageTextFromReport}`;
        }

        result.lastMessageText = lastMessageText;

        // If displaying chat preview line is needed, let's overwrite the default alternate text
        result.alternateText = showPersonalDetails && personalDetail?.login ? personalDetail.login : getAlternateText(result, {showChatPreviewLine, forcePolicyNamePreview});

        reportName = showPersonalDetails ? getDisplayNameForParticipant(accountIDs.at(0)) || formatPhoneNumber(personalDetail?.login ?? '') : getReportName(report);
    } else {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        reportName = getDisplayNameForParticipant(accountIDs.at(0)) || formatPhoneNumber(personalDetail?.login ?? '');
        result.keyForList = String(accountIDs.at(0));

        result.alternateText = formatPhoneNumber(personalDetails?.[accountIDs[0]]?.login ?? '');
    }

    result.isIOUReportOwner = isIOUOwnedByCurrentUser(result);
    result.iouReportAmount = getMoneyRequestSpendBreakdown(result).totalDisplaySpend;

    if (!hasMultipleParticipants && (!report || (report && !isGroupChat(report) && !isChatRoom(report)))) {
        result.login = personalDetail?.login;
        result.accountID = Number(personalDetail?.accountID);
        result.phoneNumber = personalDetail?.phoneNumber;
    }

    result.text = reportName;
    result.icons = getIcons(report, personalDetails, personalDetail?.avatar, personalDetail?.login, personalDetail?.accountID, null);
    result.subtitle = subtitle;

    return result;
}

/**
 * Get the option for a given report.
 */
function getReportOption(participant: Participant): OptionData {
    const report = getReportOrDraftReport(participant.reportID);
    const visibleParticipantAccountIDs = getParticipantsAccountIDsForDisplay(report, true);

    const option = createOption(
        visibleParticipantAccountIDs,
        allPersonalDetails ?? {},
        !isEmptyObject(report) ? report : undefined,
        {},
        {
            showChatPreviewLine: false,
            forcePolicyNamePreview: false,
        },
    );

    // Update text & alternateText because createOption returns workspace name only if report is owned by the user
    if (option.isSelfDM) {
        option.alternateText = translateLocal('reportActionsView.yourSpace');
    } else if (option.isInvoiceRoom) {
        option.text = getReportName(report);
        option.alternateText = translateLocal('workspace.common.invoices');
    } else {
        option.text = getPolicyName(report);
        option.alternateText = translateLocal('workspace.common.workspace');
    }
    option.isDisabled = isDraftReport(participant.reportID);
    option.selected = participant.selected;
    option.isSelected = participant.selected;
    return option;
}

/**
 * Get the option for a policy expense report.
 */
function getPolicyExpenseReportOption(participant: Participant | OptionData): OptionData {
    const expenseReport = isPolicyExpenseChat(participant) ? getReportOrDraftReport(participant.reportID) : null;

    const visibleParticipantAccountIDs = Object.entries(expenseReport?.participants ?? {})
        .filter(([, reportParticipant]) => reportParticipant && !isHiddenForCurrentUser(reportParticipant.notificationPreference))
        .map(([accountID]) => Number(accountID));

    const option = createOption(
        visibleParticipantAccountIDs,
        allPersonalDetails ?? {},
        !isEmptyObject(expenseReport) ? expenseReport : null,
        {},
        {
            showChatPreviewLine: false,
            forcePolicyNamePreview: false,
        },
    );

    // Update text & alternateText because createOption returns workspace name only if report is owned by the user
    option.text = getPolicyName(expenseReport);
    option.alternateText = translateLocal('workspace.common.workspace');
    option.selected = participant.selected;
    option.isSelected = participant.selected;
    return option;
}

/**
 * Searches for a match when provided with a value
 */
function isSearchStringMatch(searchValue: string, searchText?: string | null, participantNames = new Set<string>(), isChatRoom = false): boolean {
    const searchWords = new Set(searchValue.replace(/,/g, ' ').split(' '));
    const valueToSearch = searchText?.replace(new RegExp(/&nbsp;/g), '');
    let matching = true;
    searchWords.forEach((word) => {
        // if one of the word is not matching, we don't need to check further
        if (!matching) {
            return;
        }
        const matchRegex = new RegExp(Str.escapeForRegExp(word), 'i');
        matching = matchRegex.test(valueToSearch ?? '') || (!isChatRoom && participantNames.has(word));
    });
    return matching;
}

/**
 * Checks if the given userDetails is currentUser or not.
 * Note: We can't migrate this off of using logins because this is used to check if you're trying to start a chat with
 * yourself or a different user, and people won't be starting new chats via accountID usually.
 */
function isCurrentUser(userDetails: PersonalDetails): boolean {
    if (!userDetails) {
        return false;
    }

    // If user login is a mobile number, append sms domain if not appended already.
    const userDetailsLogin = addSMSDomainIfPhoneNumber(userDetails.login ?? '');

    if (currentUserLogin?.toLowerCase() === userDetailsLogin.toLowerCase()) {
        return true;
    }

    // Check if userDetails login exists in loginList
    return Object.keys(loginList ?? {}).some((login) => login.toLowerCase() === userDetailsLogin.toLowerCase());
}

/**
 * Calculates count of all enabled options
 */
function getEnabledCategoriesCount(options: PolicyCategories): number {
    return Object.values(options).filter((option) => option.enabled).length;
}

function getSearchValueForPhoneOrEmail(searchTerm: string) {
    const parsedPhoneNumber = parsePhoneNumber(appendCountryCode(Str.removeSMSDomain(searchTerm)));
    return parsedPhoneNumber.possible ? parsedPhoneNumber.number?.e164 ?? '' : searchTerm.toLowerCase();
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
function isReportSelected(reportOption: OptionData, selectedOptions: Array<Partial<OptionData>>) {
    if (!selectedOptions || selectedOptions.length === 0) {
        return false;
    }

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return selectedOptions.some((option) => (option.accountID && option.accountID === reportOption.accountID) || (option.reportID && option.reportID === reportOption.reportID));
}

function createOptionList(personalDetails: OnyxEntry<PersonalDetailsList>, reports?: OnyxCollection<Report>) {
    const reportMapForAccountIDs: Record<number, Report> = {};
    const allReportOptions: Array<SearchOption<Report>> = [];

    if (reports) {
        Object.values(reports).forEach((report) => {
            if (!report) {
                return;
            }

            const accountIDs = getParticipantsAccountIDsForDisplay(report);

            if ((!accountIDs || accountIDs.length === 0) && !isChatRoom(report)) {
                return;
            }

            // Save the report in the map if this is a single participant so we can associate the reportID with the
            // personal detail option later. Individuals should not be associated with single participant
            // policyExpenseChats or chatRooms since those are not people.
            if (accountIDs.length <= 1 && isOneOnOneChat(report)) {
                reportMapForAccountIDs[accountIDs[0]] = report;
            }

            allReportOptions.push({
                item: report,
                ...createOption(accountIDs, personalDetails, report, {}),
            });
        });
    }

    const allPersonalDetailsOptions = Object.values(personalDetails ?? {}).map((personalDetail) => ({
        item: personalDetail,
        ...createOption(
            [personalDetail?.accountID ?? CONST.DEFAULT_NUMBER_ID],
            personalDetails,
            reportMapForAccountIDs[personalDetail?.accountID ?? CONST.DEFAULT_NUMBER_ID],
            {},
            {showPersonalDetails: true},
        ),
    }));

    return {
        reports: allReportOptions,
        personalDetails: allPersonalDetailsOptions as Array<SearchOption<PersonalDetails>>,
    };
}

function createOptionFromReport(report: Report, personalDetails: OnyxEntry<PersonalDetailsList>) {
    const accountIDs = getParticipantsAccountIDsForDisplay(report);

    return {
        item: report,
        ...createOption(accountIDs, personalDetails, report, {}),
    };
}

function orderPersonalDetailsOptions(options: OptionData[]) {
    // PersonalDetails should be ordered Alphabetically by default - https://github.com/Expensify/App/issues/8220#issuecomment-1104009435
    return lodashOrderBy(options, [(personalDetail) => personalDetail.text?.toLowerCase()], 'asc');
}

/**
 * Orders report options without grouping them by kind.
 * Usually used when there is no search value
 */
function orderReportOptions(options: OptionData[]) {
    return lodashOrderBy(options, [sortComparatorReportOptionByArchivedStatus, sortComparatorReportOptionByDate], ['asc', 'desc']);
}

/**
 * Ordering for report options when you have a search value, will order them by kind additionally.
 * @param options - list of options to be sorted
 * @param searchValue - search string
 * @returns a sorted list of options
 */
function orderReportOptionsWithSearch(
    options: OptionData[],
    searchValue: string,
    {preferChatroomsOverThreads = false, preferPolicyExpenseChat = false, preferRecentExpenseReports = false}: OrderReportOptionsConfig = {},
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
                    return 0;
                }
                if (preferRecentExpenseReports && !!option?.lastIOUCreationDate) {
                    return 1;
                }
                if (preferRecentExpenseReports && option.isPolicyExpenseChat) {
                    return 1;
                }
                if (preferChatroomsOverThreads && option.isThread) {
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

function sortComparatorReportOptionByArchivedStatus(option: OptionData) {
    return option.private_isArchived ? 1 : 0;
}

function sortComparatorReportOptionByDate(options: OptionData) {
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
    let orderedReportOptions: OptionData[];
    if (searchValue) {
        orderedReportOptions = orderReportOptionsWithSearch(options.recentReports, searchValue, config);
    } else {
        orderedReportOptions = orderReportOptions(options.recentReports);
    }
    const orderedPersonalDetailsOptions = orderPersonalDetailsOptions(options.personalDetails);

    return {
        recentReports: orderedReportOptions,
        personalDetails: orderedPersonalDetailsOptions,
    };
}

function canCreateOptimisticPersonalDetailOption({
    recentReportOptions,
    personalDetailsOptions,
    currentUserOption,
    searchValue,
}: {
    recentReportOptions: OptionData[];
    personalDetailsOptions: OptionData[];
    currentUserOption?: OptionData | null;
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
    optionsToExclude = [],
    selectedOptions = [],
    reportActions = {},
    showChatPreviewLine = false,
    shouldAcceptName = false,
}: GetUserToInviteConfig): OptionData | null {
    if (!searchValue) {
        return null;
    }

    const parsedPhoneNumber = parsePhoneNumber(appendCountryCode(Str.removeSMSDomain(searchValue)));
    const isCurrentUserLogin = isCurrentUser({login: searchValue} as PersonalDetails);
    const isInSelectedOption = selectedOptions.some((option) => 'login' in option && option.login === searchValue);
    const isValidEmail = Str.isValidEmail(searchValue) && !Str.isDomainEmail(searchValue) && !Str.endsWith(searchValue, CONST.SMS.DOMAIN);
    const isValidPhoneNumber = parsedPhoneNumber.possible && Str.isValidE164Phone(getPhoneNumberWithoutSpecialChars(parsedPhoneNumber.number?.input ?? ''));
    const isInOptionToExclude =
        optionsToExclude.findIndex((optionToExclude) => 'login' in optionToExclude && optionToExclude.login === addSMSDomainIfPhoneNumber(searchValue).toLowerCase()) !== -1;

    if (isCurrentUserLogin || isInSelectedOption || (!isValidEmail && !isValidPhoneNumber && !shouldAcceptName) || isInOptionToExclude) {
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
    const userToInvite = createOption([optimisticAccountID], personalDetailsExtended, null, reportActions, {
        showChatPreviewLine,
    });
    userToInvite.isOptimisticAccount = true;
    userToInvite.login = isValidEmail || isValidPhoneNumber ? searchValue : '';
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

/**
 * Options are reports and personal details. This function filters out the options that are not valid to be displayed.
 */
function getValidOptions(
    options: OptionList,
    {
        betas = [],
        selectedOptions = [],
        excludeLogins = [],
        includeMultipleParticipantReports = false,
        includeRecentReports = true,
        showChatPreviewLine = false,
        forcePolicyNamePreview = false,
        includeOwnedWorkspaceChats = false,
        includeThreads = false,
        includeTasks = false,
        includeMoneyRequests = false,
        includeP2P = true,
        includeSelectedOptions = false,
        transactionViolations = {},
        includeSelfDM = false,
        includeInvoiceRooms = false,
        includeDomainEmail = false,
        action,
        recentAttendees,
        shouldBoldTitleByDefault = true,
    }: GetOptionsConfig = {},
): Options {
    const topmostReportId = Navigation.getTopmostReportId();

    // Filter out all the reports that shouldn't be displayed
    const filteredReportOptions = options.reports.filter((option) => {
        const report = option.item;
        const doesReportHaveViolations = shouldDisplayViolationsRBRInLHN(report, transactionViolations);

        return shouldReportBeInOptionList({
            report,
            currentReportId: topmostReportId,
            betas,
            policies,
            doesReportHaveViolations,
            isInFocusMode: false,
            excludeEmptyChats: false,
            includeSelfDM,
            login: option.login,
            includeDomainEmail,
        });
    });

    const allReportOptions = filteredReportOptions.filter((option) => {
        const report = option.item;

        if (!report) {
            return false;
        }

        const isThread = option.isThread;
        const isTaskReport = option.isTaskReport;
        const isPolicyExpenseChat = option.isPolicyExpenseChat;
        const isMoneyRequestReport = option.isMoneyRequestReport;
        const isSelfDM = option.isSelfDM;
        const isChatRoom = option.isChatRoom;
        const accountIDs = getParticipantsAccountIDsForDisplay(report);

        if (isPolicyExpenseChat && report.isOwnPolicyExpenseChat && !includeOwnedWorkspaceChats) {
            return false;
        }

        // When passing includeP2P false we are trying to hide features from users that are not ready for P2P and limited to workspace chats only.
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

        // In case user needs to add credit bank account, don't allow them to submit an expense from the workspace.
        if (includeOwnedWorkspaceChats && hasIOUWaitingOnCurrentUserBankAccount(report)) {
            return false;
        }

        if ((!accountIDs || accountIDs.length === 0) && !isChatRoom) {
            return false;
        }

        return true;
    });

    const allPersonalDetailsOptions = includeP2P
        ? options.personalDetails.filter((detail) => !!detail?.login && !!detail.accountID && !detail?.isOptimisticPersonalDetail && (includeDomainEmail || !Str.isDomainEmail(detail.login)))
        : [];

    const optionsToExclude: Option[] = [{login: CONST.EMAIL.NOTIFICATIONS}];

    // If we're including selected options from the search results, we only want to exclude them if the search input is empty
    // This is because on certain pages, we show the selected options at the top when the search input is empty
    // This prevents the issue of seeing the selected option twice if you have them as a recent chat and select them
    if (!includeSelectedOptions) {
        optionsToExclude.push(...selectedOptions);
    }

    excludeLogins.forEach((login) => {
        optionsToExclude.push({login});
    });

    let recentReportOptions: OptionData[] = [];
    const personalDetailsOptions: OptionData[] = [];

    const preferRecentExpenseReports = action === CONST.IOU.ACTION.CREATE;

    if (includeRecentReports) {
        for (const reportOption of allReportOptions) {
            // Skip notifications@expensify.com
            if (reportOption.login === CONST.EMAIL.NOTIFICATIONS) {
                continue;
            }

            const isCurrentUserOwnedPolicyExpenseChatThatCouldShow =
                reportOption.isPolicyExpenseChat && reportOption.ownerAccountID === currentUserAccountID && includeOwnedWorkspaceChats && !reportOption.private_isArchived;

            const shouldShowInvoiceRoom =
                includeInvoiceRooms &&
                isInvoiceRoom(reportOption.item) &&
                isPolicyAdmin(reportOption.policyID, policies) &&
                !reportOption.private_isArchived &&
                canSendInvoiceFromWorkspace(reportOption.policyID);

            /**
                Exclude the report option if it doesn't meet any of the following conditions:
                - It is not an owned policy expense chat that could be shown
                - Multiple participant reports are not included
                - It doesn't have a login
                - It is not an invoice room that should be shown
            */
            if (!isCurrentUserOwnedPolicyExpenseChatThatCouldShow && !includeMultipleParticipantReports && !reportOption.login && !shouldShowInvoiceRoom) {
                continue;
            }

            // If we're excluding threads, check the report to see if it has a single participant and if the participant is already selected
            if (
                !includeThreads &&
                (!!reportOption.login || reportOption.reportID) &&
                optionsToExclude.some((option) => option.login === reportOption.login || option.reportID === reportOption.reportID)
            ) {
                continue;
            }

            /**
             * By default, generated options does not have the chat preview line enabled.
             * If showChatPreviewLine or forcePolicyNamePreview are true, let's generate and overwrite the alternate text.
             */
            const alternateText = getAlternateText(reportOption, {showChatPreviewLine, forcePolicyNamePreview});
            const isSelected = isReportSelected(reportOption, selectedOptions);
            const isBold = shouldBoldTitleByDefault || shouldUseBoldText(reportOption);
            let lastIOUCreationDate;

            // Add a field to sort the recent reports by the time of last IOU request for create actions
            if (preferRecentExpenseReports) {
                const reportPreviewAction = allSortedReportActions[reportOption.reportID]?.find((reportAction) => isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW));

                if (reportPreviewAction) {
                    const iouReportID = getIOUReportIDFromReportActionPreview(reportPreviewAction);
                    const iouReportActions = iouReportID ? allSortedReportActions[iouReportID] ?? [] : [];
                    const lastIOUAction = iouReportActions.find((iouAction) => iouAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU);
                    if (lastIOUAction) {
                        lastIOUCreationDate = lastIOUAction.lastModified;
                    }
                }
            }

            const newReportOption = {
                ...reportOption,
                alternateText,
                isSelected,
                isBold,
                lastIOUCreationDate,
            };

            if (action === CONST.IOU.ACTION.CATEGORIZE) {
                const reportPolicy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${newReportOption.policyID}`];
                if (reportPolicy?.areCategoriesEnabled) {
                    recentReportOptions.push(newReportOption);
                }
            } else {
                recentReportOptions.push(newReportOption);
            }
        }
    } else if (recentAttendees && recentAttendees?.length > 0) {
        recentAttendees.filter((attendee) => attendee.login ?? attendee.displayName).forEach((a) => optionsToExclude.push({login: a.login ?? a.displayName}));
        recentReportOptions = recentAttendees as OptionData[];
    }

    const personalDetailsOptionsToExclude = [...optionsToExclude, {login: currentUserLogin}];
    // Next loop over all personal details removing any that are selectedUsers or recentChats
    for (const personalDetailOption of allPersonalDetailsOptions) {
        if (personalDetailsOptionsToExclude.some((optionToExclude) => optionToExclude.login === personalDetailOption.login)) {
            continue;
        }
        personalDetailOption.isBold = shouldBoldTitleByDefault;

        personalDetailsOptions.push(personalDetailOption);
    }

    const currentUserOption = allPersonalDetailsOptions.find((personalDetailsOption) => personalDetailsOption.login === currentUserLogin);

    return {
        personalDetails: personalDetailsOptions,
        recentReports: recentReportOptions,
        currentUserOption,
        // User to invite is generated by the search input of a user.
        // As this function isn't concerned with any search input yet, this is null (will be set when using filterOptions).
        userToInvite: null,
    };
}

/**
 * Build the options for the Search view
 */
function getSearchOptions(options: OptionList, betas: Beta[] = [], isUsedInChatFinder = true): Options {
    Timing.start(CONST.TIMING.LOAD_SEARCH_OPTIONS);
    Performance.markStart(CONST.TIMING.LOAD_SEARCH_OPTIONS);
    const optionList = getValidOptions(options, {
        betas,
        includeRecentReports: true,
        includeMultipleParticipantReports: true,
        showChatPreviewLine: isUsedInChatFinder,
        includeP2P: true,
        includeOwnedWorkspaceChats: true,
        includeThreads: true,
        includeMoneyRequests: true,
        includeTasks: true,
        includeSelfDM: true,
        shouldBoldTitleByDefault: !isUsedInChatFinder,
    });
    const orderedOptions = orderOptions(optionList);
    Timing.end(CONST.TIMING.LOAD_SEARCH_OPTIONS);
    Performance.markEnd(CONST.TIMING.LOAD_SEARCH_OPTIONS);

    return {
        ...optionList,
        ...orderedOptions,
    };
}

function getShareLogOptions(options: OptionList, betas: Beta[] = []): Options {
    return getValidOptions(options, {
        betas,
        includeMultipleParticipantReports: true,
        includeP2P: true,
        forcePolicyNamePreview: true,
        includeOwnedWorkspaceChats: true,
        includeSelfDM: true,
        includeThreads: true,
    });
}

/**
 * Build the IOUConfirmation options for showing the payee personalDetail
 */
function getIOUConfirmationOptionsFromPayeePersonalDetail(personalDetail: OnyxEntry<PersonalDetails>, amountText?: string): PayeePersonalDetails {
    const login = personalDetail?.login ?? '';
    return {
        text: formatPhoneNumber(getDisplayNameOrDefault(personalDetail, login)),
        alternateText: formatPhoneNumber(login || getDisplayNameOrDefault(personalDetail, '', false)),
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
    };
}

function getAttendeeOptions(
    reports: Array<SearchOption<Report>>,
    personalDetails: Array<SearchOption<PersonalDetails>>,
    betas: OnyxEntry<Beta[]>,
    attendees: Attendee[],
    recentAttendees: Attendee[],
    includeOwnedWorkspaceChats = false,
    includeP2P = true,
    includeInvoiceRooms = false,
    action: IOUAction | undefined = undefined,
) {
    return getValidOptions(
        {reports, personalDetails},
        {
            betas,
            selectedOptions: attendees,
            excludeLogins: CONST.EXPENSIFY_EMAILS,
            includeOwnedWorkspaceChats,
            includeRecentReports: false,
            includeP2P,
            includeSelectedOptions: false,
            includeSelfDM: false,
            includeInvoiceRooms,
            action,
            recentAttendees,
        },
    );
}

/**
 * Build the options for the Share Destination for a Task
 */

function getShareDestinationOptions(
    reports: Array<SearchOption<Report>> = [],
    personalDetails: Array<SearchOption<PersonalDetails>> = [],
    betas: OnyxEntry<Beta[]> = [],
    selectedOptions: Array<Partial<OptionData>> = [],
    excludeLogins: string[] = [],
    includeOwnedWorkspaceChats = true,
) {
    return getValidOptions(
        {reports, personalDetails},
        {
            betas,
            selectedOptions,
            includeMultipleParticipantReports: true,
            showChatPreviewLine: true,
            forcePolicyNamePreview: true,
            includeThreads: true,
            includeMoneyRequests: true,
            includeTasks: true,
            excludeLogins,
            includeOwnedWorkspaceChats,
            includeSelfDM: true,
        },
    );
}

/**
 * Format personalDetails or userToInvite to be shown in the list
 *
 * @param member - personalDetails or userToInvite
 * @param config - keys to overwrite the default values
 */
function formatMemberForList(member: OptionData): MemberForList {
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
 */
function getMemberInviteOptions(
    personalDetails: Array<SearchOption<PersonalDetails>>,
    betas: Beta[] = [],
    excludeLogins: string[] = [],
    includeSelectedOptions = false,
    reports: Array<SearchOption<Report>> = [],
    includeRecentReports = false,
): Options {
    const options = getValidOptions(
        {reports, personalDetails},
        {
            betas,
            includeP2P: true,
            excludeLogins,
            includeSelectedOptions,
            includeRecentReports,
        },
    );

    const orderedOptions = orderOptions(options);
    return {
        ...options,
        personalDetails: orderedOptions.personalDetails,
        recentReports: orderedOptions.recentReports,
    };
}

/**
 * Helper method that returns the text to be used for the header's message and title (if any)
 */
function getHeaderMessage(hasSelectableOptions: boolean, hasUserToInvite: boolean, searchValue: string, hasMatchedParticipant = false): string {
    const isValidPhone = parsePhoneNumber(appendCountryCode(searchValue)).possible;

    const isValidEmail = Str.isValidEmail(searchValue);

    if (searchValue && CONST.REGEX.DIGITS_AND_PLUS.test(searchValue) && !isValidPhone && !hasSelectableOptions) {
        return translate(preferredLocale, 'messages.errorMessageInvalidPhone');
    }

    // Without a search value, it would be very confusing to see a search validation message.
    // Therefore, this skips the validation when there is no search value.
    if (searchValue && !hasSelectableOptions && !hasUserToInvite) {
        if (/^\d+$/.test(searchValue) && !isValidPhone) {
            return translate(preferredLocale, 'messages.errorMessageInvalidPhone');
        }
        if (/@/.test(searchValue) && !isValidEmail) {
            return translate(preferredLocale, 'messages.errorMessageInvalidEmail');
        }
        if (hasMatchedParticipant && (isValidEmail || isValidPhone)) {
            return '';
        }
        return translate(preferredLocale, 'common.noResultsFound');
    }

    return '';
}

/**
 * Helper method for non-user lists (eg. categories and tags) that returns the text to be used for the header's message and title (if any)
 */
function getHeaderMessageForNonUserList(hasSelectableOptions: boolean, searchValue: string): string {
    if (searchValue && !hasSelectableOptions) {
        return translate(preferredLocale, 'common.noResultsFound');
    }
    return '';
}

/**
 * Helper method to check whether an option can show tooltip or not
 */
function shouldOptionShowTooltip(option: OptionData): boolean {
    return !option.private_isArchived;
}

/**
 * Handles the logic for displaying selected participants from the search term
 */
function formatSectionsFromSearchTerm(
    searchTerm: string,
    selectedOptions: OptionData[],
    filteredRecentReports: OptionData[],
    filteredPersonalDetails: OptionData[],
    personalDetails: OnyxEntry<PersonalDetailsList> = {},
    shouldGetOptionDetails = false,
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
                          const isPolicyExpenseChat = participant.isPolicyExpenseChat ?? false;
                          return isPolicyExpenseChat ? getPolicyExpenseReportOption(participant) : getParticipantsOption(participant, personalDetails);
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
        const isPartOfSearchTerm = getPersonalDetailSearchTerms(participant).join(' ').toLowerCase().includes(cleanSearchTerm);
        const isReportInRecentReports = filteredRecentReports.some((report) => report.accountID === accountID);
        const isReportInPersonalDetails = filteredPersonalDetails.some((personalDetail) => personalDetail.accountID === accountID);
        return isPartOfSearchTerm && !isReportInRecentReports && !isReportInPersonalDetails;
    });

    return {
        section: {
            title: undefined,
            data: shouldGetOptionDetails
                ? selectedParticipantsWithoutDetails.map((participant) => {
                      const isPolicyExpenseChat = participant.isPolicyExpenseChat ?? false;
                      return isPolicyExpenseChat ? getPolicyExpenseReportOption(participant) : getParticipantsOption(participant, personalDetails);
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

function getPersonalDetailSearchTerms(item: Partial<OptionData>) {
    return [item.participantsList?.[0]?.displayName ?? '', item.login ?? '', item.login?.replace(CONST.EMAIL_SEARCH_REGEX, '') ?? ''];
}

function getCurrentUserSearchTerms(item: OptionData) {
    return [item.text ?? '', item.login ?? '', item.login?.replace(CONST.EMAIL_SEARCH_REGEX, '') ?? ''];
}

/**
 * Remove the personal details for the DMs that are already in the recent reports so that we don't show duplicates.
 */
function filteredPersonalDetailsOfRecentReports(recentReports: OptionData[], personalDetails: OptionData[]) {
    const excludedLogins = new Set(recentReports.map((report) => report.login));
    return personalDetails.filter((personalDetail) => !excludedLogins.has(personalDetail.login));
}

/**
 * Filters options based on the search input value
 */
function filterReports(reports: OptionData[], searchTerms: string[]): OptionData[] {
    // We search eventually for multiple whitespace separated search terms.
    // We start with the search term at the end, and then narrow down those filtered search results with the next search term.
    // We repeat (reduce) this until all search terms have been used:
    const filteredReports = searchTerms.reduceRight(
        (items, term) =>
            filterArrayByMatch(items, term, (item) => {
                const values: string[] = [];
                if (item.text) {
                    values.push(item.text);
                }

                if (item.login) {
                    values.push(item.login);
                    values.push(item.login.replace(CONST.EMAIL_SEARCH_REGEX, ''));
                }

                if (item.isThread) {
                    if (item.alternateText) {
                        values.push(item.alternateText);
                    }
                } else if (!!item.isChatRoom || !!item.isPolicyExpenseChat) {
                    if (item.subtitle) {
                        values.push(item.subtitle);
                    }
                }

                return uniqFast(values);
            }),
        // We start from all unfiltered reports:
        reports,
    );

    return filteredReports;
}

function filterPersonalDetails(personalDetails: OptionData[], searchTerms: string[]): OptionData[] {
    return searchTerms.reduceRight(
        (items, term) =>
            filterArrayByMatch(items, term, (item) => {
                const values = getPersonalDetailSearchTerms(item);
                return uniqFast(values);
            }),
        personalDetails,
    );
}

function filterCurrentUserOption(currentUserOption: OptionData | null | undefined, searchTerms: string[]): OptionData | null | undefined {
    return searchTerms.reduceRight((item, term) => {
        if (!item) {
            return null;
        }

        const currentUserOptionSearchText = uniqFast(getCurrentUserSearchTerms(item)).join(' ');
        return isSearchStringMatch(term, currentUserOptionSearchText) ? item : null;
    }, currentUserOption);
}

function filterUserToInvite(options: Omit<Options, 'userToInvite'>, searchValue: string, config?: FilterUserToInviteConfig): OptionData | null {
    const {canInviteUser = true, excludeLogins = []} = config ?? {};
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

    const optionsToExclude: Option[] = [{login: CONST.EMAIL.NOTIFICATIONS}];
    excludeLogins.forEach((login) => {
        optionsToExclude.push({login});
    });

    return getUserToInviteOption({
        searchValue,
        optionsToExclude,
        ...config,
    });
}

function filterOptions(options: Options, searchInputValue: string, config?: FilterUserToInviteConfig): Options {
    const parsedPhoneNumber = parsePhoneNumber(appendCountryCode(Str.removeSMSDomain(searchInputValue)));
    const searchValue = parsedPhoneNumber.possible && parsedPhoneNumber.number?.e164 ? parsedPhoneNumber.number.e164 : searchInputValue.toLowerCase();
    const searchTerms = searchValue ? searchValue.split(' ') : [];

    const recentReports = filterReports(options.recentReports, searchTerms);
    const personalDetails = filterPersonalDetails(options.personalDetails, searchTerms);
    const currentUserOption = filterCurrentUserOption(options.currentUserOption, searchTerms);
    const userToInvite = filterUserToInvite(
        {
            recentReports,
            personalDetails,
            currentUserOption,
        },
        searchValue,
        config,
    );

    return {
        personalDetails,
        recentReports,
        userToInvite,
        currentUserOption,
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
function filterAndOrderOptions(options: Options, searchInputValue: string, config: FilterAndOrderConfig = {}): Options {
    let filterResult = options;
    if (searchInputValue.trim().length > 0) {
        filterResult = filterOptions(options, searchInputValue, config);
    }

    const orderedOptions = combineOrderingOfReportsAndPersonalDetails(filterResult, searchInputValue, config);

    // on staging server, in specific cases (see issue) BE returns duplicated personalDetails entries
    orderedOptions.personalDetails = orderedOptions.personalDetails.filter((detail, index, array) => array.findIndex((i) => i.login === detail.login) === index);

    return {
        ...filterResult,
        ...orderedOptions,
    };
}

function sortAlphabetically<T extends Partial<Record<TKey, string | undefined>>, TKey extends keyof T>(items: T[], key: TKey): T[] {
    return items.sort((a, b) => (a[key] ?? '').toLowerCase().localeCompare((b[key] ?? '').toLowerCase()));
}

function getEmptyOptions(): Options {
    return {
        recentReports: [],
        personalDetails: [],
        userToInvite: null,
        currentUserOption: null,
    };
}

function shouldUseBoldText(report: OptionData): boolean {
    const notificationPreference = report.notificationPreference ?? getReportNotificationPreference(report);
    return report.isUnread === true && notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE && !isHiddenForCurrentUser(notificationPreference);
}

export {
    getAvatarsForAccountIDs,
    isCurrentUser,
    isPersonalDetailsReady,
    getValidOptions,
    getSearchOptions,
    getShareDestinationOptions,
    getMemberInviteOptions,
    getHeaderMessage,
    getHeaderMessageForNonUserList,
    getSearchValueForPhoneOrEmail,
    getPersonalDetailsForAccountIDs,
    getIOUConfirmationOptionsFromPayeePersonalDetail,
    isSearchStringMatchUserDetails,
    getPolicyExpenseReportOption,
    getIOUReportIDOfLastAction,
    getParticipantsOption,
    isSearchStringMatch,
    shouldOptionShowTooltip,
    getLastActorDisplayName,
    getLastMessageTextForReport,
    getEnabledCategoriesCount,
    hasEnabledOptions,
    sortAlphabetically,
    formatMemberForList,
    formatSectionsFromSearchTerm,
    getShareLogOptions,
    orderOptions,
    filterUserToInvite,
    filterOptions,
    filteredPersonalDetailsOfRecentReports,
    orderReportOptions,
    orderReportOptionsWithSearch,
    orderPersonalDetailsOptions,
    filterAndOrderOptions,
    createOptionList,
    createOptionFromReport,
    getReportOption,
    getFirstKeyForList,
    canCreateOptimisticPersonalDetailOption,
    getUserToInviteOption,
    getPersonalDetailSearchTerms,
    getCurrentUserSearchTerms,
    getEmptyOptions,
    shouldUseBoldText,
    getAttendeeOptions,
    getAlternateText,
    hasReportErrors,
    combineOrderingOfReportsAndPersonalDetails,
};

export type {Section, SectionBase, MemberForList, Options, OptionList, SearchOption, PayeePersonalDetails, Option, OptionTree, ReportAndPersonalDetailOptions, GetUserToInviteConfig};
