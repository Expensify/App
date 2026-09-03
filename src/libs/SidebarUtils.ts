import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';
import type {ReportsToDisplayInLHN} from '@hooks/useSidebarOrderedReports';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {
    Card,
    GuideAccountIDsDerivedValue,
    PersonalDetails,
    PersonalDetailsList,
    PolicyTagLists,
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

import type {Locale as DateFnsLocale} from 'date-fns';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import type {OptionData} from './ReportUtils';

import {isAnonymousUser} from './actions/Session';
import Log from './Log';
import {shouldUseFullTitleForOption} from './OptionsListUtils';
import {getPersonalDetailsForAccountIDs} from './PersonalDetailsUtils';
import {getIOUReportIDFromReportActionPreview, getReportAction} from './ReportActionsUtils';
import {getReportAlternateText, getWelcomeMessage} from './ReportAlternateTextUtils';
import {deprecatedGetReportName} from './ReportNameUtils';
import {
    canUserPerformWriteAction as canUserPerformWriteActionUtil,
    excludeParticipantsForDisplay,
    getAllReportActionsErrorsAndReportActionThatRequiresAttention,
    getChatRoomSubtitle,
    getDisplayNamesWithTooltips,
    getIcons,
    getParticipantsAccountIDsForDisplay,
    getPendingDeleteMemberAccountIDs,
    getReceiptUploadErrorReason,
    getReportMetadata,
    getReportNotificationPreference,
    getReportParticipantsTitle,
    getViolatingReportIDForRBRInLHN,
    hasExpensifyGuidesEmails,
    hasReportErrorsOtherThanFailedReceipt,
    isArchivedNonExpenseReport,
    isArchivedReport,
    isChatRoom,
    isChatThread,
    isConciergeChatReport,
    isExpenseReport,
    isExpenseRequest,
    isHiddenForCurrentUser,
    isInvoiceReport,
    isIOUOwnedByCurrentUser,
    isJoinRequestInAdminRoom,
    isMoneyRequestReport,
    isOneOnOneChat,
    isOneTransactionThread,
    isPolicyExpenseChat,
    isPublicRoom,
    isSelfDM,
    isSystemChat as isSystemChatUtil,
    isTaskReport,
    isTripRoom,
    isUnread,
    isUnreadWithMention,
    isWorkspaceTaskReport,
    shouldReportBeInOptionList,
    shouldReportShowSubscript,
} from './ReportUtils';

function compareStringDates(a: string, b: string): 0 | 1 | -1 {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
}

const NUMERIC_PAD_WIDTH = 15;
const DIGIT_SEQUENCE = /\d+/g;

/**
 * Persists across renders so sort keys are computed at most once per unique display name.
 */
const sortKeyCache = new Map<string, string>();

/**
 * Reports already reported by the `[ChatReportLHN]` diagnostic log, so a stuck row is logged once per session
 * instead of on every LHN recompute.
 */
const loggedChatReportIDs = new Set<string>();

/**
 * Builds a normalized sort key for fast string comparison using plain < / > operators.
 * Lowercases the name and zero-pads numeric segments ("Report 2" → "report 000000000000002")
 * so that numeric ordering is preserved without Intl.Collator.
 *
 * Results are cached at module level so each unique name pays the cost only once.
 */
function buildSortKey(displayName: string): string {
    const cached = sortKeyCache.get(displayName);
    if (cached !== undefined) {
        return cached;
    }

    const key = displayName.toLowerCase().replaceAll(DIGIT_SEQUENCE, (match) => match.padStart(NUMERIC_PAD_WIDTH, '0'));
    sortKeyCache.set(displayName, key);
    return key;
}

/**
 * A mini report object that contains only the necessary information to sort reports.
 * This is used to avoid copying the entire report object and only the necessary information.
 */
type MiniReport = {
    reportID?: string;
    displayName: string;
    sortKey: string;
    lastVisibleActionCreated?: string;
};

type ShouldDisplayReportInLHNParams = {
    report: Report;
    reports: OnyxCollection<Report>;
    currentReportId: string | undefined;
    isInFocusMode: boolean;
    betas: OnyxEntry<Beta[]>;
    transactionViolations: OnyxCollection<TransactionViolation[]>;
    draftComment: OnyxEntry<string>;
    transactions: OnyxCollection<Transaction>;
    isOffline: boolean;
    isReportArchived?: boolean;
    reportAttributes?: ReportAttributesDerivedValue['reports'];
    currentUserLogin: string;
    currentUserAccountID: number;
    hasGuidesEmails: boolean;
    conciergeReportID: string | undefined;
};

function shouldDisplayReportInLHN({
    report,
    reports,
    currentReportId,
    isInFocusMode,
    betas,
    transactionViolations,
    draftComment,
    transactions,
    isOffline,
    isReportArchived,
    reportAttributes,
    currentUserAccountID,
    currentUserLogin,
    conciergeReportID,
    hasGuidesEmails,
}: ShouldDisplayReportInLHNParams) {
    if (!report) {
        return {shouldDisplay: false};
    }

    if ((Object.values(CONST.REPORT.UNSUPPORTED_TYPE) as string[]).includes(report?.type ?? '')) {
        return {shouldDisplay: false};
    }

    // Get report metadata and status
    const parentReportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
    const doesReportHaveViolations = !!getViolatingReportIDForRBRInLHN(report, transactionViolations);
    const isHidden = isHiddenForCurrentUser(report);
    const isFocused = report.reportID === currentReportId;
    const chatReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`];
    const parentReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`];
    const hasErrorsOtherThanFailedReceipt = hasReportErrorsOtherThanFailedReceipt(report, chatReport, doesReportHaveViolations, transactionViolations, transactions, reportAttributes);
    const isReportInAccessible = report?.errorFields?.notFound;
    if (isOneTransactionThread(report, parentReport, parentReportAction, isOffline)) {
        return {shouldDisplay: false};
    }

    // Handle reports with errors
    if (hasErrorsOtherThanFailedReceipt && !isReportInAccessible) {
        return {shouldDisplay: true, hasErrorsOtherThanFailedReceipt: true};
    }

    // Check if report should override hidden status
    const requiresAttention = reportAttributes?.[report?.reportID]?.requiresAttention;
    const isSystemChat = isSystemChatUtil(report);
    const shouldOverrideHidden =
        !!draftComment ||
        hasErrorsOtherThanFailedReceipt ||
        isFocused ||
        // An anonymous user can only access public rooms, and such a room's notification preference
        // defaults to `hidden`. Without this, opening a thread inside the room (which steals focus)
        // drops the room from the LHN, leaving the anon user unable to return to it. See #92672.
        (isPublicRoom(report) && isAnonymousUser()) ||
        isSystemChat ||
        !!report.isPinned ||
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        requiresAttention ||
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
        requiresAttention,
        currentUserLogin,
        currentUserAccountID,
        conciergeReportID,
        hasGuidesEmails,
    });

    return {shouldDisplay};
}

function getReportsToDisplayInLHN({
    currentReportId,
    reports,
    betas,
    priorityMode,
    draftComments,
    transactionViolations,
    transactions,
    isOffline,
    currentUserLogin,
    currentUserAccountID,
    reportNameValuePairs,
    reportAttributes,
    conciergeReportID,
    guideAccountIDs,
}: {
    currentReportId: string | undefined;
    reports: OnyxCollection<Report>;
    betas: OnyxEntry<Beta[]>;
    priorityMode: OnyxEntry<PriorityMode>;
    draftComments: OnyxCollection<string>;
    transactionViolations: OnyxCollection<TransactionViolation[]>;
    transactions: OnyxCollection<Transaction>;
    isOffline: boolean;
    currentUserLogin: string;
    currentUserAccountID: number;
    reportNameValuePairs?: OnyxCollection<ReportNameValuePairs>;
    reportAttributes?: ReportAttributesDerivedValue['reports'];
    guideAccountIDs?: GuideAccountIDsDerivedValue;
    conciergeReportID: string | undefined;
}) {
    const isInFocusMode = priorityMode === CONST.PRIORITY_MODE.GSD;
    const allReportsDictValues = reports ?? {};
    const reportsToDisplay: ReportsToDisplayInLHN = {};

    for (const [reportID, report] of Object.entries(allReportsDictValues)) {
        if (!report) {
            continue;
        }

        const reportDraftComment = draftComments?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${report.reportID}`];
        const isReportArchived = isArchivedReport(reportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`]);

        const {shouldDisplay, hasErrorsOtherThanFailedReceipt} = shouldDisplayReportInLHN({
            report,
            reports,
            currentReportId,
            isInFocusMode,
            betas,
            transactionViolations,
            draftComment: reportDraftComment,
            transactions,
            isOffline,
            isReportArchived,
            reportAttributes,
            currentUserLogin,
            hasGuidesEmails: hasExpensifyGuidesEmails(Object.keys(report.participants ?? {}).map(Number), guideAccountIDs),
            currentUserAccountID,
            conciergeReportID,
        });

        if (shouldDisplay) {
            const requiresAttention = reportAttributes?.[report?.reportID]?.requiresAttention ?? false;
            const isUnreadReport = getIsUnreadReportForInboxTab(report, isReportArchived);
            reportsToDisplay[reportID] =
                requiresAttention || hasErrorsOtherThanFailedReceipt || isUnreadReport ? {...report, requiresAttention, hasErrorsOtherThanFailedReceipt, isUnreadReport} : report;
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
    transactions: OnyxCollection<Transaction>;
    isOffline: boolean;
    currentUserLogin: string;
    currentUserAccountID: number;
    guideAccountIDs?: GuideAccountIDsDerivedValue;
    conciergeReportID: string | undefined;
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
    transactions,
    isOffline,
    currentUserLogin,
    currentUserAccountID,
    conciergeReportID,
    guideAccountIDs,
}: UpdateReportsToDisplayInLHNProps) {
    // Use a lazy copy to avoid creating a new object reference when no entries actually change.
    let displayedReportsCopy: ReportsToDisplayInLHN | undefined;
    const getMutableCopy = (): ReportsToDisplayInLHN => {
        if (!displayedReportsCopy) {
            displayedReportsCopy = {...displayedReports};
        }
        return displayedReportsCopy;
    };

    for (const reportID of updatedReportsKeys) {
        const report = reports?.[reportID];
        if (!report) {
            if (reportID in displayedReports) {
                delete getMutableCopy()[reportID];
            }
            continue;
        }

        // Get the specific draft comment for this report instead of using a single draft comment for all reports
        // This fixes the issue where the current report's draft comment was incorrectly used to filter all reports
        const reportDraftComment = draftComments?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${report.reportID}`];
        const isReportArchived = isArchivedReport(reportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`] ?? {});

        const {shouldDisplay, hasErrorsOtherThanFailedReceipt} = shouldDisplayReportInLHN({
            report,
            reports,
            currentReportId,
            isInFocusMode,
            betas,
            transactionViolations,
            draftComment: reportDraftComment,
            transactions,
            isOffline,
            isReportArchived,
            reportAttributes,
            currentUserLogin,
            hasGuidesEmails: hasExpensifyGuidesEmails(Object.keys(report.participants ?? {}).map(Number), guideAccountIDs),
            currentUserAccountID,
            conciergeReportID,
        });

        if (shouldDisplay) {
            const requiresAttention = reportAttributes?.[report?.reportID]?.requiresAttention ?? false;
            const isUnreadReport = getIsUnreadReportForInboxTab(report, isReportArchived);
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            const hasFlags = requiresAttention || hasErrorsOtherThanFailedReceipt || isUnreadReport;
            const existingEntry = displayedReports[reportID];

            if (hasFlags) {
                if (
                    existingEntry !== report ||
                    existingEntry?.requiresAttention !== requiresAttention ||
                    existingEntry?.hasErrorsOtherThanFailedReceipt !== hasErrorsOtherThanFailedReceipt ||
                    existingEntry?.isUnreadReport !== isUnreadReport
                ) {
                    getMutableCopy()[reportID] = {...report, requiresAttention, hasErrorsOtherThanFailedReceipt, isUnreadReport};
                }
            } else if (existingEntry !== report) {
                getMutableCopy()[reportID] = report;
            }
        } else if (reportID in displayedReports) {
            delete getMutableCopy()[reportID];
        }
    }

    return displayedReportsCopy ?? displayedReports;
}
/**
 * Categorizes reports into their respective LHN groups
 */
function categorizeReportsForLHN(
    reportsToDisplay: ReportsToDisplayInLHN,
    reportsDrafts: Record<string, boolean> | undefined,
    reportAttributes: ReportAttributesDerivedValue['reports'] | undefined,
    reportNameValuePairs?: OnyxCollection<ReportNameValuePairs>,
) {
    sortKeyCache.clear();

    const pinnedAndGBRReports: MiniReport[] = [];
    const errorReports: MiniReport[] = [];
    const draftReports: MiniReport[] = [];
    const nonArchivedReports: MiniReport[] = [];
    const archivedReports: MiniReport[] = [];

    for (const report of Object.values(reportsToDisplay)) {
        if (!report) {
            continue;
        }

        const reportID = report.reportID;
        const displayName = deprecatedGetReportName(report, reportAttributes);
        const miniReport: MiniReport = {
            reportID,
            displayName,
            sortKey: buildSortKey(displayName),
            lastVisibleActionCreated: report.lastVisibleActionCreated,
        };

        const isPinned = !!report.isPinned;
        const requiresAttention = !!report?.requiresAttention;

        if (isPinned || requiresAttention) {
            pinnedAndGBRReports.push(miniReport);
            continue;
        }

        const reportNameValuePairsKey = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`;
        const rNVPs = reportNameValuePairs?.[reportNameValuePairsKey];
        const isArchived = isArchivedNonExpenseReport(report, !!rNVPs?.private_isArchived);
        const hasErrors = !!report.hasErrorsOtherThanFailedReceipt && !isArchived;

        if (hasErrors) {
            errorReports.push(miniReport);
        } else if (reportsDrafts?.[reportID]) {
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

    const compareDisplayNames = (a: MiniReport, b: MiniReport) => {
        if (a.sortKey < b.sortKey) {
            return -1;
        }
        if (a.sortKey > b.sortKey) {
            return 1;
        }
        if (!a.displayName || !b.displayName) {
            return 0;
        }
        // Sort keys tied — fall back to Collator for locale-correct ordering
        return localeCompare(a.displayName, b.displayName);
    };

    const compareDatesDesc = (a: MiniReport, b: MiniReport) =>
        a?.lastVisibleActionCreated && b?.lastVisibleActionCreated ? compareStringDates(b.lastVisibleActionCreated, a.lastVisibleActionCreated) : 0;

    const compareNonArchivedDefault = (a: MiniReport, b: MiniReport) => {
        const compareDates = compareDatesDesc(a, b);
        return compareDates !== 0 ? compareDates : compareDisplayNames(a, b);
    };

    const sortIfNeeded = <T>(arr: T[], compareFn: (a: T, b: T) => number): T[] => (arr.length < 2 ? arr : arr.sort(compareFn));

    // Sort each group of reports accordingly
    const sortedPinnedAndGBRReports = sortIfNeeded(pinnedAndGBRReports, compareDisplayNames);
    const sortedErrorReports = sortIfNeeded(errorReports, compareDisplayNames);
    const sortedDraftReports = sortIfNeeded(draftReports, compareDisplayNames);

    let sortedNonArchivedReports: MiniReport[];
    let sortedArchivedReports: MiniReport[];

    if (isInDefaultMode) {
        sortedNonArchivedReports = sortIfNeeded(nonArchivedReports, compareNonArchivedDefault);
        sortedArchivedReports = sortIfNeeded(archivedReports, compareDatesDesc);
    } else {
        sortedNonArchivedReports = sortIfNeeded(nonArchivedReports, compareDisplayNames);
        sortedArchivedReports = sortIfNeeded(archivedReports, compareDisplayNames);
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
    const result: string[] = [];
    const groups = [pinnedAndGBRReports, errorReports, draftReports, nonArchivedReports, archivedReports];
    for (const group of groups) {
        for (const report of group) {
            if (report?.reportID) {
                result.push(report.reportID);
            }
        }
    }
    return result;
}

/**
 * @returns An array of reportIDs sorted in the proper order
 */
function sortReportsToDisplayInLHN(
    reportsToDisplay: ReportsToDisplayInLHN,
    priorityMode: OnyxEntry<PriorityMode>,
    localeCompare: LocaleContextProps['localeCompare'],
    reportsDrafts: Record<string, boolean> | undefined,
    reportNameValuePairs: OnyxCollection<ReportNameValuePairs> | undefined,
    reportAttributes: ReportAttributesDerivedValue['reports'] | undefined,
): string[] {
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
    const categories = categorizeReportsForLHN(reportsToDisplay, reportsDrafts, reportAttributes, reportNameValuePairs);

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

    return result;
}

type ReasonAndReportActionThatHasRedBrickRoad = {
    reason: ValueOf<typeof CONST.RBR_REASONS>;
    reportAction?: OnyxEntry<ReportAction>;
};

type GetReasonAndReportActionThatHasRedBrickRoadParams = {
    report: Report;
    chatReport: OnyxEntry<Report>;
    reportActions: OnyxEntry<ReportActions>;
    hasViolations: boolean;
    reportErrors: Errors;
    transactions: OnyxCollection<Transaction>;
    isOffline: boolean;
    currentUserAccountID: number;
    transactionViolations?: OnyxCollection<TransactionViolation[]>;
    isReportArchived?: boolean;
    reports?: OnyxCollection<Report>;
};

function getReasonAndReportActionThatHasRedBrickRoad({
    report,
    chatReport,
    reportActions,
    hasViolations,
    reportErrors,
    transactions,
    isOffline,
    currentUserAccountID,
    transactionViolations,
    isReportArchived = false,
    reports,
}: GetReasonAndReportActionThatHasRedBrickRoadParams): ReasonAndReportActionThatHasRedBrickRoad | null {
    if (isReportArchived) {
        return null;
    }

    const violatingReportID = getViolatingReportIDForRBRInLHN(report, transactionViolations);
    if (violatingReportID) {
        const reportPreviewAction = Object.values(reportActions ?? {}).find((action) => getIOUReportIDFromReportActionPreview(action) === violatingReportID);
        return {
            reason: CONST.RBR_REASONS.HAS_TRANSACTION_THREAD_VIOLATIONS,
            reportAction: reportPreviewAction,
        };
    }

    const {reportAction} = getAllReportActionsErrorsAndReportActionThatRequiresAttention(report, reportActions, transactions, currentUserAccountID, isReportArchived, reports);
    const errors = reportErrors;
    const hasErrors = Object.keys(errors).length !== 0;

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

    return getReceiptUploadErrorReason(report, chatReport, reportActions, transactions, isOffline);
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
    conciergeReportID,
    invoiceReceiverPolicy,
    lastMessageTextFromReport: lastMessageTextFromReportProp,
    card,
    lastAction,
    translate,
    dateFnsLocale,
    convertToDisplayString,
    localeCompare,
    isReportArchived,
    lastActionReport,
    movedFromReport,
    movedToReport,
    currentUserAccountID,
    visibleReportActionsData,
    reportAttributesDerived,
    policyTags,
    currentUserLogin,
    isTrackIntentUser,
    formatPhoneNumber,
}: {
    report: OnyxEntry<Report>;
    oneTransactionThreadReport: OnyxEntry<Report>;
    reportNameValuePairs: OnyxEntry<ReportNameValuePairs>;
    personalDetails: OnyxEntry<PersonalDetailsList>;
    policy: OnyxEntry<Policy>;
    parentReportAction: OnyxEntry<ReportAction> | undefined;
    conciergeReportID: string | undefined;
    invoiceReceiverPolicy: OnyxEntry<Policy>;
    lastMessageTextFromReport?: string;
    reportAttributes: OnyxEntry<ReportAttributes>;
    card: Card | undefined;
    lastAction: ReportAction | undefined;
    translate: LocalizedTranslate;
    dateFnsLocale: DateFnsLocale | undefined;
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
    localeCompare: LocaleContextProps['localeCompare'];
    isReportArchived: boolean | undefined;
    lastActionReport: OnyxEntry<Report>;
    movedFromReport?: OnyxEntry<Report>;
    movedToReport?: OnyxEntry<Report>;
    currentUserAccountID: number;
    visibleReportActionsData?: VisibleReportActionsDerivedValue;
    reportAttributesDerived?: ReportAttributesDerivedValue['reports'];
    policyTags?: OnyxEntry<PolicyTagLists>;
    currentUserLogin: string;
    isTrackIntentUser?: boolean;
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
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
        keyForList: '',
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
    result.private_isArchived = !!reportNameValuePairs?.private_isArchived;
    result.isPolicyExpenseChat = isPolicyExpenseChat(report);
    result.isExpenseRequest = isExpenseRequest(report);
    result.isMoneyRequestReport = isMoneyRequestReport(report);
    const rawShouldShowSubscript = shouldReportShowSubscript(report, isReportArchived);
    const isWorkspaceExpenseRequest = isExpenseRequest(report) && !!policy && policy.type !== CONST.POLICY.TYPE.PERSONAL;
    const threadSuppression = isChatThread(report) && !isTripRoom(report) && !isWorkspaceExpenseRequest;
    // For tasks, the header resolves the parent action via chatReportID (not parentReportID).
    // When chatReportID is absent (offline/nested tasks), the action can't be resolved — treat as "no action".
    const taskParentAction = isTaskReport(report) && !report.chatReportID ? undefined : parentReportAction;
    const isReportPreviewOrNoAction = !taskParentAction || taskParentAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW;
    const taskSuppression = isTaskReport(report) && !(isWorkspaceTaskReport(report) && isReportPreviewOrNoAction);
    result.shouldShowSubscript = rawShouldShowSubscript && !threadSuppression && !taskSuppression;
    result.pendingAction = report.pendingFields?.addWorkspaceRoom ?? report.pendingFields?.createChat;
    result.brickRoadIndicator = reportAttributes?.brickRoadStatus;
    result.actionBadge = reportAttributes?.actionBadge;
    result.actionTargetReportActionID = reportAttributes?.actionTargetReportActionID;
    result.ownerAccountID = report.ownerAccountID;
    result.managerID = report.managerID;
    result.reportID = report.reportID;
    result.chatReportID = report.chatReportID;
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
    result.parentReportActionID = report.parentReportActionID;
    result.isWaitingOnBankAccount = report.isWaitingOnBankAccount;
    result.notificationPreference = getReportNotificationPreference(report);
    result.isAllowedToComment = canUserPerformWriteActionUtil(report, isReportArchived);
    result.chatType = report.chatType;
    result.isDeletedParentAction = report.isDeletedParentAction;
    result.isSelfDM = isSelfDM(report);
    result.tooltipText = getReportParticipantsTitle(visibleParticipantAccountIDs);
    result.hasOutstandingChildTask = report.hasOutstandingChildTask;
    result.hasParentAccess = report.hasParentAccess;
    result.isConciergeChat = isConciergeChatReport(report, conciergeReportID);
    result.participants = report.participants;

    const isExpense = isExpenseReport(report);
    const hasMultipleParticipants = participantPersonalDetailList.length > 1 || result.isChatRoom || result.isPolicyExpenseChat || isExpense;
    const subtitle = getChatRoomSubtitle(report, policy, conciergeReportID, translate, false, isReportArchived);

    const status = personalDetail?.status ?? '';

    const isOneOnOneChatReport = isOneOnOneChat(report);
    result.isOneOnOneChat = isOneOnOneChatReport;

    // For 1:1 DMs, add the other participant's selected timezone
    if (isOneOnOneChatReport) {
        const recipientPersonalDetail = participantPersonalDetailListExcludeCurrentUser.at(0);
        result.timezone = recipientPersonalDetail?.timezone;
    }

    // We only create tooltips for the first 10 users or so since some reports have hundreds of users, causing performance to degrade.
    const displayNamesWithTooltips = getDisplayNamesWithTooltips(
        (participantPersonalDetailList || []).slice(0, 10),
        hasMultipleParticipants,
        localeCompare,
        formatPhoneNumber,
        translate,
        undefined,
        isSelfDM(report),
    );

    result.alternateText = getReportAlternateText({
        report,
        lastAction,
        lastActionReport,
        movedFromReport,
        movedToReport,
        card,
        lastMessageTextFromReport: lastMessageTextFromReportProp,
        personalDetails,
        policy,
        invoiceReceiverPolicy,
        policyTags,
        isReportArchived,
        privateIsArchived: !!reportNameValuePairs?.private_isArchived,
        conciergeReportID,
        reportAttributesDerived,
        visibleReportActionsData,
        currentUserAccountID,
        currentUserLogin,
        isTrackIntentUser,
        translate,
        localeCompare,
        formatPhoneNumber,
        dateFnsLocale,
        convertToDisplayString,
    });

    result.isIOUReportOwner = isIOUOwnedByCurrentUser(result as Report);

    if (isJoinRequestInAdminRoom(report, currentUserLogin)) {
        result.isUnread = true;
    }

    if (!hasMultipleParticipants) {
        result.accountID = personalDetail?.accountID ?? CONST.DEFAULT_NUMBER_ID;
        result.login = personalDetail?.login ?? '';
        result.phoneNumber = personalDetail?.phoneNumber ?? '';
    }

    const reportName = deprecatedGetReportName(report, reportAttributesDerived);

    if (reportName !== CONST.REPORT.DEFAULT_REPORT_NAME) {
        loggedChatReportIDs.delete(report.reportID);
    } else if (!loggedChatReportIDs.has(report.reportID) && shouldUseFullTitleForOption(result)) {
        const derivedEntry = reportAttributesDerived?.[report.reportID];
        loggedChatReportIDs.add(report.reportID);
        Log.info('[ChatReportLHN] Default report name is shown in LHN', false, {
            reportID: report.reportID,
            chatType: report.chatType,
            rawReportName: report.reportName,
            hasDerivedEntry: !!derivedEntry,
            derivedReportName: derivedEntry?.reportName,
            derivedCount: reportAttributesDerived ? Object.keys(reportAttributesDerived).length : 0,
        });
    }

    result.text = reportName;
    result.subtitle = subtitle;
    result.participantsList = participantPersonalDetailList;

    const reportIcons = getIcons(
        report,
        formatPhoneNumber,
        translate,
        personalDetails,
        personalDetail?.avatar,
        personalDetail?.login,
        personalDetail?.accountID ?? CONST.DEFAULT_NUMBER_ID,
        policy,
        invoiceReceiverPolicy,
        isReportArchived,
        getPendingDeleteMemberAccountIDs(reportMetadata?.pendingChatMembers),
    );

    // IOU icon trimming (single vs diagonal) is handled at the component level
    // using useReportPreviewSenderID which has access to transaction attendee data.
    // INVOICE is also exempt — B2B invoices show two workspace icons as diagonal.
    if (!result.shouldShowSubscript && report.type !== CONST.REPORT.TYPE.IOU && report.type !== CONST.REPORT.TYPE.INVOICE && reportIcons.length > 1) {
        const firstIcon = reportIcons.at(0);
        result.icons = firstIcon ? [firstIcon] : [];
    } else {
        result.icons = reportIcons;
    }

    result.displayNamesWithTooltips = displayNamesWithTooltips;

    if (status) {
        result.status = status;
    }
    result.type = report.type;

    return result;
}

/**
 * Whether a report should appear in the "Unread" Inbox tab: it has unread messages and is not muted.
 * Computed once while building the LHN report set (which is cached/incremental) so the tab filter only reads a flag.
 */
function getIsUnreadReportForInboxTab(report: Report, isReportArchived: boolean): boolean {
    // The `lastActorAccountID` guard matches getOptionData: it keeps chats whose only visible message was
    // deleted out of the Unread tab even though isUnread() can still be true (lastVisibleActionCreated isn't reset).
    return isUnread(report, undefined, isReportArchived) && !!report.lastActorAccountID && getReportNotificationPreference(report) !== CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE;
}

/** Whether a report belongs in the "To-do" Inbox tab: it has an outstanding GBR (requiresAttention) or RBR (errors). */
function getIsTodoReportForInboxTab(report: ReportsToDisplayInLHN[string]): boolean {
    return !!report.requiresAttention || !!report.hasErrorsOtherThanFailedReceipt;
}

/**
 * Filters the already-ordered LHN report IDs down to the ones that belong to the active Inbox tab.
 * The "All" tab returns everything (and still honors Most Recent / Focus mode upstream); the other
 * tabs narrow that same set to reports requiring action (To-do) or with unread messages (Unread).
 */
function filterReportsForInboxTab(reportIDs: string[], reportsToDisplay: ReportsToDisplayInLHN, activeTab: ValueOf<typeof CONST.INBOX_TAB>): string[] {
    if (activeTab === CONST.INBOX_TAB.ALL) {
        return reportIDs;
    }

    return reportIDs.filter((reportID) => {
        const report = reportsToDisplay[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
        if (!report) {
            return false;
        }

        switch (activeTab) {
            case CONST.INBOX_TAB.TODO:
                return getIsTodoReportForInboxTab(report);
            case CONST.INBOX_TAB.UNREAD:
                return !!report.isUnreadReport;
            default:
                return true;
        }
    });
}

/** Counts how many of the ordered reports fall into the To-do and Unread Inbox tabs, for the count badge shown on each. */
function getInboxTabCounts(reportIDs: string[], reportsToDisplay: ReportsToDisplayInLHN): Record<typeof CONST.INBOX_TAB.TODO | typeof CONST.INBOX_TAB.UNREAD, number> {
    let todoCount = 0;
    let unreadCount = 0;

    for (const reportID of reportIDs) {
        const report = reportsToDisplay[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
        if (!report) {
            continue;
        }
        if (getIsTodoReportForInboxTab(report)) {
            todoCount++;
        }
        if (report.isUnreadReport) {
            unreadCount++;
        }
    }

    return {
        [CONST.INBOX_TAB.TODO]: todoCount,
        [CONST.INBOX_TAB.UNREAD]: unreadCount,
    };
}

// Exported for unit testing only. Do not use directly in production code.
export {
    categorizeReportsForLHN as _categorizeReportsForLHN,
    sortCategorizedReports as _sortCategorizedReports,
    combineReportCategories as _combineReportCategories,
    buildSortKey as _buildSortKey,
};

export default {
    getOptionData,
    sortReportsToDisplayInLHN,
    getWelcomeMessage,
    getReasonAndReportActionThatHasRedBrickRoad,
    getReportsToDisplayInLHN,
    updateReportsToDisplayInLHN,
    shouldDisplayReportInLHN,
    filterReportsForInboxTab,
    getInboxTabCounts,
};
