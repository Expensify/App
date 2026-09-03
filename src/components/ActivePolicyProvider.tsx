import useOnyx from '@hooks/useOnyx';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {OnyxEntry} from 'react-native-onyx';

import React, {createContext, useContext} from 'react';

type ActivePolicyContextValue = {
    activePolicyID: string | undefined;
    activePolicy: OnyxEntry<Policy>;
};

const ActivePolicyContext = createContext<ActivePolicyContextValue>({activePolicyID: undefined, activePolicy: undefined});

const activePolicySelector = (policy: OnyxEntry<Policy>) => (policy?.type !== CONST.POLICY.TYPE.PERSONAL ? policy : undefined);

function ActivePolicyProvider({children}: ChildrenProps) {
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {
        selector: activePolicySelector,
    });

    return <ActivePolicyContext.Provider value={{activePolicyID, activePolicy}}>{children}</ActivePolicyContext.Provider>;
}

function useActivePolicyContext() {
    return useContext(ActivePolicyContext);
}

export default ActivePolicyProvider;
export {useActivePolicyContext};
