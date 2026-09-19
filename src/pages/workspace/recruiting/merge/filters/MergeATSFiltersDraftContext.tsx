import createContextNamespace from '@hooks/createContextNamespace';
import usePolicy from '@hooks/usePolicy';

import type {MergeATSFilterType} from '@libs/merge/RecruitingUtils';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RightModalNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type {MergeATSFilters} from '@src/types/onyx/Policy';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import {useRoute} from '@react-navigation/native';
import React, {useState} from 'react';

type MergeATSFiltersDraftActions = {
    setFilter: (filterType: MergeATSFilterType, values: string[]) => void;
};

const createMergeATSFiltersDraftContext = createContextNamespace('MergeATSFiltersDraftProvider');

const [MergeATSFiltersDraftStateContext, useMergeATSFiltersDraftState] = createMergeATSFiltersDraftContext<MergeATSFilters>('State');
const [MergeATSFiltersDraftActionsContext, useMergeATSFiltersDraftActions] = createMergeATSFiltersDraftContext<MergeATSFiltersDraftActions>('Actions');

function useMergeATSFilters(): MergeATSFilters {
    return useMergeATSFiltersDraftState('useMergeATSFilters');
}

function useMergeATSFiltersActions(): MergeATSFiltersDraftActions {
    return useMergeATSFiltersDraftActions('useMergeATSFiltersActions');
}

function MergeATSFiltersDraftProvider({children}: ChildrenProps) {
    const route = useRoute<PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.RECRUITING_MERGE_IMPORT_SETTINGS>>();
    const policy = usePolicy(route.params?.params?.policyID);
    const savedFilters = policy?.connections?.merge_ats?.config?.filters;

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
        <MergeATSFiltersDraftStateContext.Provider value={{tags: tags ?? savedFilters?.tags, stages: stages ?? savedFilters?.stages, offices: offices ?? savedFilters?.offices}}>
            <MergeATSFiltersDraftActionsContext.Provider value={{setFilter}}>{children}</MergeATSFiltersDraftActionsContext.Provider>
        </MergeATSFiltersDraftStateContext.Provider>
    );
}

export default MergeATSFiltersDraftProvider;
export {useMergeATSFilters, useMergeATSFiltersActions};
