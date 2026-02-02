import {Str} from 'expensify-common';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import type {PartialPolicyForSidebar, ReportsToDisplayInLHN} from '@hooks/useSidebarOrderedReports';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {
    Card,
    PersonalDetails,
    PersonalDetailsList,
    ReportActions,
    ReportAttributesDerivedValue,
    ReportNameValuePairs,
    Transaction,
    TransactionViolation,
    VisibleReportActionsDerivedValue,
} from '@src/types/onyx';
import type Beta from '@src/types/onyx/Beta';
import type {ReportAttributes} from '@src/types/onyx/DerivedValues';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type Policy from '@src/types/onyx/Policy';
import type PriorityMode from '@src/types/onyx/PriorityMode';
import type Report from '@src/types/onyx/Report';
import type ReportAction from '@src/types/onyx/ReportAction';
import {formatPhoneNumber as formatPhoneNumberPhoneUtils} from './LocalePhoneNumber';
import {formatList} from './Localize';
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
    getAutoPayApprovedReportsEnabledMessage,
    getAutoReimbursementMessage,
    getCardIssuedMessage,
    getChangedApproverActionMessage,
    getCompanyAddressUpdateMessage,
    getCompanyCardConnectionBrokenMessage,
    getDefaultApproverUpdateMessage,
    getDeletedApprovalRuleMessage,
    getForwardsToUpdateMessage,
    getIntegrationSyncFailedMessage,
    getInvoiceCompanyNameUpdateMessage,
    getInvoiceCompanyWebsiteUpdateMessage,
    getLastVisibleMessage,
    getMessageOfOldDotReportAction,
    getOneTransactionThreadReportAction,
    getOriginalMessage,
    getPlaidBalanceFailureMessage,
    getPolicyChangeLogAddEmployeeMessage,
    getPolicyChangeLogDefaultBillableMessage,
    getPolicyChangeLogDefaultReimbursableMessage,
    getPolicyChangeLogDefaultTitleEnforcedMessage,
    getPolicyChangeLogDefaultTitleMessage,
    getPolicyChangeLogDeleteMemberMessage,
    getPolicyChangeLogEmployeeLeftMessage,
    getPolicyChangeLogMaxExpenseAgeMessage,
    getPolicyChangeLogMaxExpenseAmountMessage,
    getPolicyChangeLogMaxExpenseAmountNoReceiptMessage,
    getPolicyChangeLogUpdateEmployee,
    getReimburserUpdateMessage,
    getRemovedConnectionMessage,
    getRenamedAction,
    getReportAction,
    getReportActionActorAccountID,
    getReportActionMessageText,
    getRoomAvatarUpdatedMessage,
    getSettlementAccountLockedMessage,
    getSubmitsToUpdateMessage,
    getTagListNameUpdatedMessage,
    getTravelUpdateMessage,
    getUpdateACHAccountMessage,
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
    getWorkspaceFeatureEnabledMessage,
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
    isMoneyRequestAction,
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
    getIcons,
    getMovedTransactionMessage,
    getParticipantsAccountIDsForDisplay,
    getPolicyName,
    getReportDescription,
    getReportMetadata,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    getReportName,
    getReportNotificationPreference,
    getReportParticipantsTitle,
    getReportSubtitlePrefix,
    getUnreportedTransactionMessage,
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
        (report.isOwnPolicyExpenseChat && !isReportArchived);

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
        if (!report) {
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
            const requiresAttention = reportAttributes?.[report?.reportID]?.requiresAttention ?? false;
            const hasAttentionOrError = requiresAttention || hasErrorsOtherThanFailedReceipt;
            reportsToDisplay[reportID] = hasAttentionOrError ? {...report, requiresAttention, hasErrorsOtherThanFailedReceipt} : report;
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
        if (!report) {
            delete displayedReportsCopy[reportID];
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
            const requiresAttention = reportAttributes?.[report?.reportID]?.requiresAttention ?? false;
            const hasAttentionOrError = requiresAttention || hasErrorsOtherThanFailedReceipt;
            displayedReportsCopy[reportID] = hasAttentionOrError ? {...report, requiresAttention, hasErrorsOtherThanFailedReceipt} : report;
        } else {
            delete displayedReportsCopy[reportID];
        }
    }

    return displayedReportsCopy;
}
/**
 * Categorizes reports into their respective LHN groups
 */
function categorizeReportsForLHN(reportsToDisplay: ReportsToDisplayInLHN, reportsDrafts: OnyxCollection<string> | undefined, reportNameValuePairs?: OnyxCollection<ReportNameValuePairs>) {
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
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const displayName = getReportName(report);
        const miniReport: MiniReport = {
            reportID,
            displayName,
            lastVisibleActionCreated: report.lastVisibleActionCreated,
        };

        const isPinned = !!report.isPinned;
        const requiresAttention = !!report?.requiresAttention;
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
    const categories = categorizeReportsForLHN(reportsToDisplay, reportsDrafts, reportNameValuePairs);

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
    const transactionThreadReportAction = getOneTransactionThreadReportAction(report, chatReport, reportActions ?? []);

    if (transactionThreadReportAction) {
        const transactionID = isMoneyRequestAction(transactionThreadReportAction) ? getOriginalMessage(transactionThreadReportAction)?.IOUTransactionID : undefined;
        const transaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        if (hasReceiptError(transaction)) {
            return {
                reason: CONST.RBR_REASONS.HAS_ERRORS,
            };
        }
    }
    const transactionID = getTransactionID(report);
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
    translate,
    localeCompare,
    isReportArchived,
    lastActionReport,
    movedFromReport,
    movedToReport,
    currentUserAccountID,
    chatReport,
    visibleReportActionsData,
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
    translate: LocalizedTranslate;
    localeCompare: LocaleContextProps['localeCompare'];
    isReportArchived: boolean | undefined;
    lastActionReport: OnyxEntry<Report> | undefined;
    movedFromReport?: OnyxEntry<Report>;
    movedToReport?: OnyxEntry<Report>;
    currentUserAccountID: number;
    chatReport?: OnyxEntry<Report>;
    visibleReportActionsData?: VisibleReportActionsDerivedValue;
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
    const displayNamesWithTooltips = getDisplayNamesWithTooltips(
        (participantPersonalDetailList || []).slice(0, 10),
        hasMultipleParticipants,
        localeCompare,
        formatPhoneNumberPhoneUtils,
        undefined,
        isSelfDM(report),
    );

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

    const lastActorDisplayName = getLastActorDisplayName(lastActorDetails, currentUserAccountID);
    let lastMessageTextFromReport = lastMessageTextFromReportProp;
    if (!lastMessageTextFromReport) {
        lastMessageTextFromReport = getLastMessageTextForReport({
            translate,
            report,
            lastActorDetails,
            movedFromReport,
            movedToReport,
            policy,
            isReportArchived,
            visibleReportActionsDataParam: visibleReportActionsData,
            lastAction,
            currentUserAccountID,
            chatReport,
        });
    }

    // We need to remove sms domain in case the last message text has a phone number mention with sms domain.
    let lastMessageText = Str.removeSMSDomain(lastMessageTextFromReport);

    const isGroupChat = isGroupChatUtil(report) || isDeprecatedGroupDM(report, isReportArchived);

    const isThreadMessage = isThread(report) && lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT && lastAction?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    if ((result.isChatRoom || result.isPolicyExpenseChat || result.isThread || result.isTaskReport || isThreadMessage || isGroupChat) && !isReportArchived) {
        const lastActionName = lastAction?.actionName ?? report.lastActionType;
        const prefix = getReportSubtitlePrefix(report);

        if (isRenamedAction(lastAction)) {
            result.alternateText = getRenamedAction(translate, lastAction, isExpense, lastActorDisplayName);
        } else if (isTaskAction(lastAction)) {
            result.alternateText = formatReportLastMessageText(getTaskReportActionMessage(translate, lastAction).text);
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
            actorDisplayName = actorDetails ? getLastActorDisplayName(actorDetails, currentUserAccountID) : undefined;
            const lastActionOriginalMessage = lastAction?.actionName ? getOriginalMessage(lastAction) : null;
            const targetAccountIDs = lastActionOriginalMessage?.targetAccountIDs ?? [];
            const targetAccountIDsLength = targetAccountIDs.length !== 0 ? targetAccountIDs.length : (report.lastMessageHtml?.match(/<mention-user[^>]*><\/mention-user>/g)?.length ?? 0);
            const verb =
                lastActionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM || lastActionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM
                    ? translate('workspace.invite.invited')
                    : translate('workspace.invite.removed');
            const users = translate(targetAccountIDsLength > 1 ? 'common.members' : 'common.member')?.toLocaleLowerCase();
            result.alternateText = formatReportLastMessageText(`${actorDisplayName ?? lastActorDisplayName}: ${verb} ${targetAccountIDsLength} ${users}`);
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const roomName = getReportName(lastActionReport) || lastActionOriginalMessage?.roomName;
            if (roomName) {
                const preposition =
                    lastAction.actionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM || lastAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM
                        ? ` ${translate('workspace.invite.to')}`
                        : ` ${translate('workspace.invite.from')}`;
                result.alternateText += `${preposition} ${roomName}`;
            }
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME)) {
            result.alternateText = getWorkspaceNameUpdatedMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT) && getOriginalMessage(lastAction)?.resolution) {
            result.alternateText = getActionableCardFraudAlertResolutionMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DESCRIPTION)) {
            result.alternateText = getWorkspaceDescriptionUpdatedMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY)) {
            result.alternateText = getWorkspaceCurrencyUpdateMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REPORTING_FREQUENCY)) {
            result.alternateText = getWorkspaceFrequencyUpdateMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_UPGRADE)) {
            result.alternateText = translate('workspaceActions.upgradedWorkspace');
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_FORCE_UPGRADE)) {
            result.alternateText = Parser.htmlToText(translate('workspaceActions.forcedCorporateUpgrade'));
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.TEAM_DOWNGRADE)) {
            result.alternateText = translate('workspaceActions.downgradedWorkspace');
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED)) {
            result.alternateText = Parser.htmlToText(getIntegrationSyncFailedMessage(translate, lastAction, report?.policyID));
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.COMPANY_CARD_CONNECTION_BROKEN)) {
            result.alternateText = Parser.htmlToText(getCompanyCardConnectionBrokenMessage(translate, lastAction));
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.PLAID_BALANCE_FAILURE)) {
            result.alternateText = Parser.htmlToText(getPlaidBalanceFailureMessage(translate, lastAction));
        } else if (
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY) ||
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CATEGORY) ||
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY) ||
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SET_CATEGORY_NAME)
        ) {
            result.alternateText = getWorkspaceCategoryUpdateMessage(translate, lastAction);
        } else if (
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAX) ||
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_TAX) ||
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAX)
        ) {
            result.alternateText = getWorkspaceTaxUpdateMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST_NAME)) {
            result.alternateText = getCleanedTagName(getTagListNameUpdatedMessage(translate, lastAction) ?? '');
        } else if (isTagModificationAction(lastAction?.actionName ?? '')) {
            result.alternateText = getCleanedTagName(getWorkspaceTagUpdateMessage(translate, lastAction) ?? '');
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT)) {
            result.alternateText = getWorkspaceCustomUnitUpdatedMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CUSTOM_UNIT_RATE)) {
            result.alternateText = getWorkspaceCustomUnitRateAddedMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_RATE)) {
            result.alternateText = getWorkspaceCustomUnitRateUpdatedMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_RATE)) {
            result.alternateText = getWorkspaceCustomUnitRateDeletedMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_REPORT_FIELD)) {
            result.alternateText = getWorkspaceReportFieldAddMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REPORT_FIELD)) {
            result.alternateText = getWorkspaceReportFieldUpdateMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_REPORT_FIELD)) {
            result.alternateText = getWorkspaceReportFieldDeleteMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FIELD) {
            result.alternateText = getWorkspaceUpdateFieldMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FEATURE_ENABLED) {
            result.alternateText = getWorkspaceFeatureEnabledMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_IS_ATTENDEE_TRACKING_ENABLED) {
            result.alternateText = getWorkspaceAttendeeTrackingUpdateMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_PAY_APPROVED_REPORTS_ENABLED) {
            result.alternateText = getAutoPayApprovedReportsEnabledMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REIMBURSEMENT) {
            result.alternateText = getAutoReimbursementMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_APPROVER) {
            result.alternateText = getDefaultApproverUpdateMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_SUBMITS_TO) {
            result.alternateText = getSubmitsToUpdateMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FORWARDS_TO) {
            result.alternateText = getForwardsToUpdateMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_NAME) {
            result.alternateText = getInvoiceCompanyNameUpdateMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_WEBSITE) {
            result.alternateText = getInvoiceCompanyWebsiteUpdateMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSER) {
            result.alternateText = getReimburserUpdateMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSEMENT_ENABLED) {
            result.alternateText = getWorkspaceReimbursementUpdateMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ACH_ACCOUNT) {
            result.alternateText = getUpdateACHAccountMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ADDRESS) {
            result.alternateText = getCompanyAddressUpdateMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT) {
            result.alternateText = getPolicyChangeLogMaxExpenseAmountNoReceiptMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT) {
            result.alternateText = getPolicyChangeLogMaxExpenseAmountMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AGE) {
            result.alternateText = getPolicyChangeLogMaxExpenseAgeMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_BILLABLE) {
            result.alternateText = getPolicyChangeLogDefaultBillableMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_REIMBURSABLE) {
            result.alternateText = getPolicyChangeLogDefaultReimbursableMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE_ENFORCED) {
            result.alternateText = getPolicyChangeLogDefaultTitleEnforcedMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE) {
            result.alternateText = getPolicyChangeLogDefaultTitleMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_POLICY) {
            result.alternateText = getPolicyChangeLogEmployeeLeftMessage(translate, lastAction, true);
        } else if (isCardIssuedAction(lastAction)) {
            result.alternateText = getCardIssuedMessage({reportAction: lastAction, expensifyCard: card, translate});
        } else if (lastAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW && lastActorDisplayName && lastMessageTextFromReport) {
            const displayName =
                (lastMessageTextFromReport.length > 0 &&
                    getLastActorDisplayNameFromLastVisibleActions(report, lastActorDetails, currentUserAccountID, personalDetails, visibleReportActionsData, lastAction)) ||
                lastActorDisplayName;
            result.alternateText = formatReportLastMessageText(`${displayName}: ${lastMessageText}`);
        } else if (lastAction && isOldDotReportAction(lastAction)) {
            result.alternateText = getMessageOfOldDotReportAction(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_DESCRIPTION) {
            result.alternateText = Parser.htmlToText(getUpdateRoomDescriptionMessage(translate, lastAction));
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_AVATAR) {
            result.alternateText = getRoomAvatarUpdatedMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EMPLOYEE) {
            result.alternateText = getPolicyChangeLogAddEmployeeMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE) {
            result.alternateText = getPolicyChangeLogUpdateEmployee(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE) {
            result.alternateText = getPolicyChangeLogDeleteMemberMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION)) {
            result.alternateText = Parser.htmlToText(getUnreportedTransactionMessage(translate, lastAction));
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_RATE) {
            result.alternateText = getReportActionMessageText(lastAction) ?? '';
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_INTEGRATION) {
            result.alternateText = getAddedConnectionMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_INTEGRATION) {
            result.alternateText = getRemovedConnectionMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUDIT_RATE) {
            result.alternateText = getUpdatedAuditRateMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_APPROVER_RULE) {
            result.alternateText = getAddedApprovalRuleMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_APPROVER_RULE) {
            result.alternateText = getDeletedApprovalRuleMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_APPROVER_RULE) {
            result.alternateText = getUpdatedApprovalRuleMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MANUAL_APPROVAL_THRESHOLD) {
            result.alternateText = getUpdatedManualApprovalThresholdMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.RETRACTED) {
            result.alternateText = translate('iou.retracted');
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REOPENED) {
            result.alternateText = translate('iou.reopened');
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE)) {
            result.alternateText = getTravelUpdateMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL) || isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.REROUTE)) {
            result.alternateText = Parser.htmlToText(getChangedApproverActionMessage(translate, lastAction));
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION)) {
            result.alternateText = Parser.htmlToText(getMovedTransactionMessage(translate, lastAction));
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.SETTLEMENT_ACCOUNT_LOCKED)) {
            result.alternateText = Parser.htmlToText(getSettlementAccountLockedMessage(translate, lastAction));
        } else {
            result.alternateText =
                lastMessageTextFromReport.length > 0
                    ? formatReportLastMessageText(Parser.htmlToText(lastMessageText))
                    : getLastVisibleMessage(report.reportID, result.isAllowedToComment, {}, lastAction)?.lastMessageText;

            if (!result.alternateText) {
                result.alternateText = formatReportLastMessageText(
                    getWelcomeMessage(report, policy, participantPersonalDetailListExcludeCurrentUser, translate, localeCompare, isReportArchived).messageText ??
                        translate('report.noActivityYet'),
                );
            }
        }
        result.alternateText = prefix + result.alternateText;
    } else {
        if (!lastMessageText) {
            lastMessageText = formatReportLastMessageText(
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                getWelcomeMessage(report, policy, participantPersonalDetailListExcludeCurrentUser, translate, localeCompare, isReportArchived).messageText ||
                    translate('report.noActivityYet'),
            );
        }
        if (shouldShowLastActorDisplayName(report, lastActorDetails, lastAction, currentUserAccountID) && !isReportArchived) {
            const displayName =
                (lastMessageTextFromReport.length > 0 &&
                    getLastActorDisplayNameFromLastVisibleActions(report, lastActorDetails, currentUserAccountID, personalDetails, visibleReportActionsData, lastAction)) ||
                lastActorDisplayName;
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

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const reportName = getReportName(report, policy, undefined, undefined, invoiceReceiverPolicy, undefined, undefined, isReportArchived);

    result.text = reportName;
    result.subtitle = subtitle;
    result.participantsList = participantPersonalDetailList;

    result.icons = getIcons(
        report,
        formatPhoneNumberPhoneUtils,
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
    translate: LocalizedTranslate,
    localeCompare: LocaleContextProps['localeCompare'],
    isReportArchived = false,
    reportDetailsLink = '',
    shouldShowUsePlusButtonText = false,
    additionalText = '',
): WelcomeMessage {
    const welcomeMessage: WelcomeMessage = {};
    if (isChatThread(report) || isTaskReport(report)) {
        return welcomeMessage;
    }

    if (isChatRoom(report)) {
        return getRoomWelcomeMessage(translate, report, isReportArchived, reportDetailsLink);
    }

    if (isPolicyExpenseChat(report)) {
        if (policy?.description) {
            welcomeMessage.messageHtml = policy.description;
            welcomeMessage.messageText = Parser.htmlToText(welcomeMessage.messageHtml);
        } else {
            welcomeMessage.messageHtml = translate(
                'reportActionsView.beginningOfChatHistoryPolicyExpenseChat',
                getPolicyName({report}),
                getDisplayNameForParticipant({accountID: report?.ownerAccountID, formatPhoneNumber: formatPhoneNumberPhoneUtils}),
            );
            welcomeMessage.messageText = Parser.htmlToText(welcomeMessage.messageHtml);
        }
        return welcomeMessage;
    }

    if (isSelfDM(report)) {
        welcomeMessage.messageText = translate('reportActionsView.beginningOfChatHistorySelfDM');
        return welcomeMessage;
    }

    if (isSystemChatUtil(report)) {
        welcomeMessage.messageText = translate('reportActionsView.beginningOfChatHistorySystemDM');
        return welcomeMessage;
    }
    const isMultipleParticipant = participantPersonalDetailList.length > 1;
    const displayNamesWithTooltips = getDisplayNamesWithTooltips(participantPersonalDetailList, isMultipleParticipant, localeCompare, formatPhoneNumberPhoneUtils);

    if (!displayNamesWithTooltips.length) {
        return welcomeMessage;
    }

    const userTags = displayNamesWithTooltips.map(({displayName, accountID}) => `<user-details accountid="${accountID}">${displayName ?? ''}</user-details>`);
    const usersHtml = formatList(userTags);

    let messageHtml = translate('reportActionsView.beginningOfChatHistory', usersHtml);

    // Append additional text for plus button or Concierge
    if (shouldShowUsePlusButtonText) {
        messageHtml += translate('reportActionsView.usePlusButton', {additionalText});
    }
    if (isConciergeChatReport(report)) {
        messageHtml += translate('reportActionsView.askConcierge');
    }

    welcomeMessage.messageHtml = messageHtml;
    welcomeMessage.messageText = Parser.htmlToText(welcomeMessage.messageHtml);
    return welcomeMessage;
}

/**
 * Get welcome message based on room type
 */
function getRoomWelcomeMessage(translate: LocalizedTranslate, report: OnyxEntry<Report>, isReportArchived = false, reportDetailsLink = ''): WelcomeMessage {
    const welcomeMessage: WelcomeMessage = {};
    const workspaceName = getPolicyName({report});
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const reportName = getReportName(report);

    if (report?.description) {
        welcomeMessage.messageHtml = getReportDescription(report);
        welcomeMessage.messageText = Parser.htmlToText(welcomeMessage.messageHtml);
        return welcomeMessage;
    }

    if (isReportArchived) {
        welcomeMessage.messageHtml = translate('reportActionsView.beginningOfArchivedRoom', reportName, reportDetailsLink);
    } else if (isDomainRoom(report)) {
        welcomeMessage.messageHtml = translate('reportActionsView.beginningOfChatHistoryDomainRoom', report?.reportName ?? '');
    } else if (isAdminRoom(report)) {
        welcomeMessage.messageHtml = translate('reportActionsView.beginningOfChatHistoryAdminRoom', workspaceName);
    } else if (isAnnounceRoom(report)) {
        welcomeMessage.messageHtml = translate('reportActionsView.beginningOfChatHistoryAnnounceRoom', workspaceName);
    } else if (isInvoiceRoom(report)) {
        const payer =
            report?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL
                ? getDisplayNameForParticipant({accountID: report?.invoiceReceiver?.accountID, formatPhoneNumber: formatPhoneNumberPhoneUtils})
                : // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
                  // eslint-disable-next-line @typescript-eslint/no-deprecated
                  getPolicy(report?.invoiceReceiver?.policyID)?.name;
        const receiver = getPolicyName({report});
        welcomeMessage.messageHtml = translate('reportActionsView.beginningOfChatHistoryInvoiceRoom', payer ?? '', receiver);
    } else {
        // Message for user created rooms or other room types.
        welcomeMessage.messageHtml = translate('reportActionsView.beginningOfChatHistoryUserRoom', reportName, reportDetailsLink);
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
