import {Str} from 'expensify-common';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {PartialPolicyForSidebar, ReportsToDisplayInLHN} from '@hooks/useSidebarOrderedReports';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, PersonalDetails, PersonalDetailsList, ReportActions, ReportAttributesDerivedValue, ReportNameValuePairs, Transaction, TransactionViolation} from '@src/types/onyx';
import type Beta from '@src/types/onyx/Beta';
import type {ReportAttributes} from '@src/types/onyx/DerivedValues';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type Policy from '@src/types/onyx/Policy';
import type PriorityMode from '@src/types/onyx/PriorityMode';
import type Report from '@src/types/onyx/Report';
import type ReportAction from '@src/types/onyx/ReportAction';
import {formatPhoneNumber as formatPhoneNumberPhoneUtils} from './LocalePhoneNumber';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {translateLocal} from './Localize';
import {
    getLastActorDisplayName,
    getLastActorDisplayNameFromLastVisibleActions,
    getLastMessageTextForReport,
    getPersonalDetailsForAccountIDs,
    shouldShowLastActorDisplayName,
} from './OptionsListUtils';
import Parser from './Parser';
import Performance from './Performance';
import {getCleanedTagName, getPolicy} from './PolicyUtils';
import {
    getActionableCardFraudAlertResolutionMessage,
    getAddedApprovalRuleMessage,
    getAddedConnectionMessage,
    getCardIssuedMessage,
    getChangedApproverActionMessage,
    getDeletedApprovalRuleMessage,
    getIntegrationSyncFailedMessage,
    getLastVisibleMessage,
    getMessageOfOldDotReportAction,
    getOneTransactionThreadReportID,
    getOriginalMessage,
    getPolicyChangeLogAddEmployeeMessage,
    getPolicyChangeLogDefaultBillableMessage,
    getPolicyChangeLogDefaultReimbursableMessage,
    getPolicyChangeLogDefaultTitleEnforcedMessage,
    getPolicyChangeLogDeleteMemberMessage,
    getPolicyChangeLogEmployeeLeftMessage,
    getPolicyChangeLogMaxExpenseAmountMessage,
    getPolicyChangeLogMaxExpenseAmountNoReceiptMessage,
    getPolicyChangeLogUpdateEmployee,
    getRemovedConnectionMessage,
    getRenamedAction,
    getReopenedMessage,
    getReportAction,
    getReportActionMessageText,
    getRetractedMessage,
    getRoomAvatarUpdatedMessage,
    getTagListNameUpdatedMessage,
    getTravelUpdateMessage,
    getUpdatedApprovalRuleMessage,
    getUpdatedAuditRateMessage,
    getUpdatedManualApprovalThresholdMessage,
    getUpdateRoomDescriptionMessage,
    getWorkspaceAttendeeTrackingUpdateMessage,
    getWorkspaceCategoryUpdateMessage,
    getWorkspaceCurrencyUpdateMessage,
    getWorkspaceCustomUnitRateAddedMessage,
    getWorkspaceCustomUnitRateDeletedMessage,
    getWorkspaceCustomUnitRateUpdatedMessage,
    getWorkspaceCustomUnitUpdatedMessage,
    getWorkspaceDescriptionUpdatedMessage,
    getWorkspaceFrequencyUpdateMessage,
    getWorkspaceReimbursementUpdateMessage,
    getWorkspaceReportFieldAddMessage,
    getWorkspaceReportFieldDeleteMessage,
    getWorkspaceReportFieldUpdateMessage,
    getWorkspaceTagUpdateMessage,
    getWorkspaceTaxUpdateMessage,
    getWorkspaceUpdateFieldMessage,
    isActionOfType,
    isCardIssuedAction,
    isInviteOrRemovedAction,
    isOldDotReportAction,
    isRenamedAction,
    isTagModificationAction,
    isTaskAction,
    isTransactionThread,
} from './ReportActionsUtils';
import type {OptionData} from './ReportUtils';
import {
    canUserPerformWriteAction as canUserPerformWriteActionUtil,
    excludeParticipantsForDisplay,
    formatReportLastMessageText,
    getAllReportActionsErrorsAndReportActionThatRequiresAttention,
    getChatRoomSubtitle,
    getDisplayNameForParticipant,
    getDisplayNamesWithTooltips,
    getForcedCorporateUpgradeMessage,
    getIcons,
    getParticipantsAccountIDsForDisplay,
    getPolicyName,
    getReportActionActorAccountID,
    getReportDescription,
    getReportMetadata,
    getReportName,
    getReportNotificationPreference,
    getReportParticipantsTitle,
    getReportSubtitlePrefix,
    getWorkspaceNameUpdatedMessage,
    hasReceiptError,
    hasReportErrorsOtherThanFailedReceipt,
    isAdminRoom,
    isAnnounceRoom,
    isArchivedNonExpenseReport,
    isArchivedReport,
    isChatRoom,
    isChatThread,
    isConciergeChatReport,
    isDeprecatedGroupDM,
    isDomainRoom,
    isExpenseReport,
    isExpenseRequest,
    isGroupChat as isGroupChatUtil,
    isHiddenForCurrentUser,
    isInvoiceReport,
    isInvoiceRoom,
    isIOUOwnedByCurrentUser,
    isJoinRequestInAdminRoom,
    isMoneyRequestReport,
    isOneOnOneChat,
    isOneTransactionThread,
    isPolicyExpenseChat,
    isSelfDM,
    isSystemChat as isSystemChatUtil,
    isTaskReport,
    isThread,
    isUnread,
    isUnreadWithMention,
    shouldDisplayViolationsRBRInLHN,
    shouldReportBeInOptionList,
    shouldReportShowSubscript,
} from './ReportUtils';
import {getTaskReportActionMessage} from './TaskUtils';
import {getTransactionID} from './TransactionUtils';

type WelcomeMessage = {phrase1?: string; messageText?: string; messageHtml?: string};

function compareStringDates(a: string, b: string): 0 | 1 | -1 {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
}

/**
 * A mini report object that contains only the necessary information to sort reports.
 * This is used to avoid copying the entire report object and only the necessary information.
 */
type MiniReport = {
    reportID?: string;
    displayName: string;
    lastVisibleActionCreated?: string;
};

function ensureSingleSpacing(text: string) {
    return text.replaceAll(CONST.REGEX.WHITESPACE, ' ').trim();
}

function shouldDisplayReportInLHN(
    report: Report,
    reports: OnyxCollection<Report>,
    currentReportId: string | undefined,
    isInFocusMode: boolean,
    betas: OnyxEntry<Beta[]>,
    transactionViolations: OnyxCollection<TransactionViolation[]>,
    draftComment: OnyxEntry<string>,
    isReportArchived?: boolean,
    reportAttributes?: ReportAttributesDerivedValue['reports'],
) {
    if (!report) {
        return {shouldDisplay: false};
    }

    if ((Object.values(CONST.REPORT.UNSUPPORTED_TYPE) as string[]).includes(report?.type ?? '')) {
        return {shouldDisplay: false};
    }

    // Get report metadata and status
    const parentReportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
    const doesReportHaveViolations = shouldDisplayViolationsRBRInLHN(report, transactionViolations);
    const isHidden = isHiddenForCurrentUser(report);
    const isFocused = report.reportID === currentReportId;
    const chatReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`];
    const parentReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`];
    const hasErrorsOtherThanFailedReceipt = hasReportErrorsOtherThanFailedReceipt(report, chatReport, doesReportHaveViolations, transactionViolations, reportAttributes);
    const isReportInAccessible = report?.errorFields?.notFound;
    if (isOneTransactionThread(report, parentReport, parentReportAction)) {
        return {shouldDisplay: false};
    }

    // Handle reports with errors
    if (hasErrorsOtherThanFailedReceipt && !isReportInAccessible) {
        return {shouldDisplay: true, hasErrorsOtherThanFailedReceipt: true};
    }

    // Check if report should override hidden status
    const isSystemChat = isSystemChatUtil(report);
    const shouldOverrideHidden =
        !!draftComment ||
        hasErrorsOtherThanFailedReceipt ||
        isFocused ||
        isSystemChat ||
        !!report.isPinned ||
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        reportAttributes?.[report?.reportID]?.requiresAttention ||
        report.isOwnPolicyExpenseChat;

    if (isHidden && !shouldOverrideHidden) {
        return {shouldDisplay: false};
    }

    // Final check for display eligibility
    const shouldDisplay = shouldReportBeInOptionList({
        report,
        chatReport,
        currentReportId,
        isInFocusMode,
        betas,
        excludeEmptyChats: true,
        doesReportHaveViolations,
        draftComment,
        includeSelfDM: true,
        isReportArchived,
    });

    return {shouldDisplay};
}

function getReportsToDisplayInLHN(
    currentReportId: string | undefined,
    reports: OnyxCollection<Report>,
    betas: OnyxEntry<Beta[]>,
    policies: OnyxCollection<PartialPolicyForSidebar>,
    priorityMode: OnyxEntry<PriorityMode>,
    draftComments: OnyxCollection<string>,
    transactionViolations: OnyxCollection<TransactionViolation[]>,
    reportNameValuePairs?: OnyxCollection<ReportNameValuePairs>,
    reportAttributes?: ReportAttributesDerivedValue['reports'],
) {
    const isInFocusMode = priorityMode === CONST.PRIORITY_MODE.GSD;
    const allReportsDictValues = reports ?? {};
    const reportsToDisplay: ReportsToDisplayInLHN = {};

    for (const [reportID, report] of Object.entries(allReportsDictValues)) {
        if (!report?.reportID && report?.pendingFields?.reportID !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            continue;
        }

        const reportDraftComment = draftComments?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${report.reportID}`];

        const {shouldDisplay, hasErrorsOtherThanFailedReceipt} = shouldDisplayReportInLHN(
            report,
            reports,
            currentReportId,
            isInFocusMode,
            betas,
            transactionViolations,
            reportDraftComment,
            isArchivedReport(reportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`]),
            reportAttributes,
        );

        if (shouldDisplay) {
            reportsToDisplay[reportID] = hasErrorsOtherThanFailedReceipt ? {...report, hasErrorsOtherThanFailedReceipt: true} : report;
        }
    }

    return reportsToDisplay;
}

type UpdateReportsToDisplayInLHNProps = {
    displayedReports: ReportsToDisplayInLHN;
    reports: OnyxCollection<Report>;
    updatedReportsKeys: string[];
    currentReportId: string | undefined;
    isInFocusMode: boolean;
    betas: OnyxEntry<Beta[]>;
    transactionViolations: OnyxCollection<TransactionViolation[]>;
    reportNameValuePairs?: OnyxCollection<ReportNameValuePairs>;
    reportAttributes?: ReportAttributesDerivedValue['reports'];
    draftComments: OnyxCollection<string>;
};

function updateReportsToDisplayInLHN({
    displayedReports,
    reports,
    updatedReportsKeys,
    currentReportId,
    isInFocusMode,
    betas,
    transactionViolations,
    reportNameValuePairs,
    reportAttributes,
    draftComments,
}: UpdateReportsToDisplayInLHNProps) {
    const displayedReportsCopy = {...displayedReports};
    for (const reportID of updatedReportsKeys) {
        const report = reports?.[reportID];
        if (!report?.reportID && report?.pendingFields?.reportID !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            continue;
        }

        // Get the specific draft comment for this report instead of using a single draft comment for all reports
        // This fixes the issue where the current report's draft comment was incorrectly used to filter all reports
        const reportDraftComment = draftComments?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${report.reportID}`];

        const {shouldDisplay, hasErrorsOtherThanFailedReceipt} = shouldDisplayReportInLHN(
            report,
            reports,
            currentReportId,
            isInFocusMode,
            betas,
            transactionViolations,
            reportDraftComment,
            isArchivedReport(reportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`] ?? {}),
            reportAttributes,
        );

        if (shouldDisplay) {
            displayedReportsCopy[reportID] = hasErrorsOtherThanFailedReceipt ? {...report, hasErrorsOtherThanFailedReceipt: true} : report;
        } else {
            delete displayedReportsCopy[reportID];
        }
    }

    return displayedReportsCopy;
}
/**
 * Categorizes reports into their respective LHN groups
 */
function categorizeReportsForLHN(
    reportsToDisplay: ReportsToDisplayInLHN,
    reportsDrafts: OnyxCollection<string> | undefined,
    reportNameValuePairs?: OnyxCollection<ReportNameValuePairs>,
    reportAttributes?: ReportAttributesDerivedValue['reports'],
) {
    const pinnedAndGBRReports: MiniReport[] = [];
    const errorReports: MiniReport[] = [];
    const draftReports: MiniReport[] = [];
    const nonArchivedReports: MiniReport[] = [];
    const archivedReports: MiniReport[] = [];

    // Pre-calculate report names and other properties to avoid repeated calculations
    const reportValues = Object.values(reportsToDisplay);
    const precomputedReports: Array<{
        miniReport: MiniReport;
        isPinned: boolean;
        hasErrors: boolean;
        hasDraft: boolean;
        isArchived: boolean;
        requiresAttention: boolean;
    }> = [];

    // Single pass to precompute all required data
    for (const report of reportValues) {
        if (!report) {
            continue;
        }

        const reportID = report.reportID;
        const displayName = getReportName(report);
        const miniReport: MiniReport = {
            reportID,
            displayName,
            lastVisibleActionCreated: report.lastVisibleActionCreated,
        };

        const isPinned = !!report.isPinned;
        const requiresAttention = !!reportAttributes?.[reportID]?.requiresAttention;
        const draftComment = reportsDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`];
        const hasDraft = !!draftComment;
        const reportNameValuePairsKey = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`;
        const rNVPs = reportNameValuePairs?.[reportNameValuePairsKey];
        const isArchived = isArchivedNonExpenseReport(report, !!rNVPs?.private_isArchived);
        const hasErrors = !!report.hasErrorsOtherThanFailedReceipt && !isArchived;

        precomputedReports.push({
            miniReport,
            isPinned,
            hasErrors,
            hasDraft,
            isArchived,
            requiresAttention,
        });
    }

    // Single pass to categorize reports
    for (const data of precomputedReports) {
        const {miniReport, isPinned, requiresAttention, hasErrors, hasDraft, isArchived} = data;

        if (isPinned || requiresAttention) {
            pinnedAndGBRReports.push(miniReport);
        } else if (hasErrors) {
            errorReports.push(miniReport);
        } else if (hasDraft) {
            draftReports.push(miniReport);
        } else if (isArchived) {
            archivedReports.push(miniReport);
        } else {
            nonArchivedReports.push(miniReport);
        }
    }

    return {
        pinnedAndGBRReports,
        errorReports,
        draftReports,
        nonArchivedReports,
        archivedReports,
    };
}

/**
 * Sorts categorized reports and returns new sorted arrays (pure function).
 * This function does not mutate the input and returns new arrays for better testability.
 */
function sortCategorizedReports(
    categories: {
        pinnedAndGBRReports: MiniReport[];
        errorReports: MiniReport[];
        draftReports: MiniReport[];
        nonArchivedReports: MiniReport[];
        archivedReports: MiniReport[];
    },
    isInDefaultMode: boolean,
    localeCompare: LocaleContextProps['localeCompare'],
): {
    pinnedAndGBRReports: MiniReport[];
    errorReports: MiniReport[];
    draftReports: MiniReport[];
    nonArchivedReports: MiniReport[];
    archivedReports: MiniReport[];
} {
    const {pinnedAndGBRReports, errorReports, draftReports, nonArchivedReports, archivedReports} = categories;

    // Create comparison functions once to avoid recreating them in sort
    const compareDisplayNames = (a: MiniReport, b: MiniReport) => (a?.displayName && b?.displayName ? localeCompare(a.displayName, b.displayName) : 0);

    const compareDatesDesc = (a: MiniReport, b: MiniReport) =>
        a?.lastVisibleActionCreated && b?.lastVisibleActionCreated ? compareStringDates(b.lastVisibleActionCreated, a.lastVisibleActionCreated) : 0;

    const compareNonArchivedDefault = (a: MiniReport, b: MiniReport) => {
        const compareDates = compareDatesDesc(a, b);
        return compareDates !== 0 ? compareDates : compareDisplayNames(a, b);
    };

    // Sort each group of reports accordingly
    const sortedPinnedAndGBRReports = pinnedAndGBRReports.sort(compareDisplayNames);
    const sortedErrorReports = errorReports.sort(compareDisplayNames);
    const sortedDraftReports = draftReports.sort(compareDisplayNames);

    let sortedNonArchivedReports: MiniReport[];
    let sortedArchivedReports: MiniReport[];

    if (isInDefaultMode) {
        sortedNonArchivedReports = nonArchivedReports.sort(compareNonArchivedDefault);
        // For archived reports ensure that most recent reports are at the top by reversing the order
        sortedArchivedReports = archivedReports.sort(compareDatesDesc);
    } else {
        sortedNonArchivedReports = nonArchivedReports.sort(compareDisplayNames);
        sortedArchivedReports = archivedReports.sort(compareDisplayNames);
    }

    return {
        pinnedAndGBRReports: sortedPinnedAndGBRReports,
        errorReports: sortedErrorReports,
        draftReports: sortedDraftReports,
        nonArchivedReports: sortedNonArchivedReports,
        archivedReports: sortedArchivedReports,
    };
}

/**
 * Combines sorted report categories and extracts report IDs
 */
function combineReportCategories(
    pinnedAndGBRReports: MiniReport[],
    errorReports: MiniReport[],
    draftReports: MiniReport[],
    nonArchivedReports: MiniReport[],
    archivedReports: MiniReport[],
): string[] {
    // Now that we have all the reports grouped and sorted, they must be flattened into an array and only return the reportID.
    // The order the arrays are concatenated in matters and will determine the order that the groups are displayed in the sidebar.
    return [...pinnedAndGBRReports, ...errorReports, ...draftReports, ...nonArchivedReports, ...archivedReports].map((report) => report?.reportID).filter(Boolean) as string[];
}

/**
 * @returns An array of reportIDs sorted in the proper order
 */
function sortReportsToDisplayInLHN(
    reportsToDisplay: ReportsToDisplayInLHN,
    priorityMode: OnyxEntry<PriorityMode>,
    localeCompare: LocaleContextProps['localeCompare'],
    reportsDrafts: OnyxCollection<string> | undefined,
    reportNameValuePairs?: OnyxCollection<ReportNameValuePairs>,
    reportAttributes?: ReportAttributesDerivedValue['reports'],
): string[] {
    Performance.markStart(CONST.TIMING.GET_ORDERED_REPORT_IDS);

    const isInFocusMode = priorityMode === CONST.PRIORITY_MODE.GSD;
    const isInDefaultMode = !isInFocusMode;
    // The LHN is split into five distinct groups, and each group is sorted a little differently. The groups will ALWAYS be in this order:
    // 1. Pinned/GBR - Always sorted by reportDisplayName
    // 2. Error reports - Always sorted by reportDisplayName
    // 3. Drafts - Always sorted by reportDisplayName
    // 4. Non-archived reports and settled IOUs
    //      - Sorted by lastVisibleActionCreated in default (most recent) view mode
    //      - Sorted by reportDisplayName in GSD (focus) view mode
    // 5. Archived reports
    //      - Sorted by lastVisibleActionCreated in default (most recent) view mode
    //      - Sorted by reportDisplayName in GSD (focus) view mode

    // Step 1: Categorize reports
    const categories = categorizeReportsForLHN(reportsToDisplay, reportsDrafts, reportNameValuePairs, reportAttributes);

    // Step 2: Sort each category
    const sortedCategories = sortCategorizedReports(categories, isInDefaultMode, localeCompare);

    // Step 3: Combine and extract IDs
    const result = combineReportCategories(
        sortedCategories.pinnedAndGBRReports,
        sortedCategories.errorReports,
        sortedCategories.draftReports,
        sortedCategories.nonArchivedReports,
        sortedCategories.archivedReports,
    );

    Performance.markEnd(CONST.TIMING.GET_ORDERED_REPORT_IDS);
    return result;
}

type ReasonAndReportActionThatHasRedBrickRoad = {
    reason: ValueOf<typeof CONST.RBR_REASONS>;
    reportAction?: OnyxEntry<ReportAction>;
};

function getReasonAndReportActionThatHasRedBrickRoad(
    report: Report,
    chatReport: OnyxEntry<Report>,
    reportActions: OnyxEntry<ReportActions>,
    hasViolations: boolean,
    reportErrors: Errors,
    transactions: OnyxCollection<Transaction>,
    transactionViolations?: OnyxCollection<TransactionViolation[]>,
    isReportArchived = false,
): ReasonAndReportActionThatHasRedBrickRoad | null {
    const {reportAction} = getAllReportActionsErrorsAndReportActionThatRequiresAttention(report, reportActions, isReportArchived);
    const errors = reportErrors;
    const hasErrors = Object.keys(errors).length !== 0;

    if (isReportArchived) {
        return null;
    }

    if (shouldDisplayViolationsRBRInLHN(report, transactionViolations)) {
        return {
            reason: CONST.RBR_REASONS.HAS_TRANSACTION_THREAD_VIOLATIONS,
        };
    }

    if (hasErrors) {
        return {
            reason: CONST.RBR_REASONS.HAS_ERRORS,
            reportAction,
        };
    }

    if (hasViolations) {
        return {
            reason: CONST.RBR_REASONS.HAS_VIOLATIONS,
        };
    }
    const parentReportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions ?? []);
    if (transactionThreadReportID) {
        const transactionID = getTransactionID(transactionThreadReportID);
        const transaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        if (hasReceiptError(transaction)) {
            return {
                reason: CONST.RBR_REASONS.HAS_ERRORS,
            };
        }
    }
    const transactionID = getTransactionID(report.reportID);
    const transaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    if (isTransactionThread(parentReportAction) && hasReceiptError(transaction)) {
        return {
            reason: CONST.RBR_REASONS.HAS_ERRORS,
        };
    }

    return null;
}

function shouldShowRedBrickRoad(
    report: Report,
    chatReport: OnyxEntry<Report>,
    reportActions: OnyxEntry<ReportActions>,
    hasViolations: boolean,
    reportErrors: Errors,
    transactions: OnyxCollection<Transaction>,
    transactionViolations?: OnyxCollection<TransactionViolation[]>,
    isReportArchived = false,
) {
    return !!getReasonAndReportActionThatHasRedBrickRoad(report, chatReport, reportActions, hasViolations, reportErrors, transactions, transactionViolations, isReportArchived);
}

/**
 * Gets all the data necessary for rendering an OptionRowLHN component
 */
function getOptionData({
    report,
    reportAttributes,
    oneTransactionThreadReport,
    reportNameValuePairs,
    personalDetails,
    policy,
    parentReportAction,
    lastMessageTextFromReport: lastMessageTextFromReportProp,
    invoiceReceiverPolicy,
    card,
    lastAction,
    localeCompare,
    isReportArchived,
    lastActionReport,
    movedFromReport,
    movedToReport,
}: {
    report: OnyxEntry<Report>;
    oneTransactionThreadReport: OnyxEntry<Report>;
    reportNameValuePairs: OnyxEntry<ReportNameValuePairs>;
    personalDetails: OnyxEntry<PersonalDetailsList>;
    policy: OnyxEntry<Policy> | undefined;
    parentReportAction: OnyxEntry<ReportAction> | undefined;
    lastMessageTextFromReport?: string;
    invoiceReceiverPolicy?: OnyxEntry<Policy>;
    reportAttributes: OnyxEntry<ReportAttributes>;
    card: Card | undefined;
    lastAction: ReportAction | undefined;
    localeCompare: LocaleContextProps['localeCompare'];
    isReportArchived: boolean | undefined;
    lastActionReport: OnyxEntry<Report> | undefined;
    movedFromReport?: OnyxEntry<Report>;
    movedToReport?: OnyxEntry<Report>;
}): OptionData | undefined {
    // When a user signs out, Onyx is cleared. Due to the lazy rendering with a virtual list, it's possible for
    // this method to be called after the Onyx data has been cleared out. In that case, it's fine to do
    // a null check here and return early.
    if (!report || !personalDetails) {
        return;
    }

    const result: OptionData = {
        text: '',
        alternateText: undefined,
        allReportErrors: reportAttributes?.reportErrors,
        brickRoadIndicator: null,
        tooltipText: null,
        subtitle: undefined,
        login: undefined,
        accountID: undefined,
        reportID: '',
        phoneNumber: undefined,
        isUnread: null,
        isUnreadWithMention: null,
        hasDraftComment: false,
        keyForList: undefined,
        searchText: undefined,
        isPinned: false,
        hasOutstandingChildRequest: false,
        hasOutstandingChildTask: false,
        hasParentAccess: undefined,
        isIOUReportOwner: null,
        isChatRoom: false,
        private_isArchived: undefined,
        shouldShowSubscript: false,
        isPolicyExpenseChat: false,
        isMoneyRequestReport: false,
        isExpenseRequest: false,
        isWaitingOnBankAccount: false,
        isAllowedToComment: true,
        isDeletedParentAction: false,
        isConciergeChat: false,
    };
    const reportMetadata = getReportMetadata(report?.reportID);
    const participantAccountIDs = getParticipantsAccountIDsForDisplay(report);
    const participantAccountIDsExcludeCurrentUser = excludeParticipantsForDisplay(participantAccountIDs, report.participants ?? {}, reportMetadata, {shouldExcludeCurrentUser: true});
    const participantPersonalDetailListExcludeCurrentUser = Object.values(getPersonalDetailsForAccountIDs(participantAccountIDsExcludeCurrentUser, personalDetails));

    const visibleParticipantAccountIDs = excludeParticipantsForDisplay(participantAccountIDs, report.participants ?? {}, reportMetadata, {shouldExcludeHidden: true});

    const participantPersonalDetailList = Object.values(getPersonalDetailsForAccountIDs(participantAccountIDs, personalDetails));
    const personalDetail = participantPersonalDetailList.at(0) ?? ({} as PersonalDetails);

    result.isThread = isChatThread(report);
    result.isChatRoom = isChatRoom(report);
    result.isTaskReport = isTaskReport(report);
    result.isInvoiceReport = isInvoiceReport(report);
    result.parentReportAction = parentReportAction;
    result.private_isArchived = reportNameValuePairs?.private_isArchived;
    result.isPolicyExpenseChat = isPolicyExpenseChat(report);
    result.isExpenseRequest = isExpenseRequest(report);
    result.isMoneyRequestReport = isMoneyRequestReport(report);
    result.shouldShowSubscript = shouldReportShowSubscript(report, isReportArchived);
    result.pendingAction = report.pendingFields?.addWorkspaceRoom ?? report.pendingFields?.createChat;
    result.brickRoadIndicator = reportAttributes?.brickRoadStatus;
    result.ownerAccountID = report.ownerAccountID;
    result.managerID = report.managerID;
    result.reportID = report.reportID;
    result.policyID = report.policyID;
    result.stateNum = report.stateNum;
    result.statusNum = report.statusNum;
    // When the only message of a report is deleted lastVisibleActionCreated is not reset leading to wrongly
    // setting it Unread so we add additional condition here to avoid empty chat LHN from being bold.
    result.isUnread = isUnread(report, oneTransactionThreadReport, isReportArchived) && !!report.lastActorAccountID;
    result.isUnreadWithMention = isUnreadWithMention(report);
    result.isPinned = report.isPinned;
    result.iouReportID = report.iouReportID;
    result.keyForList = String(report.reportID);
    result.hasOutstandingChildRequest = report.hasOutstandingChildRequest;
    result.parentReportID = report.parentReportID;
    result.isWaitingOnBankAccount = report.isWaitingOnBankAccount;
    result.notificationPreference = getReportNotificationPreference(report);
    result.isAllowedToComment = canUserPerformWriteActionUtil(report, isReportArchived);
    result.chatType = report.chatType;
    result.isDeletedParentAction = report.isDeletedParentAction;
    result.isSelfDM = isSelfDM(report);
    result.tooltipText = getReportParticipantsTitle(visibleParticipantAccountIDs);
    result.hasOutstandingChildTask = report.hasOutstandingChildTask;
    result.hasParentAccess = report.hasParentAccess;
    result.isConciergeChat = isConciergeChatReport(report);
    result.participants = report.participants;

    const isExpense = isExpenseReport(report);
    const hasMultipleParticipants = participantPersonalDetailList.length > 1 || result.isChatRoom || result.isPolicyExpenseChat || isExpense;
    const subtitle = getChatRoomSubtitle(report, false, isReportArchived);

    const status = personalDetail?.status ?? '';

    // For 1:1 DMs, add the other participant's selected timezone
    if (isOneOnOneChat(report)) {
        const recipientPersonalDetail = participantPersonalDetailListExcludeCurrentUser.at(0);
        result.timezone = recipientPersonalDetail?.timezone;
    }

    // We only create tooltips for the first 10 users or so since some reports have hundreds of users, causing performance to degrade.
    const displayNamesWithTooltips = getDisplayNamesWithTooltips((participantPersonalDetailList || []).slice(0, 10), hasMultipleParticipants, localeCompare, undefined, isSelfDM(report));

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const lastActorAccountID = getReportActionActorAccountID(lastAction, undefined, undefined) || report.lastActorAccountID;
    // If the last actor's details are not currently saved in Onyx Collection,
    // then try to get that from the last report action if that action is valid
    // to get data from.
    let lastActorDetails: Partial<PersonalDetails> | null = lastActorAccountID ? (personalDetails?.[lastActorAccountID] ?? null) : null;
    if (!lastActorDetails && lastAction) {
        const lastActorDisplayName = lastAction?.person?.[0]?.text;
        lastActorDetails = lastActorDisplayName
            ? {
                  displayName: lastActorDisplayName,
                  accountID: report.lastActorAccountID,
              }
            : null;
    }

    const lastActorDisplayName = getLastActorDisplayName(lastActorDetails);
    let lastMessageTextFromReport = lastMessageTextFromReportProp;
    if (!lastMessageTextFromReport) {
        lastMessageTextFromReport = getLastMessageTextForReport({report, lastActorDetails, movedFromReport, movedToReport, policy, isReportArchived});
    }

    // We need to remove sms domain in case the last message text has a phone number mention with sms domain.
    let lastMessageText = Str.removeSMSDomain(lastMessageTextFromReport);

    const isGroupChat = isGroupChatUtil(report) || isDeprecatedGroupDM(report, isReportArchived);

    const isThreadMessage = isThread(report) && lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT && lastAction?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    if ((result.isChatRoom || result.isPolicyExpenseChat || result.isThread || result.isTaskReport || isThreadMessage || isGroupChat) && !isReportArchived) {
        const lastActionName = lastAction?.actionName ?? report.lastActionType;
        const prefix = getReportSubtitlePrefix(report);

        if (isRenamedAction(lastAction)) {
            result.alternateText = getRenamedAction(lastAction, isExpense, lastActorDisplayName);
        } else if (isTaskAction(lastAction)) {
            result.alternateText = formatReportLastMessageText(getTaskReportActionMessage(lastAction).text);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_ROOM) {
            const actionMessage = getReportActionMessageText(lastAction);
            result.alternateText = actionMessage ? `${lastActorDisplayName}: ${actionMessage}` : '';
        } else if (isInviteOrRemovedAction(lastAction)) {
            let actorDetails;
            if (lastAction.actorAccountID) {
                actorDetails = personalDetails?.[lastAction?.actorAccountID];
            }
            let actorDisplayName = lastAction?.person?.[0]?.text;
            if (!actorDetails && actorDisplayName && lastAction.actorAccountID) {
                actorDetails = {
                    displayName: actorDisplayName,
                    accountID: lastAction.actorAccountID,
                };
            }
            actorDisplayName = actorDetails ? getLastActorDisplayName(actorDetails) : undefined;
            const lastActionOriginalMessage = lastAction?.actionName ? getOriginalMessage(lastAction) : null;
            const targetAccountIDs = lastActionOriginalMessage?.targetAccountIDs ?? [];
            const targetAccountIDsLength = targetAccountIDs.length !== 0 ? targetAccountIDs.length : (report.lastMessageHtml?.match(/<mention-user[^>]*><\/mention-user>/g)?.length ?? 0);
            const verb =
                lastActionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM || lastActionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM
                    ? // eslint-disable-next-line @typescript-eslint/no-deprecated
                      translateLocal('workspace.invite.invited')
                    : // eslint-disable-next-line @typescript-eslint/no-deprecated
                      translateLocal('workspace.invite.removed');
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const users = translateLocal(targetAccountIDsLength > 1 ? 'common.members' : 'common.member')?.toLocaleLowerCase();
            result.alternateText = formatReportLastMessageText(`${actorDisplayName ?? lastActorDisplayName}: ${verb} ${targetAccountIDsLength} ${users}`);
            const roomName = getReportName(lastActionReport) || lastActionOriginalMessage?.roomName;
            if (roomName) {
                const preposition =
                    lastAction.actionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM || lastAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM
                        ? // eslint-disable-next-line @typescript-eslint/no-deprecated
                          ` ${translateLocal('workspace.invite.to')}`
                        : // eslint-disable-next-line @typescript-eslint/no-deprecated
                          ` ${translateLocal('workspace.invite.from')}`;
                result.alternateText += `${preposition} ${roomName}`;
            }
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME)) {
            result.alternateText = getWorkspaceNameUpdatedMessage(lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT) && getOriginalMessage(lastAction)?.resolution) {
            result.alternateText = getActionableCardFraudAlertResolutionMessage(lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DESCRIPTION)) {
            result.alternateText = getWorkspaceDescriptionUpdatedMessage(lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY)) {
            result.alternateText = getWorkspaceCurrencyUpdateMessage(lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REPORTING_FREQUENCY)) {
            result.alternateText = getWorkspaceFrequencyUpdateMessage(lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_UPGRADE)) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            result.alternateText = translateLocal('workspaceActions.upgradedWorkspace');
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_FORCE_UPGRADE)) {
            result.alternateText = Parser.htmlToText(getForcedCorporateUpgradeMessage());
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.TEAM_DOWNGRADE)) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            result.alternateText = translateLocal('workspaceActions.downgradedWorkspace');
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED)) {
            result.alternateText = Parser.htmlToText(getIntegrationSyncFailedMessage(lastAction, report?.policyID));
        } else if (
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY) ||
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CATEGORY) ||
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY) ||
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SET_CATEGORY_NAME)
        ) {
            result.alternateText = getWorkspaceCategoryUpdateMessage(lastAction);
        } else if (
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAX) ||
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_TAX) ||
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAX)
        ) {
            result.alternateText = getWorkspaceTaxUpdateMessage(lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST_NAME)) {
            result.alternateText = getCleanedTagName(getTagListNameUpdatedMessage(lastAction) ?? '');
        } else if (isTagModificationAction(lastAction?.actionName ?? '')) {
            result.alternateText = getCleanedTagName(getWorkspaceTagUpdateMessage(lastAction) ?? '');
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT)) {
            result.alternateText = getWorkspaceCustomUnitUpdatedMessage(lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CUSTOM_UNIT_RATE)) {
            result.alternateText = getWorkspaceCustomUnitRateAddedMessage(lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_RATE)) {
            result.alternateText = getWorkspaceCustomUnitRateUpdatedMessage(lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_RATE)) {
            result.alternateText = getWorkspaceCustomUnitRateDeletedMessage(lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_REPORT_FIELD)) {
            result.alternateText = getWorkspaceReportFieldAddMessage(lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REPORT_FIELD)) {
            result.alternateText = getWorkspaceReportFieldUpdateMessage(lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_REPORT_FIELD)) {
            result.alternateText = getWorkspaceReportFieldDeleteMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FIELD) {
            result.alternateText = getWorkspaceUpdateFieldMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_IS_ATTENDEE_TRACKING_ENABLED) {
            result.alternateText = getWorkspaceAttendeeTrackingUpdateMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSEMENT_ENABLED) {
            result.alternateText = getWorkspaceReimbursementUpdateMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT) {
            result.alternateText = getPolicyChangeLogMaxExpenseAmountNoReceiptMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT) {
            result.alternateText = getPolicyChangeLogMaxExpenseAmountMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_BILLABLE) {
            result.alternateText = getPolicyChangeLogDefaultBillableMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_REIMBURSABLE) {
            result.alternateText = getPolicyChangeLogDefaultReimbursableMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE_ENFORCED) {
            result.alternateText = getPolicyChangeLogDefaultTitleEnforcedMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_POLICY) {
            result.alternateText = getPolicyChangeLogEmployeeLeftMessage(lastAction, true);
        } else if (isCardIssuedAction(lastAction)) {
            result.alternateText = getCardIssuedMessage({reportAction: lastAction, expensifyCard: card});
        } else if (lastAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW && lastActorDisplayName && lastMessageTextFromReport) {
            const displayName = (lastMessageTextFromReport.length > 0 && getLastActorDisplayNameFromLastVisibleActions(report, lastActorDetails)) || lastActorDisplayName;
            result.alternateText = formatReportLastMessageText(`${displayName}: ${lastMessageText}`);
        } else if (lastAction && isOldDotReportAction(lastAction)) {
            result.alternateText = getMessageOfOldDotReportAction(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_DESCRIPTION) {
            result.alternateText = Parser.htmlToText(getUpdateRoomDescriptionMessage(lastAction));
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_AVATAR) {
            result.alternateText = getRoomAvatarUpdatedMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EMPLOYEE) {
            result.alternateText = getPolicyChangeLogAddEmployeeMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE) {
            result.alternateText = getPolicyChangeLogUpdateEmployee(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE) {
            result.alternateText = getPolicyChangeLogDeleteMemberMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_RATE) {
            result.alternateText = getReportActionMessageText(lastAction) ?? '';
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_INTEGRATION) {
            result.alternateText = getAddedConnectionMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_INTEGRATION) {
            result.alternateText = getRemovedConnectionMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUDIT_RATE) {
            result.alternateText = getUpdatedAuditRateMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_APPROVER_RULE) {
            result.alternateText = getAddedApprovalRuleMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_APPROVER_RULE) {
            result.alternateText = getDeletedApprovalRuleMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_APPROVER_RULE) {
            result.alternateText = getUpdatedApprovalRuleMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MANUAL_APPROVAL_THRESHOLD) {
            result.alternateText = getUpdatedManualApprovalThresholdMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.RETRACTED) {
            result.alternateText = getRetractedMessage();
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REOPENED) {
            result.alternateText = getReopenedMessage();
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE)) {
            result.alternateText = getTravelUpdateMessage(lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL) || isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.REROUTE)) {
            result.alternateText = Parser.htmlToText(getChangedApproverActionMessage(lastAction));
        } else {
            result.alternateText =
                lastMessageTextFromReport.length > 0
                    ? formatReportLastMessageText(Parser.htmlToText(lastMessageText))
                    : getLastVisibleMessage(report.reportID, result.isAllowedToComment, {}, lastAction)?.lastMessageText;

            if (!result.alternateText) {
                result.alternateText = formatReportLastMessageText(
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    getWelcomeMessage(report, policy, participantPersonalDetailListExcludeCurrentUser, localeCompare, isReportArchived).messageText ?? translateLocal('report.noActivityYet'),
                );
            }
        }
        result.alternateText = prefix + result.alternateText;
    } else {
        if (!lastMessageText) {
            lastMessageText = formatReportLastMessageText(
                // eslint-disable-next-line @typescript-eslint/no-deprecated, @typescript-eslint/prefer-nullish-coalescing
                getWelcomeMessage(report, policy, participantPersonalDetailListExcludeCurrentUser, localeCompare, isReportArchived).messageText || translateLocal('report.noActivityYet'),
            );
        }
        if (shouldShowLastActorDisplayName(report, lastActorDetails, lastAction) && !isReportArchived) {
            const displayName = (lastMessageTextFromReport.length > 0 && getLastActorDisplayNameFromLastVisibleActions(report, lastActorDetails)) || lastActorDisplayName;
            result.alternateText = `${displayName}: ${formatReportLastMessageText(lastMessageText)}`;
        } else {
            result.alternateText = formatReportLastMessageText(lastMessageText);
        }
    }

    result.isIOUReportOwner = isIOUOwnedByCurrentUser(result as Report);

    if (isJoinRequestInAdminRoom(report)) {
        result.isUnread = true;
    }

    if (!hasMultipleParticipants) {
        result.accountID = personalDetail?.accountID ?? CONST.DEFAULT_NUMBER_ID;
        result.login = personalDetail?.login ?? '';
        result.phoneNumber = personalDetail?.phoneNumber ?? '';
    }

    const reportName = getReportName(report, policy, undefined, undefined, invoiceReceiverPolicy, undefined, undefined, isReportArchived);

    result.text = reportName;
    result.subtitle = subtitle;
    result.participantsList = participantPersonalDetailList;

    result.icons = getIcons(
        report,
        personalDetails,
        personalDetail?.avatar,
        personalDetail?.login,
        personalDetail?.accountID ?? CONST.DEFAULT_NUMBER_ID,
        policy,
        invoiceReceiverPolicy,
        isReportArchived,
    );
    result.displayNamesWithTooltips = displayNamesWithTooltips;

    if (status) {
        result.status = status;
    }
    result.type = report.type;

    return result;
}

function getWelcomeMessage(
    report: OnyxEntry<Report>,
    policy: OnyxEntry<Policy>,
    participantPersonalDetailList: PersonalDetails[],
    localeCompare: LocaleContextProps['localeCompare'],
    isReportArchived = false,
    reportDetailsLink = '',
): WelcomeMessage {
    const welcomeMessage: WelcomeMessage = {};
    if (isChatThread(report) || isTaskReport(report)) {
        return welcomeMessage;
    }

    if (isChatRoom(report)) {
        return getRoomWelcomeMessage(report, isReportArchived, reportDetailsLink);
    }

    if (isPolicyExpenseChat(report)) {
        if (policy?.description) {
            welcomeMessage.messageHtml = policy.description;
            welcomeMessage.messageText = Parser.htmlToText(welcomeMessage.messageHtml);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            welcomeMessage.messageHtml = translateLocal('reportActionsView.beginningOfChatHistoryPolicyExpenseChat', {
                submitterDisplayName: getDisplayNameForParticipant({accountID: report?.ownerAccountID, formatPhoneNumber: formatPhoneNumberPhoneUtils}),
                workspaceName: getPolicyName({report}),
            });
            welcomeMessage.messageText = Parser.htmlToText(welcomeMessage.messageHtml);
        }
        return welcomeMessage;
    }

    if (isSelfDM(report)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        welcomeMessage.messageText = translateLocal('reportActionsView.beginningOfChatHistorySelfDM');
        return welcomeMessage;
    }

    if (isSystemChatUtil(report)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        welcomeMessage.messageText = translateLocal('reportActionsView.beginningOfChatHistorySystemDM');
        return welcomeMessage;
    }
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    welcomeMessage.phrase1 = translateLocal('reportActionsView.beginningOfChatHistory');
    const isMultipleParticipant = participantPersonalDetailList.length > 1;
    const displayNamesWithTooltips = getDisplayNamesWithTooltips(participantPersonalDetailList, isMultipleParticipant, localeCompare);
    const displayNamesWithTooltipsText = displayNamesWithTooltips
        .map(({displayName}, index) => {
            if (index === displayNamesWithTooltips.length - 1) {
                return `${displayName}.`;
            }
            if (index === displayNamesWithTooltips.length - 2) {
                if (displayNamesWithTooltips.length > 2) {
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    return `${displayName}, ${translateLocal('common.and')}`;
                }
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                return `${displayName} ${translateLocal('common.and')}`;
            }
            if (index < displayNamesWithTooltips.length - 2) {
                return `${displayName},`;
            }
            return '';
        })
        .join(' ');

    welcomeMessage.messageText = displayNamesWithTooltips.length ? ensureSingleSpacing(`${welcomeMessage.phrase1} ${displayNamesWithTooltipsText}`) : '';
    return welcomeMessage;
}

/**
 * Get welcome message based on room type
 */
function getRoomWelcomeMessage(report: OnyxEntry<Report>, isReportArchived = false, reportDetailsLink = ''): WelcomeMessage {
    const welcomeMessage: WelcomeMessage = {};
    const workspaceName = getPolicyName({report});
    const reportName = getReportName(report);

    if (report?.description) {
        welcomeMessage.messageHtml = getReportDescription(report);
        welcomeMessage.messageText = Parser.htmlToText(welcomeMessage.messageHtml);
        return welcomeMessage;
    }

    if (isReportArchived) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        welcomeMessage.messageHtml = translateLocal('reportActionsView.beginningOfArchivedRoom', {reportName, reportDetailsLink});
    } else if (isDomainRoom(report)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        welcomeMessage.messageHtml = translateLocal('reportActionsView.beginningOfChatHistoryDomainRoom', {domainRoom: report?.reportName ?? ''});
    } else if (isAdminRoom(report)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        welcomeMessage.messageHtml = translateLocal('reportActionsView.beginningOfChatHistoryAdminRoom', {workspaceName});
    } else if (isAnnounceRoom(report)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        welcomeMessage.messageHtml = translateLocal('reportActionsView.beginningOfChatHistoryAnnounceRoom', {workspaceName});
    } else if (isInvoiceRoom(report)) {
        const payer =
            report?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL
                ? getDisplayNameForParticipant({accountID: report?.invoiceReceiver?.accountID, formatPhoneNumber: formatPhoneNumberPhoneUtils})
                : // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
                  // eslint-disable-next-line @typescript-eslint/no-deprecated
                  getPolicy(report?.invoiceReceiver?.policyID)?.name;
        const receiver = getPolicyName({report});
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        welcomeMessage.messageHtml = translateLocal('reportActionsView.beginningOfChatHistoryInvoiceRoom', {
            invoicePayer: payer ?? '',
            invoiceReceiver: receiver,
        });
    } else {
        // Message for user created rooms or other room types.
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        welcomeMessage.messageHtml = translateLocal('reportActionsView.beginningOfChatHistoryUserRoom', {reportName, reportDetailsLink});
    }
    welcomeMessage.messageText = Parser.htmlToText(welcomeMessage.messageHtml);

    return welcomeMessage;
}

export default {
    getOptionData,
    sortReportsToDisplayInLHN,
    categorizeReportsForLHN,
    sortCategorizedReports,
    combineReportCategories,
    getWelcomeMessage,
    getReasonAndReportActionThatHasRedBrickRoad,
    shouldShowRedBrickRoad,
    getReportsToDisplayInLHN,
    updateReportsToDisplayInLHN,
};
