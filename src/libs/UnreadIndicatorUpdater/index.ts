import {getIsOffline} from '@libs/NetworkState';
import {getOneTransactionThreadReportID} from '@libs/ReportActionsUtils';
import {getReportNotificationPreference, hasExpensifyGuidesEmails, isArchivedReport, isDefaultRoom, isHiddenForCurrentUser, isUnread, shouldReportBeInOptionList} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportActions, ReportAttributesDerivedValue, ReportNameValuePairs} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

type UnreadIndicatorData = {
    reportNameValuePairs?: OnyxCollection<ReportNameValuePairs>;
    reportActions?: OnyxCollection<ReportActions>;
    reportAttributes?: ReportAttributesDerivedValue['reports'];
    currentUserLogin?: string;
    currentUserAccountID?: number;
    conciergeReportID?: string;
};

function isMutedOrHiddenForCurrentUser(report: OnyxEntry<Report>, currentUserAccountID: number) {
    const notificationPreference = getReportNotificationPreference(report, currentUserAccountID);
    return isHiddenForCurrentUser(notificationPreference) || notificationPreference === CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE;
}

function getUnreadReportInputs(
    report: OnyxEntry<Report>,
    reports: OnyxCollection<Report>,
    {reportNameValuePairs, reportActions, reportAttributes}: Pick<UnreadIndicatorData, 'reportNameValuePairs' | 'reportActions' | 'reportAttributes'>,
    isOffline: boolean,
) {
    const nameValuePairs = reportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`];
    const chatReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`];
    const oneTransactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`], isOffline);
    return {
        isReportArchived: isArchivedReport(nameValuePairs),
        chatReport,
        oneTransactionThreadReportID,
        oneTransactionThreadReport: reports?.[`${ONYXKEYS.COLLECTION.REPORT}${oneTransactionThreadReportID}`],
        derivedIsEmptyReport: report?.reportID ? reportAttributes?.[report.reportID]?.isEmpty : undefined,
    };
}

function getUnreadReportsForUnreadIndicator(
    reports: OnyxCollection<Report>,
    currentReportID: string | undefined,
    draftComment: string | undefined,
    {reportNameValuePairs, reportActions, reportAttributes, currentUserLogin = '', currentUserAccountID = CONST.DEFAULT_NUMBER_ID, conciergeReportID}: UnreadIndicatorData = {},
    reportsToCheck?: Array<OnyxEntry<Report>>,
) {
    // Read the in-memory offline state directly since this is an imperative one-shot computation (reactivity is not needed here).
    const isOffline = getIsOffline();
    return (reportsToCheck ?? Object.values(reports ?? {})).filter((report) => {
        /**
         * Cheapest predicates first so we reject the large muted/hidden population before doing any expensive work.
         *
         * Chats with hidden preference remain invisible in the LHN and are not considered "unread."
         * They are excluded from the LHN rendering, but not filtered from the "option list."
         * This ensures they appear in Search, but not in the LHN or unread count.
         *
         * Furthermore, muted reports may or may not appear in the LHN depending on priority mode,
         * but they should not be considered in the unread indicator count.
         */
        if (isMutedOrHiddenForCurrentUser(report, currentUserAccountID)) {
            return false;
        }

        const {isReportArchived, chatReport, oneTransactionThreadReport, derivedIsEmptyReport} = getUnreadReportInputs(
            report,
            reports,
            {reportNameValuePairs, reportActions, reportAttributes},
            isOffline,
        );
        const requiresAttention = report?.reportID ? reportAttributes?.[report.reportID]?.requiresAttention : undefined;

        if (!isUnread(report, oneTransactionThreadReport, isReportArchived, derivedIsEmptyReport)) {
            return false;
        }

        // Heaviest predicate runs last, only for unread, non-muted, non-hidden reports — a small fraction of all reports.
        return shouldReportBeInOptionList({
            report,
            chatReport,
            currentReportId: currentReportID,
            // This list never had the beta, it used to pass an empty betas array, so it stays off on purpose
            isDefaultRoomsBetaEnabled: false,
            doesReportHaveViolations: false,
            isInFocusMode: false,
            excludeEmptyChats: false,
            isReportArchived,
            draftComment,
            currentUserLogin,
            currentUserAccountID,
            // TODO: Pass guideAccountIDs in Phase B. hasExpensifyGuidesEmails falls back to the personal details store until then. See https://github.com/Expensify/App/issues/66413.
            hasGuidesEmails: isDefaultRoom(report) ? hasExpensifyGuidesEmails(Object.keys(report?.participants ?? {}).map(Number), undefined) : false,
            conciergeReportID,
            requiresAttention,
            // The metadata is only read when `requiresAttention` is missing, which here means reportAttributes has not
            // computed this report yet. Subscribing to the whole metadata collection to cover that moment would cost
            // this module another Onyx connection for a count that corrects itself on the next recompute.
            pendingExpenseActionMetadata: undefined,
            derivedIsEmptyReport,
        });
    });
}

type UnreadReportsTrackerState = {
    reports: OnyxCollection<Report>;
    reportNameValuePairs: OnyxCollection<ReportNameValuePairs>;
    reportActions: OnyxCollection<ReportActions>;
    reportAttributes: ReportAttributesDerivedValue['reports'] | undefined;
    currentUserAccountID: number;
    isOffline: boolean;
};

const keyCountByCollection = new WeakMap<Record<string, unknown>, number>();

function forEachChangedKey<T>(previous: Record<string, T> | undefined, next: Record<string, T> | undefined, hasChanged: (key: string) => boolean, onChange: (key: string) => void) {
    const nextKeys = Object.keys(next ?? {});
    let keptKeyCount = 0;
    for (const key of nextKeys) {
        if (previous?.[key] !== undefined) {
            keptKeyCount++;
        }
        if (hasChanged(key)) {
            onChange(key);
        }
    }
    if (next) {
        keyCountByCollection.set(next, nextKeys.length);
    }

    // Every previous key is still there, so none were removed
    if (previous && keptKeyCount === keyCountByCollection.get(previous)) {
        return;
    }
    for (const key of Object.keys(previous ?? {})) {
        if (!next || !(key in next)) {
            onChange(key);
        }
    }
}

/**
 * Gives the same reports as getUnreadReportsForUnreadIndicator, but only checks again the reports whose data changed since the last call.
 * The unread reports still go through getUnreadReportsForUnreadIndicator every time, since its last check depends on the current report and draft.
 */
function createUnreadReportsTracker() {
    let previous: UnreadReportsTrackerState | undefined;
    const unreadReportKeys = new Set<string>();
    const dependencyReportIDsByReportKey = new Map<string, string[]>();
    const dependentReportKeysByReportID = new Map<string, Set<string>>();

    const setDependencies = (reportKey: string, reportIDs: string[]) => {
        for (const reportID of dependencyReportIDsByReportKey.get(reportKey) ?? []) {
            dependentReportKeysByReportID.get(reportID)?.delete(reportKey);
        }
        if (!reportIDs.length) {
            dependencyReportIDsByReportKey.delete(reportKey);
            return;
        }
        dependencyReportIDsByReportKey.set(reportKey, reportIDs);
        for (const reportID of reportIDs) {
            const dependentReportKeys = dependentReportKeysByReportID.get(reportID) ?? new Set<string>();
            dependentReportKeys.add(reportKey);
            dependentReportKeysByReportID.set(reportID, dependentReportKeys);
        }
    };

    return (reports: OnyxCollection<Report>, currentReportID: string | undefined, draftComment: string | undefined, data: UnreadIndicatorData = {}): string[] => {
        const isOffline = getIsOffline();
        const currentUserAccountID = data.currentUserAccountID ?? CONST.DEFAULT_NUMBER_ID;
        const {reportNameValuePairs, reportActions, reportAttributes} = data;
        const reportKeysToCheck = new Set<string>();
        const addReport = (reportKey: string) => {
            reportKeysToCheck.add(reportKey);
            for (const dependentReportKey of dependentReportKeysByReportID.get(reportKey.slice(ONYXKEYS.COLLECTION.REPORT.length)) ?? []) {
                reportKeysToCheck.add(dependentReportKey);
            }
        };

        // The account and offline state are read for every report, so a change to either checks them all again
        if (!previous || previous.currentUserAccountID !== currentUserAccountID || previous.isOffline !== isOffline) {
            unreadReportKeys.clear();
            dependencyReportIDsByReportKey.clear();
            dependentReportKeysByReportID.clear();
            for (const reportKey of Object.keys(reports ?? {})) {
                reportKeysToCheck.add(reportKey);
            }
        } else {
            const {reports: previousReports, reportNameValuePairs: previousNameValuePairs, reportActions: previousReportActions, reportAttributes: previousAttributes} = previous;
            if (reports !== previousReports) {
                forEachChangedKey(previousReports, reports, (key) => reports?.[key] !== previousReports?.[key], addReport);
            }
            if (reportNameValuePairs !== previousNameValuePairs) {
                forEachChangedKey(
                    previousNameValuePairs,
                    reportNameValuePairs,
                    (key) => reportNameValuePairs?.[key] !== previousNameValuePairs?.[key],
                    (key) => reportKeysToCheck.add(`${ONYXKEYS.COLLECTION.REPORT}${key.slice(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS.length)}`),
                );
            }
            if (reportActions !== previousReportActions) {
                forEachChangedKey(
                    previousReportActions,
                    reportActions,
                    (key) => reportActions?.[key] !== previousReportActions?.[key],
                    (key) => reportKeysToCheck.add(`${ONYXKEYS.COLLECTION.REPORT}${key.slice(ONYXKEYS.COLLECTION.REPORT_ACTIONS.length)}`),
                );
            }
            if (reportAttributes !== previousAttributes) {
                // Onyx can store an unchanged attribute entry as a new object, so compare the only value read here
                forEachChangedKey(
                    previousAttributes,
                    reportAttributes,
                    (reportID) => reportAttributes?.[reportID]?.isEmpty !== previousAttributes?.[reportID]?.isEmpty,
                    (reportID) => reportKeysToCheck.add(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`),
                );
            }
        }

        for (const reportKey of reportKeysToCheck) {
            const report = reports?.[reportKey];
            if (!report || isMutedOrHiddenForCurrentUser(report, currentUserAccountID)) {
                setDependencies(reportKey, []);
                unreadReportKeys.delete(reportKey);
                continue;
            }

            const inputs = getUnreadReportInputs(report, reports, data, isOffline);
            // isUnread reads the one transaction thread, and the chat decides which thread that is
            setDependencies(
                reportKey,
                [report.chatReportID, inputs.oneTransactionThreadReportID].filter((reportID): reportID is string => !!reportID),
            );
            if (isUnread(report, inputs.oneTransactionThreadReport, inputs.isReportArchived, inputs.derivedIsEmptyReport)) {
                unreadReportKeys.add(reportKey);
            } else {
                unreadReportKeys.delete(reportKey);
            }
        }

        previous = {reports, reportNameValuePairs, reportActions, reportAttributes, currentUserAccountID, isOffline};

        const unreadReports = [...unreadReportKeys].map((reportKey) => reports?.[reportKey]);
        return getUnreadReportsForUnreadIndicator(reports, currentReportID, draftComment, data, unreadReports)
            .map((report) => report?.reportID)
            .filter((reportID): reportID is string => !!reportID)
            .sort();
    };
}

export default {getUnreadReportsForUnreadIndicator, createUnreadReportsTracker};
