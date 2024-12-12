import {useNavigationState} from '@react-navigation/native';
import React, {useEffect, useMemo, useState} from 'react';
import ActiveWorkspaceContext from '@components/ActiveWorkspace/ActiveWorkspaceContext';
import {getPolicyIDFromState} from '@libs/Navigation/helpers';
import type {RootStackParamList, State} from '@libs/Navigation/types';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

function ActiveWorkspaceContextProvider({children}: ChildrenProps) {
    const policyID = useNavigationState((state) => getPolicyIDFromState(state as State<RootStackParamList>));

    const [activeWorkspaceID, setActiveWorkspaceID] = useState<string | undefined>(policyID);

    useEffect(() => {
        setActiveWorkspaceID(policyID);
    }, [policyID, setActiveWorkspaceID]);

    const value = useMemo(
        () => ({
            activeWorkspaceID,
            setActiveWorkspaceID,
        }),
        [activeWorkspaceID, setActiveWorkspaceID],
    );

    return <ActiveWorkspaceContext.Provider value={value}>{children}</ActiveWorkspaceContext.Provider>;
}

export default ActiveWorkspaceContextProvider;
export {};
