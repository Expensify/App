import createContextNamespace from '@hooks/createContextNamespace';
import usePolicy from '@hooks/usePolicy';

import {getMergeFinalApprover} from '@libs/merge/MergeUtils';
import {getMergeATSApprovalMode, getMergeATSApproverField} from '@libs/merge/RecruitingUtils';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RightModalNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type {MergeApprovalMode, MergeATSApproverField} from '@src/types/onyx/Policy';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import {useRoute} from '@react-navigation/native';
import React, {useState} from 'react';

type MergeATSApprovalDraftState = {
    approvalMode?: MergeApprovalMode;
    approverField: MergeATSApproverField;
    finalApprover?: string;
};

type MergeATSApprovalDraftActions = {
    setDraftApprovalMode: (approvalMode: MergeApprovalMode) => void;
    setDraftApproverField: (approverField: MergeATSApproverField) => void;
    setDraftFinalApprover: (finalApprover: string | undefined) => void;
};

const createMergeATSApprovalDraftContext = createContextNamespace('MergeATSApprovalDraftProvider');

const [MergeATSApprovalDraftStateContext, useMergeATSApprovalDraftStateContext] = createMergeATSApprovalDraftContext<MergeATSApprovalDraftState>('State');
const [MergeATSApprovalDraftActionsContext, useMergeATSApprovalDraftActionsContext] = createMergeATSApprovalDraftContext<MergeATSApprovalDraftActions>('Actions');

function useMergeATSApprovalDraftState() {
    return useMergeATSApprovalDraftStateContext('useMergeATSApprovalDraftState');
}

function useMergeATSApprovalDraftActions() {
    return useMergeATSApprovalDraftActionsContext('useMergeATSApprovalDraftActions');
}

function MergeATSApprovalDraftProvider({children}: ChildrenProps) {
    const route = useRoute<PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.RECRUITING_MERGE_APPROVAL>>();
    const policy = usePolicy(route.params?.params?.policyID);
    const [approvalMode, setDraftApprovalMode] = useState<MergeApprovalMode>();
    const [approverField, setDraftApproverField] = useState<MergeATSApproverField>();
    const [finalApprover, setDraftFinalApprover] = useState<string>();

    const state: MergeATSApprovalDraftState = {
        approvalMode: approvalMode ?? getMergeATSApprovalMode(policy),
        approverField: approverField ?? getMergeATSApproverField(policy) ?? CONST.MERGE.ATS_APPROVER_FIELD.RECRUITER,
        finalApprover: finalApprover ?? getMergeFinalApprover(policy, CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS),
    };
    const actions: MergeATSApprovalDraftActions = {setDraftApprovalMode, setDraftApproverField, setDraftFinalApprover};

    return (
        <MergeATSApprovalDraftActionsContext value={actions}>
            <MergeATSApprovalDraftStateContext value={state}>{children}</MergeATSApprovalDraftStateContext>
        </MergeATSApprovalDraftActionsContext>
    );
}

export {MergeATSApprovalDraftProvider, useMergeATSApprovalDraftActions, useMergeATSApprovalDraftState};
