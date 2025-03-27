import {useNavigationState} from '@react-navigation/native';
import React, {useEffect, useMemo, useState} from 'react';
import ActiveWorkspaceContext from '@components/ActiveWorkspace/ActiveWorkspaceContext';
import getPolicyIDFromState from '@libs/Navigation/helpers/getPolicyIDFromState';
import type {RootNavigatorParamList, State} from '@libs/Navigation/types';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

function ActiveWorkspaceContextProvider({children}: ChildrenProps) {
    const policyID = useNavigationState((state) => getPolicyIDFromState(state as State<RootNavigatorParamList>));

    const [activeWorkspaceID, setActiveWorkspaceID] = useState<string | undefined>(policyID);

    useEffect(() => {
        setActiveWorkspaceID(policyID);
    }, [policyID]);

    const value = useMemo(
        () => ({
            activeWorkspaceID,

            // We are exporting setActiveWorkspace to speed up updating this value after changing activeWorkspaceID to avoid flickering of workspace avatar.
            setActiveWorkspaceID,
        }),
        [activeWorkspaceID],
    );

    return <ActiveWorkspaceContext.Provider value={value}>{children}</ActiveWorkspaceContext.Provider>;
}

export default ActiveWorkspaceContextProvider;
