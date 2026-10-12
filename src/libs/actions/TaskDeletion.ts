/**
 * Task deletion and error clearing, split out of Task so that file does not import the Report hub.
 */

import {write} from '@libs/API';
import type {CancelTaskParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import Navigation from '@libs/Navigation/Navigation';
import {doesReportHaveVisibleActions} from '@libs/ReportActionsUtils';
import type {Ancestor, OptimisticTaskReportAction} from '@libs/ReportUtils';
import {buildOptimisticTaskReportAction, canUserPerformWriteAction as canUserPerformWriteActionReportUtils, getOptimisticDataForAncestors} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type PersonalDetails from '@src/types/onyx/PersonalDetails';
import type ReportAction from '@src/types/onyx/ReportAction';

import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import {getMostRecentReportID, navigateToConciergeChatAndDeleteReport, optimisticReportLastData} from './Report';
import {notifyNewAction} from './Report/reportActionSubscribers';

type DeleteTaskOptions = {
    ancestors?: Ancestor[];
    shouldNavigateBack?: boolean;
    /** Fallback report ID when the deleted task has no parent report. */
    lastAccessedReportID?: string;
};

/**
 * Calculate the URL to navigate to after a task deletion
 * @param report - The task report being deleted
 * @returns The URL to navigate to
 */
function getNavigationUrlOnTaskDelete(
    report: OnyxEntry<OnyxTypes.Report>,
    conciergeReportID: string | undefined,
    reportActions: OnyxEntry<OnyxTypes.ReportActions>,
    lastAccessedReportID?: string,
): string | undefined {
    if (!report) {
        return undefined;
    }

    const shouldDeleteTaskReport = !doesReportHaveVisibleActions(report.reportID, reportActions);
    if (!shouldDeleteTaskReport) {
        return undefined;
    }

    if (report?.parentReportID) {
        return ROUTES.REPORT_WITH_ID.getRoute(report.parentReportID);
    }

    // If no parent report, try to navigate to most recent report
    const mostRecentReportID = getMostRecentReportID(conciergeReportID, lastAccessedReportID);
    if (mostRecentReportID) {
        return ROUTES.REPORT_WITH_ID.getRoute(mostRecentReportID);
    }

    return undefined;
}

/**
 * Cancels a task by setting the report state to SUBMITTED and status to CLOSED
 */
function deleteTask(
    report: OnyxEntry<OnyxTypes.Report>,
    parentReport: OnyxEntry<OnyxTypes.Report>,
    isReportArchived: boolean,
    currentUserAccountID: number,
    hasOutstandingChildTask: boolean,
    parentReportAction: OnyxEntry<ReportAction>,
    conciergeReportID: string | undefined,
    delegateEmail: string | undefined,
    reportActions: OnyxEntry<OnyxTypes.ReportActions>,
    {ancestors = [], shouldNavigateBack = true, lastAccessedReportID}: DeleteTaskOptions = {},
) {
    if (!report) {
        return;
    }
    const message = `deleted task: ${report.reportName}`;
    const optimisticCancelReportAction = buildOptimisticTaskReportAction(report.reportID, CONST.REPORT.ACTIONS.TYPE.TASK_CANCELLED, delegateEmail, message);
    const optimisticReportActionID = optimisticCancelReportAction.reportActionID;
    const canUserPerformWriteAction = canUserPerformWriteActionReportUtils(report, isReportArchived);

    // If the task report is the last visible action in the parent report, we should navigate back to the parent report
    const shouldDeleteTaskReport = !doesReportHaveVisibleActions(report.reportID, reportActions, canUserPerformWriteAction);
    const optimisticReportAction: Partial<OptimisticTaskReportAction> = {
        pendingAction: shouldDeleteTaskReport ? CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE : CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
        previousMessage: parentReportAction?.message,
        message: [
            {
                translationKey: '',
                type: 'COMMENT',
                html: '',
                text: '',
                isEdited: true,
                isDeletedParentAction: true,
            },
        ],
        errors: undefined,
        linkMetadata: [],
    };
    const optimisticReportActions = parentReportAction?.reportActionID ? {[parentReportAction?.reportActionID]: optimisticReportAction} : {};

    const optimisticLastReportData = optimisticReportLastData(parentReport?.reportID ?? String(CONST.DEFAULT_NUMBER_ID), optimisticReportActions, canUserPerformWriteAction);
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
            value: {
                lastVisibleActionCreated: optimisticCancelReportAction.created,
                lastMessageText: message,
                lastActorAccountID: optimisticCancelReportAction.actorAccountID,
                isDeletedParentAction: true,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${parentReport?.reportID}`,
            value: {
                ...optimisticLastReportData,
                hasOutstandingChildTask,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
            value: {
                [optimisticReportActionID]: optimisticCancelReportAction as OnyxTypes.ReportAction,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReport?.reportID}`,
            value: optimisticReportActions,
        },
    ];

    // Update optimistic data for parent report action if the report is a child report and the task report has no visible child
    const childVisibleActionCount = parentReportAction?.childVisibleActionCount ?? 0;
    if (childVisibleActionCount === 0) {
        optimisticData.push(...getOptimisticDataForAncestors(ancestors, parentReport?.lastVisibleActionCreated ?? '', CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE));
    }

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
            value: {
                [optimisticReportActionID]: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReport?.reportID}`,
            value: parentReportAction?.reportActionID ? {[parentReportAction.reportActionID]: {pendingAction: null}} : {},
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
            value: {
                stateNum: report.stateNum,
                statusNum: report.statusNum,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${parentReport?.reportID}`,
            value: {
                hasOutstandingChildTask: parentReport?.hasOutstandingChildTask,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
            value: {
                [optimisticReportActionID]: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReport?.reportID}`,
            value: parentReportAction?.reportActionID ? {[parentReportAction?.reportActionID]: {pendingAction: null}} : {},
        },
    ];

    const parameters: CancelTaskParams = {
        cancelledTaskReportActionID: optimisticReportActionID,
        taskReportID: report.reportID,
    };

    write(WRITE_COMMANDS.CANCEL_TASK, parameters, {optimisticData, successData, failureData});
    notifyNewAction(report.reportID, undefined, true);

    const urlToNavigateBack = shouldNavigateBack ? getNavigationUrlOnTaskDelete(report, conciergeReportID, reportActions, lastAccessedReportID) : undefined;
    if (urlToNavigateBack) {
        Navigation.goBack();
        return urlToNavigateBack;
    }
}

function clearTaskErrors(
    report: OnyxEntry<OnyxTypes.Report>,
    conciergeReportID: string | undefined,
    currentUserAccountID: number,
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>,
    isSelfTourViewed: boolean | undefined,
    reportOwnerPersonalDetail: OnyxEntry<PersonalDetails>,
    currentUserPersonalDetail: OnyxEntry<PersonalDetails>,
    conciergePersonalDetail: OnyxEntry<PersonalDetails>,
) {
    const reportID = report?.reportID;
    if (!reportID) {
        return;
    }

    // Delete the task preview in the parent report
    if (report?.pendingFields?.createChat === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`, report.parentReportActionID ? {[report.parentReportActionID]: null} : {});

        navigateToConciergeChatAndDeleteReport(
            reportID,
            conciergeReportID,
            currentUserAccountID,
            introSelected,
            isSelfTourViewed,
            reportOwnerPersonalDetail,
            currentUserPersonalDetail,
            conciergePersonalDetail,
            undefined,
            undefined,
        );
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        pendingFields: null,
        errorFields: null,
    });
}

export {getNavigationUrlOnTaskDelete, deleteTask, clearTaskErrors};
