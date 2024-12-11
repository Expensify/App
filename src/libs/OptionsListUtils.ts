/* eslint-disable no-continue */
import {Str} from 'expensify-common';
import lodashOrderBy from 'lodash/orderBy';
import lodashSortBy from 'lodash/sortBy';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {SetNonNullable} from 'type-fest';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import type {IOUAction} from '@src/CONST';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
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
import * as LocalePhoneNumber from './LocalePhoneNumber';
import * as Localize from './Localize';
import * as LoginUtils from './LoginUtils';
import ModifiedExpenseMessage from './ModifiedExpenseMessage';
import Navigation from './Navigation/Navigation';
import Parser from './Parser';
import Performance from './Performance';
import * as PersonalDetailsUtils from './PersonalDetailsUtils';
import * as PhoneNumber from './PhoneNumber';
import * as PolicyUtils from './PolicyUtils';
import * as ReportActionUtils from './ReportActionsUtils';
import * as ReportUtils from './ReportUtils';
import * as TaskUtils from './TaskUtils';
import * as UserUtils from './UserUtils';

type SearchOption<T> = ReportUtils.OptionData & {
    item: T;
};

type OptionList = {
    reports: Array<SearchOption<Report>>;
    personalDetails: Array<SearchOption<PersonalDetails>>;
};

type Option = Partial<ReportUtils.OptionData>;

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
    maxRecentReportsToShow?: number;
    excludeLogins?: string[];
    includeMultipleParticipantReports?: boolean;
    includeRecentReports?: boolean;
    includeSelfDM?: boolean;
    showChatPreviewLine?: boolean;
    sortPersonalDetailsByAlphaAsc?: boolean;
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
    shouldAcceptName?: boolean;
    recentAttendees?: Attendee[];
    shouldBoldTitleByDefault?: boolean;
};

type GetUserToInviteConfig = {
    searchValue: string;
    excludeUnknownUsers?: boolean;
    optionsToExclude?: Array<Partial<ReportUtils.OptionData>>;
    selectedOptions?: Array<Partial<ReportUtils.OptionData>>;
    reportActions?: ReportActions;
    showChatPreviewLine?: boolean;
    shouldAcceptName?: boolean;
};

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
    recentReports: ReportUtils.OptionData[];
    personalDetails: ReportUtils.OptionData[];
    userToInvite: ReportUtils.OptionData | null;
    currentUserOption: ReportUtils.OptionData | null | undefined;
};

type PreviewConfig = {showChatPreviewLine?: boolean; forcePolicyNamePreview?: boolean; showPersonalDetails?: boolean};

type FilterOptionsConfig = Pick<GetOptionsConfig, 'selectedOptions' | 'excludeLogins' | 'maxRecentReportsToShow' | 'shouldAcceptName'> & {
    preferChatroomsOverThreads?: boolean;
    preferPolicyExpenseChat?: boolean;
    preferRecentExpenseReports?: boolean;
    /* When sortByReportTypeInSearch flag is true, recentReports will include the personalDetails options as well. */
    sortByReportTypeInSearch?: boolean;
    reportActions?: ReportActions;
    excludeUnknownUsers?: boolean;
    canInviteUser?: boolean;
};

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
            let sortedReportActions = ReportActionUtils.getSortedReportActions(reportActionsArray, true);
            allSortedReportActions[reportID] = sortedReportActions;

            // If the report is a one-transaction report and has , we need to return the combined reportActions so that the LHN can display modifications
            // to the transaction thread or the report itself
            const transactionThreadReportID = ReportActionUtils.getOneTransactionThreadReportID(reportID, actions[reportActions[0]]);
            if (transactionThreadReportID) {
                const transactionThreadReportActionsArray = Object.values(actions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`] ?? {});
                sortedReportActions = ReportActionUtils.getCombinedReportActions(sortedReportActions, transactionThreadReportID, transactionThreadReportActionsArray, reportID, false);
            }

            const firstReportAction = sortedReportActions.at(0);
            if (!firstReportAction) {
                delete lastReportActions[reportID];
            } else {
                lastReportActions[reportID] = firstReportAction;
            }

            const report = ReportUtils.getReport(reportID);
            const canUserPerformWriteAction = ReportUtils.canUserPerformWriteAction(report);

            // The report is only visible if it is the last action not deleted that
            // does not match a closed or created state.
            const reportActionsForDisplay = sortedReportActions.filter(
                (reportAction, actionKey) =>
                    ReportActionUtils.shouldReportActionBeVisible(reportAction, actionKey, canUserPerformWriteAction) &&
                    !ReportActionUtils.isWhisperAction(reportAction) &&
                    reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED &&
                    reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
                    !ReportActionUtils.isResolvedActionTrackExpense(reportAction),
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
function getParticipantsOption(participant: ReportUtils.OptionData | Participant, personalDetails: OnyxEntry<PersonalDetailsList>): Participant {
    const detail = getPersonalDetailsForAccountIDs([participant.accountID ?? -1], personalDetails)[participant.accountID ?? -1];
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const login = detail?.login || participant.login || '';
    const displayName = PersonalDetailsUtils.getDisplayNameOrDefault(detail, LocalePhoneNumber.formatPhoneNumber(login) || participant.text);

    return {
        keyForList: String(detail?.accountID),
        login,
        accountID: detail?.accountID ?? -1,
        text: displayName,
        firstName: detail?.firstName ?? '',
        lastName: detail?.lastName ?? '',
        alternateText: LocalePhoneNumber.formatPhoneNumber(login) || displayName,
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
          lastActorDetails.firstName || PersonalDetailsUtils.getDisplayNameOrDefault(lastActorDetails)
        : '';
}

/**
 * Update alternate text for the option when applicable
 */
function getAlternateText(option: ReportUtils.OptionData, {showChatPreviewLine = false, forcePolicyNamePreview = false}: PreviewConfig) {
    const report = ReportUtils.getReportOrDraftReport(option.reportID);
    const isAdminRoom = ReportUtils.isAdminRoom(report);
    const isAnnounceRoom = ReportUtils.isAnnounceRoom(report);
    const isGroupChat = ReportUtils.isGroupChat(report);
    const isExpenseThread = ReportUtils.isMoneyRequest(report);
    const formattedLastMessageText = ReportUtils.formatReportLastMessageText(Parser.htmlToText(option.lastMessageText ?? ''));

    if (isExpenseThread || option.isMoneyRequestReport) {
        return showChatPreviewLine && formattedLastMessageText ? formattedLastMessageText : Localize.translate(preferredLocale, 'iou.expense');
    }

    if (option.isThread) {
        return showChatPreviewLine && formattedLastMessageText ? formattedLastMessageText : Localize.translate(preferredLocale, 'threads.thread');
    }

    if (option.isChatRoom && !isAdminRoom && !isAnnounceRoom) {
        return showChatPreviewLine && formattedLastMessageText ? formattedLastMessageText : option.subtitle;
    }

    if ((option.isPolicyExpenseChat ?? false) || isAdminRoom || isAnnounceRoom) {
        return showChatPreviewLine && !forcePolicyNamePreview && formattedLastMessageText ? formattedLastMessageText : option.subtitle;
    }

    if (option.isTaskReport) {
        return showChatPreviewLine && formattedLastMessageText ? formattedLastMessageText : Localize.translate(preferredLocale, 'task.task');
    }

    if (isGroupChat) {
        return showChatPreviewLine && formattedLastMessageText ? formattedLastMessageText : Localize.translate(preferredLocale, 'common.group');
    }

    return showChatPreviewLine && formattedLastMessageText
        ? formattedLastMessageText
        : LocalePhoneNumber.formatPhoneNumber(option.participantsList && option.participantsList.length > 0 ? option.participantsList.at(0)?.login ?? '' : '');
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
        memberDetails += ` ${PersonalDetailsUtils.getDisplayNameOrDefault(personalDetail)}`;
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
    if (!ReportActionUtils.isReportPreviewAction(lastAction)) {
        return;
    }
    return ReportUtils.getReportOrDraftReport(ReportActionUtils.getIOUReportIDFromReportActionPreview(lastAction))?.reportID;
}

/**
 * Get the last message text from the report directly or from other sources for special cases.
 */
function getLastMessageTextForReport(report: OnyxEntry<Report>, lastActorDetails: Partial<PersonalDetails> | null, policy?: OnyxEntry<Policy>): string {
    const reportID = report?.reportID ?? '-1';
    const lastReportAction = lastVisibleReportActions[reportID] ?? null;

    // some types of actions are filtered out for lastReportAction, in some cases we need to check the actual last action
    const lastOriginalReportAction = lastReportActions[reportID] ?? null;
    let lastMessageTextFromReport = '';

    if (report?.private_isArchived) {
        const archiveReason =
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            (ReportActionUtils.isClosedAction(lastOriginalReportAction) && ReportActionUtils.getOriginalMessage(lastOriginalReportAction)?.reason) || CONST.REPORT.ARCHIVE_REASON.DEFAULT;
        switch (archiveReason) {
            case CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED:
            case CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY:
            case CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED: {
                lastMessageTextFromReport = Localize.translate(preferredLocale, `reportArchiveReasons.${archiveReason}`, {
                    displayName: PersonalDetailsUtils.getDisplayNameOrDefault(lastActorDetails),
                    policyName: ReportUtils.getPolicyName(report, false, policy),
                });
                break;
            }
            case CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED: {
                lastMessageTextFromReport = Localize.translate(preferredLocale, `reportArchiveReasons.${archiveReason}`);
                break;
            }
            default: {
                lastMessageTextFromReport = Localize.translate(preferredLocale, `reportArchiveReasons.default`);
            }
        }
    } else if (ReportActionUtils.isMoneyRequestAction(lastReportAction)) {
        const properSchemaForMoneyRequestMessage = ReportUtils.getReportPreviewMessage(report, lastReportAction, true, false, null, true);
        lastMessageTextFromReport = ReportUtils.formatReportLastMessageText(properSchemaForMoneyRequestMessage);
    } else if (ReportActionUtils.isReportPreviewAction(lastReportAction)) {
        const iouReport = ReportUtils.getReportOrDraftReport(ReportActionUtils.getIOUReportIDFromReportActionPreview(lastReportAction));
        const lastIOUMoneyReportAction = allSortedReportActions[iouReport?.reportID ?? '-1']?.find(
            (reportAction, key): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                ReportActionUtils.shouldReportActionBeVisible(reportAction, key, ReportUtils.canUserPerformWriteAction(report)) &&
                reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
                ReportActionUtils.isMoneyRequestAction(reportAction),
        );
        const reportPreviewMessage = ReportUtils.getReportPreviewMessage(
            !isEmptyObject(iouReport) ? iouReport : null,
            lastIOUMoneyReportAction,
            true,
            ReportUtils.isChatReport(report),
            null,
            true,
            lastReportAction,
        );
        lastMessageTextFromReport = ReportUtils.formatReportLastMessageText(reportPreviewMessage);
    } else if (ReportActionUtils.isReimbursementQueuedAction(lastReportAction)) {
        lastMessageTextFromReport = ReportUtils.getReimbursementQueuedActionMessage(lastReportAction, report);
    } else if (ReportActionUtils.isReimbursementDeQueuedAction(lastReportAction)) {
        lastMessageTextFromReport = ReportUtils.getReimbursementDeQueuedActionMessage(lastReportAction, report, true);
    } else if (ReportActionUtils.isDeletedParentAction(lastReportAction) && ReportUtils.isChatReport(report)) {
        lastMessageTextFromReport = ReportUtils.getDeletedParentActionMessageForChatReport(lastReportAction);
    } else if (ReportActionUtils.isPendingRemove(lastReportAction) && ReportActionUtils.isThreadParentMessage(lastReportAction, report?.reportID ?? '-1')) {
        lastMessageTextFromReport = Localize.translateLocal('parentReportAction.hiddenMessage');
    } else if (ReportUtils.isReportMessageAttachment({text: report?.lastMessageText ?? '-1', html: report?.lastMessageHtml, translationKey: report?.lastMessageTranslationKey, type: ''})) {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        lastMessageTextFromReport = `[${Localize.translateLocal((report?.lastMessageTranslationKey || 'common.attachment') as TranslationPaths)}]`;
    } else if (ReportActionUtils.isModifiedExpenseAction(lastReportAction)) {
        const properSchemaForModifiedExpenseMessage = ModifiedExpenseMessage.getForReportAction(report?.reportID, lastReportAction);
        lastMessageTextFromReport = ReportUtils.formatReportLastMessageText(properSchemaForModifiedExpenseMessage, true);
    } else if (ReportActionUtils.isTaskAction(lastReportAction)) {
        lastMessageTextFromReport = ReportUtils.formatReportLastMessageText(TaskUtils.getTaskReportActionMessage(lastReportAction).text);
    } else if (ReportActionUtils.isCreatedTaskReportAction(lastReportAction)) {
        lastMessageTextFromReport = TaskUtils.getTaskCreatedMessage(lastReportAction);
    } else if (
        ReportActionUtils.isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.SUBMITTED) ||
        ReportActionUtils.isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED)
    ) {
        const wasSubmittedViaHarvesting = ReportActionUtils.getOriginalMessage(lastReportAction)?.harvesting ?? false;
        if (wasSubmittedViaHarvesting) {
            lastMessageTextFromReport = ReportUtils.getReportAutomaticallySubmittedMessage(lastReportAction);
        } else {
            lastMessageTextFromReport = ReportUtils.getIOUSubmittedMessage(lastReportAction);
        }
    } else if (ReportActionUtils.isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.APPROVED)) {
        const {automaticAction} = ReportActionUtils.getOriginalMessage(lastReportAction) ?? {};
        if (automaticAction) {
            lastMessageTextFromReport = ReportUtils.getReportAutomaticallyApprovedMessage(lastReportAction);
        } else {
            lastMessageTextFromReport = ReportUtils.getIOUApprovedMessage(lastReportAction);
        }
    } else if (ReportActionUtils.isUnapprovedAction(lastReportAction)) {
        lastMessageTextFromReport = ReportUtils.getIOUUnapprovedMessage(lastReportAction);
    } else if (ReportActionUtils.isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.FORWARDED)) {
        const {automaticAction} = ReportActionUtils.getOriginalMessage(lastReportAction) ?? {};
        if (automaticAction) {
            lastMessageTextFromReport = ReportUtils.getReportAutomaticallyForwardedMessage(lastReportAction, reportID);
        } else {
            lastMessageTextFromReport = ReportUtils.getIOUForwardedMessage(lastReportAction, report);
        }
    } else if (lastReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REJECTED) {
        lastMessageTextFromReport = ReportUtils.getRejectedReportMessage();
    } else if (ReportActionUtils.isActionableAddPaymentCard(lastReportAction)) {
        lastMessageTextFromReport = ReportActionUtils.getReportActionMessageText(lastReportAction);
    } else if (lastReportAction?.actionName === 'EXPORTINTEGRATION') {
        lastMessageTextFromReport = ReportActionUtils.getExportIntegrationLastMessageText(lastReportAction);
    } else if (lastReportAction?.actionName && ReportActionUtils.isOldDotReportAction(lastReportAction)) {
        lastMessageTextFromReport = ReportActionUtils.getMessageOfOldDotReportAction(lastReportAction, false);
    }

    return lastMessageTextFromReport || (report?.lastMessageText ?? '');
}

function hasReportErrors(report: Report, reportActions: OnyxEntry<ReportActions>) {
    return !isEmptyObject(ReportUtils.getAllReportErrors(report, reportActions));
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
): ReportUtils.OptionData {
    const {showChatPreviewLine = false, forcePolicyNamePreview = false, showPersonalDetails = false} = config ?? {};
    const result: ReportUtils.OptionData = {
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
        result.isChatRoom = ReportUtils.isChatRoom(report);
        result.isDefaultRoom = ReportUtils.isDefaultRoom(report);
        // eslint-disable-next-line @typescript-eslint/naming-convention
        result.private_isArchived = report.private_isArchived;
        result.isExpenseReport = ReportUtils.isExpenseReport(report);
        result.isInvoiceRoom = ReportUtils.isInvoiceRoom(report);
        result.isMoneyRequestReport = ReportUtils.isMoneyRequestReport(report);
        result.isThread = ReportUtils.isChatThread(report);
        result.isTaskReport = ReportUtils.isTaskReport(report);
        result.shouldShowSubscript = ReportUtils.shouldReportShowSubscript(report);
        result.isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(report);
        result.isOwnPolicyExpenseChat = report.isOwnPolicyExpenseChat ?? false;
        result.allReportErrors = ReportUtils.getAllReportErrors(report, reportActions);
        result.brickRoadIndicator = hasReportErrors(report, reportActions) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
        result.pendingAction = report.pendingFields ? report.pendingFields.addWorkspaceRoom ?? report.pendingFields.createChat : undefined;
        result.ownerAccountID = report.ownerAccountID;
        result.reportID = report.reportID;
        result.isUnread = ReportUtils.isUnread(report);
        result.isPinned = report.isPinned;
        result.iouReportID = report.iouReportID;
        result.keyForList = String(report.reportID);
        result.isWaitingOnBankAccount = report.isWaitingOnBankAccount;
        result.policyID = report.policyID;
        result.isSelfDM = ReportUtils.isSelfDM(report);
        result.notificationPreference = ReportUtils.getReportNotificationPreference(report);

        const visibleParticipantAccountIDs = ReportUtils.getParticipantsAccountIDsForDisplay(report, true);

        result.tooltipText = ReportUtils.getReportParticipantsTitle(visibleParticipantAccountIDs);

        hasMultipleParticipants = personalDetailList.length > 1 || result.isChatRoom || result.isPolicyExpenseChat || ReportUtils.isGroupChat(report);
        subtitle = ReportUtils.getChatRoomSubtitle(report);

        const lastActorDetails = personalDetailMap[report.lastActorAccountID ?? -1] ?? null;
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

        reportName = showPersonalDetails
            ? ReportUtils.getDisplayNameForParticipant(accountIDs.at(0)) || LocalePhoneNumber.formatPhoneNumber(personalDetail?.login ?? '')
            : ReportUtils.getReportName(report);
    } else {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        reportName = ReportUtils.getDisplayNameForParticipant(accountIDs.at(0)) || LocalePhoneNumber.formatPhoneNumber(personalDetail?.login ?? '');
        result.keyForList = String(accountIDs.at(0));

        result.alternateText = LocalePhoneNumber.formatPhoneNumber(personalDetails?.[accountIDs[0]]?.login ?? '');
    }

    result.isIOUReportOwner = ReportUtils.isIOUOwnedByCurrentUser(result);
    result.iouReportAmount = ReportUtils.getMoneyRequestSpendBreakdown(result).totalDisplaySpend;

    if (!hasMultipleParticipants && (!report || (report && !ReportUtils.isGroupChat(report) && !ReportUtils.isChatRoom(report)))) {
        result.login = personalDetail?.login;
        result.accountID = Number(personalDetail?.accountID);
        result.phoneNumber = personalDetail?.phoneNumber;
    }

    result.text = reportName;
    result.icons = ReportUtils.getIcons(report, personalDetails, personalDetail?.avatar, personalDetail?.login, personalDetail?.accountID, null);
    result.subtitle = subtitle;

    return result;
}

/**
 * Get the option for a given report.
 */
function getReportOption(participant: Participant): ReportUtils.OptionData {
    const report = ReportUtils.getReportOrDraftReport(participant.reportID);
    const visibleParticipantAccountIDs = ReportUtils.getParticipantsAccountIDsForDisplay(report, true);

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
        option.alternateText = Localize.translateLocal('reportActionsView.yourSpace');
    } else if (option.isInvoiceRoom) {
        option.text = ReportUtils.getReportName(report);
        option.alternateText = Localize.translateLocal('workspace.common.invoices');
    } else {
        option.text = ReportUtils.getPolicyName(report);
        option.alternateText = Localize.translateLocal('workspace.common.workspace');
    }
    option.isDisabled = ReportUtils.isDraftReport(participant.reportID);
    option.selected = participant.selected;
    option.isSelected = participant.selected;
    return option;
}

/**
 * Get the option for a policy expense report.
 */
function getPolicyExpenseReportOption(participant: Participant | ReportUtils.OptionData): ReportUtils.OptionData {
    const expenseReport = ReportUtils.isPolicyExpenseChat(participant) ? ReportUtils.getReportOrDraftReport(participant.reportID) : null;

    const visibleParticipantAccountIDs = Object.entries(expenseReport?.participants ?? {})
        .filter(([, reportParticipant]) => reportParticipant && reportParticipant.notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN)
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
    option.text = ReportUtils.getPolicyName(expenseReport);
    option.alternateText = Localize.translateLocal('workspace.common.workspace');
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
    const userDetailsLogin = PhoneNumber.addSMSDomainIfPhoneNumber(userDetails.login ?? '');

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
    const parsedPhoneNumber = PhoneNumber.parsePhoneNumber(LoginUtils.appendCountryCode(Str.removeSMSDomain(searchTerm)));
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
function isReportSelected(reportOption: ReportUtils.OptionData, selectedOptions: Array<Partial<ReportUtils.OptionData>>) {
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

            const isOneOnOneChat = ReportUtils.isOneOnOneChat(report);
            const accountIDs = ReportUtils.getParticipantsAccountIDsForDisplay(report);

            const isChatRoom = ReportUtils.isChatRoom(report);
            if ((!accountIDs || accountIDs.length === 0) && !isChatRoom) {
                return;
            }

            // Save the report in the map if this is a single participant so we can associate the reportID with the
            // personal detail option later. Individuals should not be associated with single participant
            // policyExpenseChats or chatRooms since those are not people.
            if (accountIDs.length <= 1 && isOneOnOneChat) {
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
        ...createOption([personalDetail?.accountID ?? -1], personalDetails, reportMapForAccountIDs[personalDetail?.accountID ?? -1], {}, {showPersonalDetails: true}),
    }));

    return {
        reports: allReportOptions,
        personalDetails: allPersonalDetailsOptions as Array<SearchOption<PersonalDetails>>,
    };
}

function createOptionFromReport(report: Report, personalDetails: OnyxEntry<PersonalDetailsList>) {
    const accountIDs = ReportUtils.getParticipantsAccountIDsForDisplay(report);

    return {
        item: report,
        ...createOption(accountIDs, personalDetails, report, {}),
    };
}

/**
 * Options need to be sorted in the specific order
 * @param options - list of options to be sorted
 * @param searchValue - search string
 * @returns a sorted list of options
 */
function orderOptions(
    options: ReportUtils.OptionData[],
    searchValue: string | undefined,
    {preferChatroomsOverThreads = false, preferPolicyExpenseChat = false, preferRecentExpenseReports = false} = {},
) {
    return lodashOrderBy(
        options,
        [
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

function canCreateOptimisticPersonalDetailOption({
    recentReportOptions,
    personalDetailsOptions,
    currentUserOption,
}: {
    recentReportOptions: ReportUtils.OptionData[];
    personalDetailsOptions: ReportUtils.OptionData[];
    currentUserOption?: ReportUtils.OptionData | null;
    excludeUnknownUsers: boolean;
}) {
    return recentReportOptions.length + personalDetailsOptions.length === 0 && !currentUserOption;
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
    excludeUnknownUsers = false,
    optionsToExclude = [],
    selectedOptions = [],
    reportActions = {},
    showChatPreviewLine = false,
    shouldAcceptName = false,
}: GetUserToInviteConfig): ReportUtils.OptionData | null {
    const parsedPhoneNumber = PhoneNumber.parsePhoneNumber(LoginUtils.appendCountryCode(Str.removeSMSDomain(searchValue)));
    const isCurrentUserLogin = isCurrentUser({login: searchValue} as PersonalDetails);
    const isInSelectedOption = selectedOptions.some((option) => 'login' in option && option.login === searchValue);
    const isValidEmail = Str.isValidEmail(searchValue) && !Str.isDomainEmail(searchValue) && !Str.endsWith(searchValue, CONST.SMS.DOMAIN);
    const isValidPhoneNumber = parsedPhoneNumber.possible && Str.isValidE164Phone(LoginUtils.getPhoneNumberWithoutSpecialChars(parsedPhoneNumber.number?.input ?? ''));
    const isInOptionToExclude =
        optionsToExclude.findIndex((optionToExclude) => 'login' in optionToExclude && optionToExclude.login === PhoneNumber.addSMSDomainIfPhoneNumber(searchValue).toLowerCase()) !== -1;

    if (!searchValue || isCurrentUserLogin || isInSelectedOption || (!isValidEmail && !isValidPhoneNumber && !shouldAcceptName) || isInOptionToExclude || excludeUnknownUsers) {
        return null;
    }

    // Generates an optimistic account ID for new users not yet saved in Onyx
    const optimisticAccountID = UserUtils.generateAccountID(searchValue);
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
 * filter options based on specific conditions
 */
function getOptions(
    options: OptionList,
    {
        betas = [],
        selectedOptions = [],
        maxRecentReportsToShow = 0,
        excludeLogins = [],
        includeMultipleParticipantReports = false,
        includeRecentReports = true,
        showChatPreviewLine = false,
        sortPersonalDetailsByAlphaAsc = true,
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
    const topmostReportId = Navigation.getTopmostReportId() ?? '-1';

    // Filter out all the reports that shouldn't be displayed
    const filteredReportOptions = options.reports.filter((option) => {
        const report = option.item;
        const doesReportHaveViolations = ReportUtils.shouldDisplayViolationsRBRInLHN(report, transactionViolations);

        return ReportUtils.shouldReportBeInOptionList({
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

    // Sorting the reports works like this:
    // - Order everything by the last message timestamp (descending)
    // - When searching, self DM is put at the top
    // - All archived reports should remain at the bottom
    const orderedReportOptions = lodashSortBy(filteredReportOptions, (option) => {
        const report = option.item;
        if (option.private_isArchived) {
            return CONST.DATE.UNIX_EPOCH;
        }

        return report?.lastVisibleActionCreated;
    });
    orderedReportOptions.reverse();

    const allReportOptions = orderedReportOptions.filter((option) => {
        const report = option.item;

        if (!report) {
            return;
        }

        const isThread = option.isThread;
        const isTaskReport = option.isTaskReport;
        const isPolicyExpenseChat = option.isPolicyExpenseChat;
        const isMoneyRequestReport = option.isMoneyRequestReport;
        const isSelfDM = option.isSelfDM;
        const isChatRoom = option.isChatRoom;
        const accountIDs = ReportUtils.getParticipantsAccountIDsForDisplay(report);

        if (isPolicyExpenseChat && report.isOwnPolicyExpenseChat && !includeOwnedWorkspaceChats) {
            return;
        }

        // When passing includeP2P false we are trying to hide features from users that are not ready for P2P and limited to workspace chats only.
        if (!includeP2P && !isPolicyExpenseChat) {
            return;
        }

        if (isSelfDM && !includeSelfDM) {
            return;
        }

        if (isThread && !includeThreads) {
            return;
        }

        if (isTaskReport && !includeTasks) {
            return;
        }

        if (isMoneyRequestReport && !includeMoneyRequests) {
            return;
        }

        // In case user needs to add credit bank account, don't allow them to submit an expense from the workspace.
        if (includeOwnedWorkspaceChats && ReportUtils.hasIOUWaitingOnCurrentUserBankAccount(report)) {
            return;
        }

        if ((!accountIDs || accountIDs.length === 0) && !isChatRoom) {
            return;
        }

        return option;
    });

    const havingLoginPersonalDetails = includeP2P
        ? options.personalDetails.filter((detail) => !!detail?.login && !!detail.accountID && !detail?.isOptimisticPersonalDetail && (includeDomainEmail || !Str.isDomainEmail(detail.login)))
        : [];
    let allPersonalDetailsOptions = havingLoginPersonalDetails;

    if (sortPersonalDetailsByAlphaAsc) {
        // PersonalDetails should be ordered Alphabetically by default - https://github.com/Expensify/App/issues/8220#issuecomment-1104009435
        allPersonalDetailsOptions = lodashOrderBy(allPersonalDetailsOptions, [(personalDetail) => personalDetail.text?.toLowerCase()], 'asc');
    }

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

    let recentReportOptions: ReportUtils.OptionData[] = [];
    const personalDetailsOptions: ReportUtils.OptionData[] = [];

    const preferRecentExpenseReports = action === CONST.IOU.ACTION.CREATE;

    if (includeRecentReports) {
        for (const reportOption of allReportOptions) {
            /**
             * By default, generated options does not have the chat preview line enabled.
             * If showChatPreviewLine or forcePolicyNamePreview are true, let's generate and overwrite the alternate text.
             */
            reportOption.alternateText = getAlternateText(reportOption, {showChatPreviewLine, forcePolicyNamePreview});

            // Stop adding options to the recentReports array when we reach the maxRecentReportsToShow value
            if (recentReportOptions.length > 0 && recentReportOptions.length === maxRecentReportsToShow) {
                break;
            }

            // Skip notifications@expensify.com
            if (reportOption.login === CONST.EMAIL.NOTIFICATIONS) {
                continue;
            }

            const isCurrentUserOwnedPolicyExpenseChatThatCouldShow =
                reportOption.isPolicyExpenseChat && reportOption.ownerAccountID === currentUserAccountID && includeOwnedWorkspaceChats && !reportOption.private_isArchived;

            const shouldShowInvoiceRoom =
                includeInvoiceRooms &&
                ReportUtils.isInvoiceRoom(reportOption.item) &&
                ReportUtils.isPolicyAdmin(reportOption.policyID ?? '', policies) &&
                !reportOption.private_isArchived &&
                PolicyUtils.canSendInvoiceFromWorkspace(reportOption.policyID);

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

            reportOption.isSelected = isReportSelected(reportOption, selectedOptions);
            reportOption.isBold = shouldBoldTitleByDefault || shouldUseBoldText(reportOption);

            if (action === CONST.IOU.ACTION.CATEGORIZE) {
                const reportPolicy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${reportOption.policyID}`];
                if (reportPolicy?.areCategoriesEnabled) {
                    recentReportOptions.push(reportOption);
                }
            } else {
                recentReportOptions.push(reportOption);
            }

            // Add a field to sort the recent reports by the time of last IOU request for create actions
            if (preferRecentExpenseReports) {
                const reportPreviewAction = allSortedReportActions[reportOption.reportID]?.find((reportAction) =>
                    ReportActionUtils.isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW),
                );

                if (reportPreviewAction) {
                    const iouReportID = ReportActionUtils.getIOUReportIDFromReportActionPreview(reportPreviewAction);
                    const iouReportActions = allSortedReportActions[iouReportID] ?? [];
                    const lastIOUAction = iouReportActions.find((iouAction) => iouAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU);
                    if (lastIOUAction) {
                        reportOption.lastIOUCreationDate = lastIOUAction.lastModified;
                    }
                }
            }
        }
    } else if (recentAttendees && recentAttendees?.length > 0) {
        recentAttendees.filter((attendee) => attendee.login ?? attendee.displayName).forEach((a) => optionsToExclude.push({login: a.login ?? a.displayName}));
        recentReportOptions = recentAttendees as ReportUtils.OptionData[];
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
    const optionList = getOptions(options, {
        betas,
        includeMultipleParticipantReports: true,
        maxRecentReportsToShow: 0, // Unlimited
        showChatPreviewLine: isUsedInChatFinder,
        includeP2P: true,
        forcePolicyNamePreview: true,
        includeOwnedWorkspaceChats: true,
        includeThreads: true,
        includeMoneyRequests: true,
        includeTasks: true,
        includeSelfDM: true,
        shouldBoldTitleByDefault: !isUsedInChatFinder,
    });
    Timing.end(CONST.TIMING.LOAD_SEARCH_OPTIONS);
    Performance.markEnd(CONST.TIMING.LOAD_SEARCH_OPTIONS);

    return optionList;
}

function getShareLogOptions(options: OptionList, betas: Beta[] = []): Options {
    return getOptions(options, {
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
    const formattedLogin = LocalePhoneNumber.formatPhoneNumber(personalDetail?.login ?? '');
    return {
        text: PersonalDetailsUtils.getDisplayNameOrDefault(personalDetail, formattedLogin),
        alternateText: formattedLogin || PersonalDetailsUtils.getDisplayNameOrDefault(personalDetail, '', false),
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
        accountID: personalDetail?.accountID ?? -1,
        keyForList: String(personalDetail?.accountID ?? -1),
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
    return getOptions(
        {reports, personalDetails},
        {
            betas,
            selectedOptions: attendees,
            excludeLogins: CONST.EXPENSIFY_EMAILS,
            includeOwnedWorkspaceChats,
            includeRecentReports: false,
            includeP2P,
            includeSelectedOptions: false,
            maxRecentReportsToShow: 0,
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
    selectedOptions: Array<Partial<ReportUtils.OptionData>> = [],
    excludeLogins: string[] = [],
    includeOwnedWorkspaceChats = true,
) {
    return getOptions(
        {reports, personalDetails},
        {
            betas,
            selectedOptions,
            maxRecentReportsToShow: 0, // Unlimited
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
function formatMemberForList(member: ReportUtils.OptionData): MemberForList {
    const accountID = member.accountID;

    return {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        text: member.text || member.displayName || '',
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        alternateText: member.alternateText || member.login || '',
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        keyForList: member.keyForList || String(accountID ?? -1) || '',
        isSelected: member.isSelected ?? false,
        isDisabled: member.isDisabled ?? false,
        accountID,
        login: member.login ?? '',
        icons: member.icons,
        pendingAction: member.pendingAction,
        reportID: member.reportID ?? '-1',
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
    return getOptions(
        {reports, personalDetails},
        {
            betas,
            includeP2P: true,
            excludeLogins,
            sortPersonalDetailsByAlphaAsc: true,
            includeSelectedOptions,
            includeRecentReports,
        },
    );
}

/**
 * Helper method that returns the text to be used for the header's message and title (if any)
 */
function getHeaderMessage(hasSelectableOptions: boolean, hasUserToInvite: boolean, searchValue: string, hasMatchedParticipant = false): string {
    const isValidPhone = PhoneNumber.parsePhoneNumber(LoginUtils.appendCountryCode(searchValue)).possible;

    const isValidEmail = Str.isValidEmail(searchValue);

    if (searchValue && CONST.REGEX.DIGITS_AND_PLUS.test(searchValue) && !isValidPhone && !hasSelectableOptions) {
        return Localize.translate(preferredLocale, 'messages.errorMessageInvalidPhone');
    }

    // Without a search value, it would be very confusing to see a search validation message.
    // Therefore, this skips the validation when there is no search value.
    if (searchValue && !hasSelectableOptions && !hasUserToInvite) {
        if (/^\d+$/.test(searchValue) && !isValidPhone) {
            return Localize.translate(preferredLocale, 'messages.errorMessageInvalidPhone');
        }
        if (/@/.test(searchValue) && !isValidEmail) {
            return Localize.translate(preferredLocale, 'messages.errorMessageInvalidEmail');
        }
        if (hasMatchedParticipant && (isValidEmail || isValidPhone)) {
            return '';
        }
        return Localize.translate(preferredLocale, 'common.noResultsFound');
    }

    return '';
}

/**
 * Helper method for non-user lists (eg. categories and tags) that returns the text to be used for the header's message and title (if any)
 */
function getHeaderMessageForNonUserList(hasSelectableOptions: boolean, searchValue: string): string {
    if (searchValue && !hasSelectableOptions) {
        return Localize.translate(preferredLocale, 'common.noResultsFound');
    }
    return '';
}

/**
 * Helper method to check whether an option can show tooltip or not
 */
function shouldOptionShowTooltip(option: ReportUtils.OptionData): boolean {
    return !option.private_isArchived;
}

/**
 * Handles the logic for displaying selected participants from the search term
 */
function formatSectionsFromSearchTerm(
    searchTerm: string,
    selectedOptions: ReportUtils.OptionData[],
    filteredRecentReports: ReportUtils.OptionData[],
    filteredPersonalDetails: ReportUtils.OptionData[],
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

function getPersonalDetailSearchTerms(item: Partial<ReportUtils.OptionData>) {
    return [item.participantsList?.[0]?.displayName ?? '', item.login ?? '', item.login?.replace(CONST.EMAIL_SEARCH_REGEX, '') ?? ''];
}

function getCurrentUserSearchTerms(item: ReportUtils.OptionData) {
    return [item.text ?? '', item.login ?? '', item.login?.replace(CONST.EMAIL_SEARCH_REGEX, '') ?? ''];
}

/**
 * Remove the personal details for the DMs that are already in the recent reports so that we don't show duplicates.
 */
function filteredPersonalDetailsOfRecentReports(recentReports: ReportUtils.OptionData[], personalDetails: ReportUtils.OptionData[]) {
    const excludedLogins = new Set(recentReports.map((report) => report.login));
    return personalDetails.filter((personalDetail) => !excludedLogins.has(personalDetail.login));
}

/**
 * Filters options based on the search input value
 */
function filterOptions(options: Options, searchInputValue: string, config?: FilterOptionsConfig): Options {
    const {
        sortByReportTypeInSearch = false,
        canInviteUser = true,
        maxRecentReportsToShow = 0,
        excludeLogins = [],
        preferChatroomsOverThreads = false,
        preferPolicyExpenseChat = false,
        preferRecentExpenseReports = false,
        excludeUnknownUsers = false,
    } = config ?? {};
    if (searchInputValue.trim() === '' && maxRecentReportsToShow > 0) {
        const recentReports = options.recentReports.slice(0, maxRecentReportsToShow);
        const personalDetails = filteredPersonalDetailsOfRecentReports(recentReports, options.personalDetails);
        return {
            ...options,
            recentReports,
            personalDetails,
        };
    }

    const parsedPhoneNumber = PhoneNumber.parsePhoneNumber(LoginUtils.appendCountryCode(Str.removeSMSDomain(searchInputValue)));
    const searchValue = parsedPhoneNumber.possible && parsedPhoneNumber.number?.e164 ? parsedPhoneNumber.number.e164 : searchInputValue.toLowerCase();
    const searchTerms = searchValue ? searchValue.split(' ') : [];

    const optionsToExclude: Option[] = [{login: CONST.EMAIL.NOTIFICATIONS}];

    excludeLogins.forEach((login) => {
        optionsToExclude.push({login});
    });

    const matchResults = searchTerms.reduceRight((items, term) => {
        const recentReports = filterArrayByMatch(items.recentReports, term, (item) => {
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
        });
        const personalDetails = filterArrayByMatch(items.personalDetails, term, (item) => uniqFast(getPersonalDetailSearchTerms(item)));

        const currentUserOptionSearchText = items.currentUserOption ? uniqFast(getCurrentUserSearchTerms(items.currentUserOption)).join(' ') : '';

        const currentUserOption = isSearchStringMatch(term, currentUserOptionSearchText) ? items.currentUserOption : null;
        return {
            recentReports: recentReports ?? [],
            personalDetails: personalDetails ?? [],
            userToInvite: null,
            currentUserOption,
        };
    }, options);

    const {recentReports, personalDetails} = matchResults;

    const personalDetailsWithoutDMs = filteredPersonalDetailsOfRecentReports(recentReports, personalDetails);

    let filteredPersonalDetails: ReportUtils.OptionData[] = personalDetailsWithoutDMs;
    let filteredRecentReports: ReportUtils.OptionData[] = recentReports;
    if (sortByReportTypeInSearch) {
        filteredRecentReports = recentReports.concat(personalDetailsWithoutDMs);
        filteredPersonalDetails = [];
    }

    let userToInvite = null;
    if (canInviteUser) {
        const canCreateOptimisticDetail = canCreateOptimisticPersonalDetailOption({
            recentReportOptions: filteredRecentReports,
            personalDetailsOptions: filteredPersonalDetails,
            currentUserOption: matchResults.currentUserOption,
            excludeUnknownUsers,
        });
        if (canCreateOptimisticDetail) {
            userToInvite = getUserToInviteOption({
                searchValue,
                selectedOptions: config?.selectedOptions,
                optionsToExclude,
            });
        }
    }

    if (maxRecentReportsToShow > 0 && recentReports.length > maxRecentReportsToShow) {
        recentReports.splice(maxRecentReportsToShow);
    }

    const sortedRecentReports = orderOptions(filteredRecentReports, searchValue, {preferChatroomsOverThreads, preferPolicyExpenseChat, preferRecentExpenseReports});
    return {
        personalDetails: filteredPersonalDetails,
        recentReports: sortedRecentReports,
        userToInvite,
        currentUserOption: matchResults.currentUserOption,
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

function shouldUseBoldText(report: ReportUtils.OptionData): boolean {
    const notificationPreference = report.notificationPreference ?? ReportUtils.getReportNotificationPreference(report);
    return report.isUnread === true && notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE && notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN;
}

export {
    getAvatarsForAccountIDs,
    isCurrentUser,
    isPersonalDetailsReady,
    getOptions,
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
    filterOptions,
    filteredPersonalDetailsOfRecentReports,
    orderOptions,
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
};

export type {Section, SectionBase, MemberForList, Options, OptionList, SearchOption, PayeePersonalDetails, Option, OptionTree};
