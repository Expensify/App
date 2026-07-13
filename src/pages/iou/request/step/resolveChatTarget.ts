import {resolveOptimisticChatReportID} from '@libs/IOUUtils';

import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

import type {OnyxEntry} from 'react-native-onyx';

type ChatTarget = {
    /** Existing report onyx entry to navigate to directly; undefined when the nav target is the optimistic ID. */
    report: OnyxEntry<Report>;
    /** Nav target — existing chat report ID or the to-be-built optimistic ID. */
    chatReportID: string | undefined;
    /** Defined only when an optimistic chat still needs to be built. */
    optimisticChatReportID: string | undefined;
};

type ResolveChatTargetForScanParams = {
    iouType: IOUType;
    participant: Participant | undefined;
    report: OnyxEntry<Report>;
    currentUserAccountID: number;
};

/** Pre-action scan-flow resolver: returns both the builder's optimistic ID and the cleanup nav target so they stay in lockstep. */
function resolveChatTargetForScan({iouType, participant, report, currentUserAccountID}: ResolveChatTargetForScanParams): ChatTarget {
    if (iouType === CONST.IOU.TYPE.TRACK && report?.reportID) {
        return {report, chatReportID: report.reportID, optimisticChatReportID: undefined};
    }
    if (participant?.isPolicyExpenseChat && participant.reportID) {
        return {report: undefined, chatReportID: participant.reportID, optimisticChatReportID: undefined};
    }
    const resolved = resolveOptimisticChatReportID([participant?.accountID ?? CONST.DEFAULT_NUMBER_ID, currentUserAccountID], report);
    return {report: undefined, chatReportID: resolved.chatReportID, optimisticChatReportID: resolved.optimisticChatReportID};
}

export {resolveChatTargetForScan};
