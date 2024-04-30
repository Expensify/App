import {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import {openPolicyAccountingPage} from '@libs/actions/PolicyConnections';
import ONYXKEYS from '@src/ONYXKEYS';
import useNetwork from './useNetwork';

export default function usePolicyConnections(policyID: string) {
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const {isOffline} = useNetwork();
    const [hasConnectionsDataBeenFetched] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_HAS_CONNECTIONS_DATA_BEEN_FETCHED}${policy?.id ?? '0'}`, {
        initWithStoredValues: false,
    });

    useEffect(() => {
        // When the accounting feature is not enabled, or if the connections data already exists,
        // there is no need to fetch the connections data.
        if (isOffline || !policy || !policy.areConnectionsEnabled || !!hasConnectionsDataBeenFetched || !!policy.connections) {
            return;
        }

        openPolicyAccountingPage(policy.id);
    }, [hasConnectionsDataBeenFetched, policy, isOffline]);

    return policy;
}
