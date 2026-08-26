import useMappedPolicies from '@hooks/useMappedPolicies';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {RefObject} from 'react';
import type {OnyxEntry} from 'react-native-onyx';

import {useEffect} from 'react';

/** Returns the policy for a policyID, or undefined. */
type PolicyLookupFn = (policyID: string | undefined) => OnyxEntry<Policy>;

type ParticipantPolicyLookupProps = {
    /** Set by ParticipantPolicyLookup. Call it to read a policy by id. */
    lookupRef: RefObject<PolicyLookupFn | undefined>;
};

// Only the policy fields handleParticipantsAdded uses when the recipient changes.
const policyMapper = (policy: OnyxEntry<Policy>): OnyxEntry<Policy> =>
    policy && {
        id: policy.id,
        name: policy.name,
        type: policy.type,
        role: policy.role,
        owner: policy.owner,
        outputCurrency: policy.outputCurrency,
        isPolicyExpenseChatEnabled: policy.isPolicyExpenseChatEnabled,
        customUnits: policy.customUnits,
    };

/**
 * Subscribes to all policies and exposes a by-id lookup through `lookupRef`. The confirmation step only
 * needs a policy when the user changes the recipient in the participant picker, so the parent mounts this
 * only while that picker is open. That keeps the subscription out of the confirmation's first render.
 */
function ParticipantPolicyLookup({lookupRef}: ParticipantPolicyLookupProps) {
    const [mappedPolicies] = useMappedPolicies(policyMapper);

    useEffect(() => {
        // eslint-disable-next-line no-param-reassign -- the ref is how this component hands the lookup back to the confirmation
        lookupRef.current = (policyID) => (policyID ? mappedPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] : undefined);
        return () => {
            // eslint-disable-next-line no-param-reassign -- drop the lookup when the picker closes so it can't be called with stale data
            lookupRef.current = undefined;
        };
    }, [lookupRef, mappedPolicies]);

    return null;
}

ParticipantPolicyLookup.displayName = 'ParticipantPolicyLookup';

export default ParticipantPolicyLookup;
export type {PolicyLookupFn};
