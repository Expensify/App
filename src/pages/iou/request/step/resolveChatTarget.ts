import {resolveOptimisticChatReportID} from '@libs/IOUUtils';
import {getChatByParticipants, getReportOrDraftReport, isDeprecatedGroupDM, isGroupChat, isMoneyRequestReport, isPolicyExpenseChat, isSelfDM} from '@libs/ReportUtils';

import type {IOUAction, IOUType} from '@src/CONST';
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

type ResolveChatTargetForSubmitCleanupParams = {
    participant: Participant;
    currentUserAccountID: number;
    report: OnyxEntry<Report>;
    fallbackOptimisticChatReportID: string;
    action: IOUAction;
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

/**
 * Post-action confirmation-cleanup resolver: mirrors the action's chat resolution so cleanup navigation
 * lands on the same report the action wrote to. Falls back to `fallbackOptimisticChatReportID` (UI's
 * pre-generated optimistic ID for this submission) when no existing chat resolves.
 */
function resolveChatTargetForSubmitCleanup({participant, currentUserAccountID, report, fallbackOptimisticChatReportID, action}: ResolveChatTargetForSubmitCleanupParams): ChatTarget {
    if (isMoneyRequestReport(report)) {
        return {report, chatReportID: fallbackOptimisticChatReportID, optimisticChatReportID: undefined};
    }

    // SUBMIT (move-from-track) writes to the participant's policy/1:1 chat, never the self-DM source — skip the keep-source shortcut.
    const isMoveFromTrackSubmit = action === CONST.IOU.ACTION.SUBMIT;

    // Keep `report` unless it's a non-special 1:1 chat whose participants don't match the submission target.
    if (!isMoveFromTrackSubmit && report?.reportID) {
        const isSpecialChat = !!participant.isPolicyExpenseChat || isPolicyExpenseChat(report) || isSelfDM(report) || isGroupChat(report) || isDeprecatedGroupDM(report);
        if (isSpecialChat) {
            return {report, chatReportID: fallbackOptimisticChatReportID, optimisticChatReportID: undefined};
        }
        if (participant.accountID) {
            const reportParticipants = Object.keys(report.participants ?? {})
                .map(Number)
                .sort();
            const expected = [participant.accountID, currentUserAccountID].sort();
            const participantsMatch = expected.length === reportParticipants.length && expected.every((id, i) => id === reportParticipants.at(i));
            if (participantsMatch) {
                return {report, chatReportID: fallbackOptimisticChatReportID, optimisticChatReportID: undefined};
            }
        }
    }

    let chatReportID: string | undefined;
    if (participant.isPolicyExpenseChat && participant.reportID && getReportOrDraftReport(participant.reportID)) {
        chatReportID = participant.reportID;
    } else if (participant.accountID) {
        chatReportID = getChatByParticipants([participant.accountID, currentUserAccountID])?.reportID;
    }

    return {report: undefined, chatReportID: chatReportID ?? fallbackOptimisticChatReportID, optimisticChatReportID: undefined};
}

export {resolveChatTargetForScan, resolveChatTargetForSubmitCleanup};
