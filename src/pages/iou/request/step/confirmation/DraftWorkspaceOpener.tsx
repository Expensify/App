import {useEffect} from 'react';
import {openDraftWorkspaceRequest} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

type DraftWorkspaceOpenerProps = {
    isCreatingTrackExpense: boolean;
    policyID: string | undefined;
    policyPendingAction: PendingAction | undefined;
    policyExpenseChatPolicyID: string | undefined;
    senderPolicyID: string | undefined;
    isOffline: boolean;
};

/**
 * Side-effect-only component that opens draft workspace requests when needed.
 * Handles two cases:
 * 1. When creating a track expense, opens workspace for the policy
 * 2. When a policy expense chat or sender policy is present, opens that workspace
 */
function DraftWorkspaceOpener({isCreatingTrackExpense, policyID, policyPendingAction, policyExpenseChatPolicyID, senderPolicyID, isOffline}: DraftWorkspaceOpenerProps) {
    useEffect(() => {
        if (!isCreatingTrackExpense || policyID === undefined) {
            return;
        }

        openDraftWorkspaceRequest(policyID);
    }, [isCreatingTrackExpense, policyPendingAction, policyID]);

    useEffect(() => {
        if (policyExpenseChatPolicyID && policyPendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
            openDraftWorkspaceRequest(policyExpenseChatPolicyID);
            return;
        }
        if (senderPolicyID && policyPendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
            openDraftWorkspaceRequest(senderPolicyID);
        }
    }, [isOffline, policyPendingAction, policyExpenseChatPolicyID, senderPolicyID]);

    return null;
}

DraftWorkspaceOpener.displayName = 'DraftWorkspaceOpener';

export default DraftWorkspaceOpener;
