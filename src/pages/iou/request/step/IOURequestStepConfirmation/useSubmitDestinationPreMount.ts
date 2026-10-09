import useOnyx from '@hooks/useOnyx';
import usePreMountDestination from '@hooks/usePreMountDestination';

import {clearPreMountedDraftReport, clearPreMountedDraftReportMarker, preMountDraftReport} from '@libs/actions/Report/PreMountedDraftReport';
import {getReusableP2PReportID} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {findSelfDMReportID, getParticipantsChatKey, isMoneyRequestReport} from '@libs/ReportUtils';
import {getPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {OneOnOneChatReportIDsDerivedValue, Report} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type Transaction from '@src/types/onyx/Transaction';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import type {RefObject} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {useEffect, useRef} from 'react';

import getSubmitExpensePreMountDestinationRoute from '../confirmation/getSubmitExpensePreMountDestinationRoute';

type UseSubmitDestinationPreMountParams = {
    transaction: OnyxEntry<Transaction>;
    report: OnyxEntry<Report>;
    reportDrafts: OnyxCollection<Report>;
    participants: Participant[];
    iouType: DeepValueOf<typeof CONST.IOU.TYPE>;
    backToReport: string | undefined;
    currentUserAccountID: number;
    isPerDiemRequest: boolean;
    isFromGlobalCreate: boolean;
    isCreatingTrackExpense: boolean;
    isSelfDMDestination: boolean;
    isLookingAroundUser: boolean;
    isMovingTransactionFromTrackExpense: boolean;

    /** Read lazily, so a pre-inserted route survives unmount once a submission started. */
    formHasBeenSubmitted: RefObject<boolean>;
};

/**
 * Resolves the report the expense lands on after submit and pre-mounts it under the confirmation, so revealing it
 * after the write is instant.
 */
function useSubmitDestinationPreMount({
    transaction,
    report,
    reportDrafts,
    participants,
    iouType,
    backToReport,
    currentUserAccountID,
    isPerDiemRequest,
    isFromGlobalCreate,
    isCreatingTrackExpense,
    isSelfDMDestination,
    isLookingAroundUser,
    isMovingTransactionFromTrackExpense,
    formHasBeenSubmitted,
}: UseSubmitDestinationPreMountParams) {
    // PAY, SPLIT, and TRACK navigate to a specific destination report
    // (not Search) after submission. A self-DM CREATE is effectively a TRACK, so it is
    // excluded too. Pre-inserting the Search route would leave a stale entry in the navigation stack.
    const canPreInsertSearch = iouType !== CONST.IOU.TYPE.PAY && iouType !== CONST.IOU.TYPE.SPLIT && iouType !== CONST.IOU.TYPE.TRACK && !isSelfDMDestination;

    const preMountedDraftReportIDRef = useRef<string | undefined>(undefined);

    /**
     * Called once validation has passed and the write is guaranteed to happen. The real write now owns the
     * pre-mounted row, so drop its marker here rather than letting unmount cleanup delete it.
     */
    const onExpenseWriteWillStart = () => {
        const preMountedReportID = preMountedDraftReportIDRef.current;
        if (!preMountedReportID) {
            return;
        }
        preMountedDraftReportIDRef.current = undefined;
        clearPreMountedDraftReportMarker(preMountedReportID);
    };

    const isTransactionReady = !!transaction;
    const selfDMReportID = iouType === CONST.IOU.TYPE.TRACK || isSelfDMDestination ? findSelfDMReportID() : undefined;
    const isMRReport = isMoneyRequestReport(report);
    const shouldUsePerDiemChatReport = isPerDiemRequest && isMRReport && Navigation.getTopmostReportId() !== report?.reportID;
    const routeDestinationReportID = shouldUsePerDiemChatReport ? report?.chatReportID : report?.reportID;
    const destinationReportID = (isSelfDMDestination ? selfDMReportID : (backToReport ?? routeDestinationReportID)) ?? selfDMReportID;

    // The user can swap recipients here without a remount, so `report` can still lag behind the current
    // pick. Resolve the P2P participant separately: existing chats win; only a genuinely new chat reuses
    // the optimistic reportID useParticipantSubmission committed.
    const firstParticipant = participants.at(0);

    // Split creates or resolves its own group chat report ID, so it cannot reuse the transaction's P2P report ID.
    // A self-DM participant is not a policy expense chat either, but it carries accountID 0, so leaving it in here
    // sends `getChatByParticipants` looking for a chat with account 0 that can never exist.
    const isP2PDestination = iouType !== CONST.IOU.TYPE.SPLIT && !!firstParticipant && !firstParticipant.isPolicyExpenseChat && !isSelfDMDestination;
    const reusableP2PReportID = isP2PDestination ? getReusableP2PReportID(firstParticipant, transaction?.reportID) : undefined;
    const p2pRecipientAccountID = firstParticipant?.accountID ?? CONST.DEFAULT_NUMBER_ID;

    // Read reports reactively: if the chat lands mid-flow the optimistic ID must drop out, or we'd reveal an uncreated report.
    const existingP2PChatSelector = (chatReportIDs: OnyxEntry<OneOnOneChatReportIDsDerivedValue>) =>
        isP2PDestination ? chatReportIDs?.reportIDs?.[getParticipantsChatKey([p2pRecipientAccountID, currentUserAccountID])] : undefined;
    const [existingP2PDestinationReportID] = useOnyx(ONYXKEYS.DERIVED.ONE_ON_ONE_CHAT_REPORT_IDS, {selector: existingP2PChatSelector});
    const optimisticP2PDestinationReportID = !existingP2PDestinationReportID && reusableP2PReportID ? reusableP2PReportID : undefined;
    // Trust `report` when it already belongs to this participant (their chat, or an IOU report under it), so a
    // flow started from an IOU report keeps that report as destination instead of falling back to the chat.
    const isReportParticipantChat = !!report?.reportID && report.reportID === existingP2PDestinationReportID;
    const isReportUnderParticipantChat = !!report?.reportID && report.chatReportID === existingP2PDestinationReportID;
    const isReportAlignedWithParticipant = isReportParticipantChat || isReportUnderParticipantChat;
    const shouldPreferRouteDestination = isReportAlignedWithParticipant || !!backToReport;
    const preMountDestinationReportID = optimisticP2PDestinationReportID ?? (shouldPreferRouteDestination ? destinationReportID : (existingP2PDestinationReportID ?? destinationReportID));
    const [destinationReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${preMountDestinationReportID}`);
    const destinationReportDraft = reportDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${preMountDestinationReportID}`];

    // The builder's own live Navigation reads aren't reactive values, so they don't drive a recompute. A recompute driven by a
    // non-route-determining input yields the same string route - a no-op for usePreMountDestination's value-compared [route]
    // effect. A genuine destinationReportID/iouType change yields a new route string and re-pre-inserts, which is intended. The
    // builder's hasPreInsertedFullscreen guard keeps its eligibility (not the route value) stable across its own pre-insert, so
    // it never tears down the route it just inserted.
    const preMountDestinationRoute = getSubmitExpensePreMountDestinationRoute({
        isTransactionReady,
        destinationReportID: preMountDestinationReportID,
        destinationReport: destinationReport ?? destinationReportDraft,
        isFromGlobalCreate,
        canPreInsertSearch,
        iouType,
        isCreatingTrackExpense,
        isSelfDMDestination,
        isOptimisticNewChatDestination: !!optimisticP2PDestinationReportID,
        isLookingAroundUser,
        isMovingTransactionFromTrackExpense,
    });

    // Excludes the optimistic P2P case explicitly (never has a draft to pre-mount), rather than relying only
    // on the route string, so this can't silently break if that route ever gains a query param.
    const preMountDestinationReportRoute = preMountDestinationReportID ? ROUTES.REPORT_WITH_ID.getRoute(preMountDestinationReportID) : undefined;
    const shouldPreMountDestinationDraft = !optimisticP2PDestinationReportID && !!preMountDestinationReportRoute && preMountDestinationRoute === preMountDestinationReportRoute;

    // DraftWorkspaceOpener creates a draft policy expense chat, under the reportID the real backend
    // commit will eventually use, before this screen mounts. Copy it into the real report collection only
    // when it's the eligible pre-mount target; the backend overwrites it with confirmed data on submit.
    useEffect(() => {
        if (!shouldPreMountDestinationDraft || !preMountDestinationReportID || destinationReport || !destinationReportDraft) {
            return;
        }

        preMountedDraftReportIDRef.current = preMountDestinationReportID;
        preMountDraftReport(preMountDestinationReportID, destinationReportDraft);
    }, [shouldPreMountDestinationDraft, preMountDestinationReportID, destinationReport, destinationReportDraft]);

    const {reveal: revealPreMountDestination, cleanupPreMount} = usePreMountDestination(preMountDestinationRoute, {
        shouldPreservePreInsertedRouteOnUnmount: () => formHasBeenSubmitted.current,
    });

    // Only remove the speculative report row once the pre-mounted screen reading it is confirmed gone.
    useEffect(() => {
        return () => {
            const preMountedReportID = preMountedDraftReportIDRef.current;
            // Read the latest submission state at cleanup time because submission can start or finish after this effect runs.
            const hasSubmitIntent = !!getPendingSubmitFollowUpAction();
            if (!preMountedReportID || preMountedReportID !== preMountDestinationReportID || Navigation.getIsFullscreenPreInsertedUnderRHP()) {
                return;
            }

            // eslint-disable-next-line react-hooks/exhaustive-deps
            if (hasSubmitIntent || formHasBeenSubmitted.current) {
                // The real write's own callback clears the marker once it runs, which may race this cleanup - leave
                // it alone here, or the row could end up unmarked before that write actually happens.
                return;
            }

            preMountedDraftReportIDRef.current = undefined;
            clearPreMountedDraftReport(preMountedReportID);
        };
    }, [preMountDestinationReportID, formHasBeenSubmitted]);

    return {
        destinationReportID,
        optimisticP2PDestinationReportID,
        preMountDestinationReportID,
        revealPreMountDestination,
        cleanupPreMount,
        onExpenseWriteWillStart,
    };
}

export default useSubmitDestinationPreMount;
