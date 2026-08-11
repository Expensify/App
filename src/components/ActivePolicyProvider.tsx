import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {OnyxEntry} from 'react-native-onyx';

import {activePolicySelector} from '@selectors/Policy';
import React, {createContext, useContext} from 'react';

type ActivePolicyContextValue = {
    activePolicyID: string | undefined;
    activePolicy: OnyxEntry<Policy>;
};

const ActivePolicyContext = createContext<ActivePolicyContextValue>({activePolicyID: undefined, activePolicy: undefined});

/**
 * Holds the single subscription to the active policy. `activePolicySelector` returns the whole policy, so every
 * subscriber pays a deep equality check over it on each Onyx merge — one row of a Search list used to trigger four.
 */
function ActivePolicyProvider({children}: ChildrenProps) {
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {
        selector: activePolicySelector,
    });

    return <ActivePolicyContext.Provider value={{activePolicyID, activePolicy}}>{children}</ActivePolicyContext.Provider>;
}

function useActivePolicy() {
    return useContext(ActivePolicyContext);
}

export default ActivePolicyProvider;
export {useActivePolicy};
