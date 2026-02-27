import CONST from '@src/CONST';
import type {OnyxInputOrEntry, Report, ReportAction, ReportMetadata} from '@src/types/onyx';
import {isDeletedAction} from './ReportActionsUtils';

type ParentReportActionDeletionStatusParams = {
    hasLoadedParentReportActions?: boolean;
    isOffline?: boolean;
    parentReportAction: OnyxInputOrEntry<ReportAction>;
    parentReportActionID?: string;
    parentReportID?: string;
    parentReportMetadata?: OnyxInputOrEntry<ReportMetadata>;
    shouldRequireParentReportActionID?: boolean;
    shouldTreatMissingParentReportAsDeleted?: boolean;
};

function hasLoadedReportActions(reportMetadata: OnyxInputOrEntry<ReportMetadata>, isOffline = false): boolean {
    if (!reportMetadata) {
        return false;
    }
    return reportMetadata?.hasOnceLoadedReportActions === true || reportMetadata?.isLoadingInitialReportActions === false || isOffline;
}

function isThreadReportDeleted(report: OnyxInputOrEntry<Report>, reportMetadata: OnyxInputOrEntry<ReportMetadata>, isOffline = false): boolean {
    const hasLoadedThreadReportActions = hasLoadedReportActions(reportMetadata, isOffline);
    return (!report?.reportID && report?.statusNum === CONST.REPORT.STATUS_NUM.CLOSED) || (hasLoadedThreadReportActions && !report?.reportID);
}

function decodeDeleteNavigateBackUrl(url: string): string {
    try {
        return decodeURIComponent(url);
    } catch {
        return url;
    }
}

function doesDeleteNavigateBackUrlIncludeDuplicatesReview(url?: string): boolean {
    if (!url) {
        return false;
    }
    return decodeDeleteNavigateBackUrl(url).includes('/duplicates/review');
}

function doesDeleteNavigateBackUrlIncludeSpecificDuplicatesReview(url?: string, threadReportID?: string): boolean {
    if (!threadReportID) {
        return false;
    }
    const decodedDeleteNavigateBackUrl = decodeDeleteNavigateBackUrl(url ?? '');
    return decodedDeleteNavigateBackUrl.includes('/duplicates/review') && decodedDeleteNavigateBackUrl.includes(threadReportID);
}

function getParentReportActionDeletionStatus({
    hasLoadedParentReportActions,
    isOffline = false,
    parentReportAction,
    parentReportActionID,
    parentReportID,
    parentReportMetadata,
    shouldRequireParentReportActionID = true,
    shouldTreatMissingParentReportAsDeleted = false,
}: ParentReportActionDeletionStatusParams) {
    const hasLoadedParentReportActionsValue = hasLoadedParentReportActions ?? hasLoadedReportActions(parentReportMetadata, isOffline);
    const canUseParentActionIDForMissingCheck = !shouldRequireParentReportActionID || !!parentReportActionID;
    const isParentActionMissingAfterLoad = !!parentReportID && canUseParentActionIDForMissingCheck && hasLoadedParentReportActionsValue && !parentReportAction;
    const isParentActionDeleted = !!parentReportAction && (parentReportAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isDeletedAction(parentReportAction));
    const isMissingParentReport = shouldTreatMissingParentReportAsDeleted && !parentReportID && !parentReportAction?.reportActionID;
    const wasParentActionDeleted = isParentActionDeleted || isParentActionMissingAfterLoad || isMissingParentReport;

    return {hasLoadedParentReportActions: hasLoadedParentReportActionsValue, isParentActionMissingAfterLoad, isParentActionDeleted, wasParentActionDeleted};
}

export {
    decodeDeleteNavigateBackUrl,
    doesDeleteNavigateBackUrlIncludeDuplicatesReview,
    doesDeleteNavigateBackUrlIncludeSpecificDuplicatesReview,
    getParentReportActionDeletionStatus,
    hasLoadedReportActions,
    isThreadReportDeleted,
};
