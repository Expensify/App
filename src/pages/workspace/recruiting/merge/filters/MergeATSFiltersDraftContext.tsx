import createContextNamespace from '@hooks/createContextNamespace';
import usePolicy from '@hooks/usePolicy';

import type {MergeATSFilterType} from '@libs/merge/RecruitingUtils';

import CONST from '@src/CONST';
import type {MergeATSFilters} from '@src/types/onyx/Policy';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import React, {useState} from 'react';

type MergeATSFiltersDraftActions = {
    setFilter: (filterType: MergeATSFilterType, values: string[]) => void;
};

const createMergeATSFiltersDraftContext = createContextNamespace('MergeATSFiltersDraftProvider');

const [MergeATSFiltersDraftStateContext, useMergeATSFiltersDraftStateContext] = createMergeATSFiltersDraftContext<MergeATSFilters>('State');
const [MergeATSFiltersDraftActionsContext, useMergeATSFiltersDraftActionsContext] = createMergeATSFiltersDraftContext<MergeATSFiltersDraftActions>('Actions');

function useMergeATSFiltersDraftState(policyID: string | undefined): MergeATSFilters {
    const draftFilters = useMergeATSFiltersDraftStateContext('useMergeATSFiltersDraftState');
    const policy = usePolicy(policyID);
    const savedFilters = policy?.connections?.merge_ats?.config?.filters;

    return {
        tags: draftFilters.tags ?? savedFilters?.tags,
        stages: draftFilters.stages ?? savedFilters?.stages,
        offices: draftFilters.offices ?? savedFilters?.offices,
    };
}

function useMergeATSFiltersDraftActions(): MergeATSFiltersDraftActions {
    return useMergeATSFiltersDraftActionsContext('useMergeATSFiltersDraftActions');
}

function MergeATSFiltersDraftProvider({children}: ChildrenProps) {
    const [tags, setTags] = useState<string[]>();
    const [stages, setStages] = useState<string[]>();
    const [offices, setOffices] = useState<string[]>();

    const setFilter = (filterType: MergeATSFilterType, values: string[]) => {
        switch (filterType) {
            case CONST.MERGE.ATS_FILTER_TYPE.TAGS:
                setTags(values);
                break;
            case CONST.MERGE.ATS_FILTER_TYPE.STAGES:
                setStages(values);
                break;
            default:
                setOffices(values);
        }
    };

    return (
        <MergeATSFiltersDraftStateContext.Provider value={{tags, stages, offices}}>
            <MergeATSFiltersDraftActionsContext.Provider value={{setFilter}}>{children}</MergeATSFiltersDraftActionsContext.Provider>
        </MergeATSFiltersDraftStateContext.Provider>
    );
}

export default MergeATSFiltersDraftProvider;
export {useMergeATSFiltersDraftActions, useMergeATSFiltersDraftState};
