import createContextNamespace from '@hooks/createContextNamespace';
import usePolicy from '@hooks/usePolicy';

import {getMergeFinalApprover} from '@libs/merge/MergeUtils';
import {getMergeATSApprovalMode, getMergeATSApproverField} from '@libs/merge/RecruitingUtils';

import CONST from '@src/CONST';
import type {MergeApprovalMode, MergeATSApproverField} from '@src/types/onyx/Policy';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import React, {useState} from 'react';

type MergeATSApprovalDraftState = {
    approvalMode?: MergeApprovalMode;
    approverField?: MergeATSApproverField;
    finalApprover?: string;
};

type MergeATSApprovalResolvedState = MergeATSApprovalDraftState & {
    approverField: MergeATSApproverField;
};

type MergeATSApprovalDraftActions = {
    setDraftApprovalMode: (approvalMode: MergeApprovalMode) => void;
    setDraftApproverField: (approverField: MergeATSApproverField) => void;
    setDraftFinalApprover: (finalApprover: string | undefined) => void;
};

const createMergeATSApprovalDraftContext = createContextNamespace('MergeATSApprovalDraftProvider');

const [MergeATSApprovalDraftStateContext, useMergeATSApprovalDraftStateContext] = createMergeATSApprovalDraftContext<MergeATSApprovalDraftState>('State');
const [MergeATSApprovalDraftActionsContext, useMergeATSApprovalDraftActionsContext] = createMergeATSApprovalDraftContext<MergeATSApprovalDraftActions>('Actions');

function useMergeATSApprovalDraftState(policyID: string | undefined): MergeATSApprovalResolvedState {
    const draft = useMergeATSApprovalDraftStateContext('useMergeATSApprovalDraftState');
    const policy = usePolicy(policyID);

    return {
        approvalMode: draft.approvalMode ?? getMergeATSApprovalMode(policy),
        approverField: draft.approverField ?? getMergeATSApproverField(policy) ?? CONST.MERGE.ATS_APPROVER_FIELD.RECRUITER,
        finalApprover: draft.finalApprover ?? getMergeFinalApprover(policy, CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS),
    };
}

function useMergeATSApprovalDraftActions() {
    return useMergeATSApprovalDraftActionsContext('useMergeATSApprovalDraftActions');
}

function MergeATSApprovalDraftProvider({children}: ChildrenProps) {
    const [approvalMode, setDraftApprovalMode] = useState<MergeApprovalMode>();
    const [approverField, setDraftApproverField] = useState<MergeATSApproverField>();
    const [finalApprover, setDraftFinalApprover] = useState<string>();

    const state: MergeATSApprovalDraftState = {approvalMode, approverField, finalApprover};
    const actions: MergeATSApprovalDraftActions = {setDraftApprovalMode, setDraftApproverField, setDraftFinalApprover};

    return (
        <MergeATSApprovalDraftActionsContext value={actions}>
            <MergeATSApprovalDraftStateContext value={state}>{children}</MergeATSApprovalDraftStateContext>
        </MergeATSApprovalDraftActionsContext>
    );
}

export {MergeATSApprovalDraftProvider, useMergeATSApprovalDraftActions, useMergeATSApprovalDraftState};
