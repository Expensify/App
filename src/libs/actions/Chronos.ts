import * as API from '@libs/API';
import type {AddCommentOrAttachmentParams, ChronosRemoveOOOEventParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {getReportActionMessage} from '@libs/ReportActionsUtils';
import {buildOptimisticAddCommentReportAction, formatReportLastMessageText} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type {ChronosOOOEvent} from '@src/types/onyx/OriginalMessage';

import type {OnyxUpdate} from 'react-native-onyx';

import {Str} from 'expensify-common';
import Onyx from 'react-native-onyx';

type ChronosTimerOnyxUpdate = OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.NVP_CHRONOS_TIME_TRACKING>;

const removeEvent = (reportID: string | undefined, reportActionID: string, eventID: string, events: ChronosOOOEvent[]) => {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportActionID]: {
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    originalMessage: {
                        events: events.filter((event) => event.id !== eventID),
                    },
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportActionID]: {
                    pendingAction: null,
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportActionID]: {
                    originalMessage: {events},
                    pendingAction: null,
                },
            },
        },
    ];

    const parameters: ChronosRemoveOOOEventParams = {
        googleEventID: eventID,
        reportActionID,
    };

    API.write(WRITE_COMMANDS.CHRONOS_REMOVE_OOO_EVENT, parameters, {optimisticData, successData, failureData});
};

/**
 * Start or stop the Chronos timer by sending a "start"/"stop" comment to the Chronos report.
 * Chronos interprets the comment server-side and updates the `expensify_chronosTimeTracking` NVP,
 * which is the true source of whether a timer is running. We optimistically flip the NVP here so the
 * header button reacts instantly, and revert it in `failureData` if the comment fails to send.
 *
 * @param previousStartTime the current NVP `startTime` (falsy when no timer is running)
 */
const startOrStopChronosTimer = (report: Report, currentUserAccountID: number, previousStartTime: string | null, delegateAccountID?: number) => {
    const reportID = report.reportID;
    if (!reportID) {
        return;
    }

    const isStarting = !previousStartTime;
    const text = isStarting ? CONST.CHRONOS.TIMER_COMMAND.START : CONST.CHRONOS.TIMER_COMMAND.STOP;

    const {reportAction, commentText} = buildOptimisticAddCommentReportAction({text, reportID, delegateAccountIDParam: delegateAccountID});
    const reportActionID = reportAction.reportActionID;
    const lastMessageText = formatReportLastMessageText(getReportActionMessage(reportAction)?.text ?? '');

    // A running timer has a non-empty `startTime`; stopping clears it to an empty string (mirrors the Auth backend).
    const optimisticStartTime = isStarting ? DateUtils.getDBTime() : '';

    const optimisticData: ChronosTimerOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {[reportActionID]: reportAction},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                lastMessageText,
                lastVisibleActionCreated: reportAction.created,
                lastActorAccountID: currentUserAccountID,
                lastActionType: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_CHRONOS_TIME_TRACKING,
            value: {startTime: optimisticStartTime},
        },
    ];

    const successData: ChronosTimerOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {[reportActionID]: {pendingAction: null, isOptimisticAction: null}},
        },
    ];

    const failureData: ChronosTimerOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {[reportActionID]: {errors: getMicroSecondOnyxErrorWithTranslationKey('report.genericAddCommentFailureMessage')}},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_CHRONOS_TIME_TRACKING,
            value: {startTime: previousStartTime ?? ''},
        },
    ];

    const parameters: AddCommentOrAttachmentParams = {
        reportID,
        reportActionID,
        commentReportActionID: null,
        reportComment: commentText,
        clientCreatedTime: reportAction.created,
        idempotencyKey: Str.guid(),
    };

    API.write(WRITE_COMMANDS.ADD_COMMENT, parameters, {optimisticData, successData, failureData});
};

export {removeEvent, startOrStopChronosTimer};
