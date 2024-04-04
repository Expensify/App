import {createContext, useContext, useEffect, useState} from 'react';
import type {ComponentType, PropsWithChildren} from 'react';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import useNetwork from '@hooks/useNetwork';
import {openPolicyAccountingPage} from '@libs/actions/PolicyConnections';
import type {Policy} from '@src/types/onyx';
import type {WithPolicyProps} from './withPolicy';
import withPolicy from './withPolicy';

const PolicyWithConnectionsDataContext = createContext<Policy | null>(null);

function usePolicyWithConnectionsData() {
    const policy = useContext(PolicyWithConnectionsDataContext);
    if (!policy) {
        throw new Error('usePolicyWithConnectionsData must be used within a PolicyWithConnectionsDataProvider');
    }
    return policy;
}

/**
 * A context that provides the policy object and ensures that the `connections` data is fetched once. The context maintains a state to track
 * whether the `connections` data has been fetched, ensuring the fetch request is made only once per user session.
 * Note that the policy object provided by this context may not have the `connections` field populated. When the `connections` data is being
 * fetched, the `connections` field is empty.
 * For this reason, use the `withPolicyConnections` HOC defined in this file when consuming the policy object. It manages the rendering logic
 * when the connections field is empty, ensuring that the `policy` object has its `connections` field populated when the wrapped component is
 * rendered.
 */
function PolicyWithConnectionsDataContextProviderWrapped({policy, children}: PropsWithChildren<WithPolicyProps>) {
    const [hasFetchedConnectionsData, setHasFetchedConnectionsData] = useState(false);

    useEffect(() => {
        if (hasFetchedConnectionsData || !policy || policy.connections) {
            return;
        }

        openPolicyAccountingPage(policy.id);
        setHasFetchedConnectionsData(true);
    }, [policy, hasFetchedConnectionsData]);

    return <PolicyWithConnectionsDataContext.Provider value={policy}>{children}</PolicyWithConnectionsDataContext.Provider>;
}

const PolicyWithConnectionsDataContextProvider = withPolicy(PolicyWithConnectionsDataContextProviderWrapped);

/**
 * Higher-order component that provides the policy object which is guaranteed to have the `connections` field populated.
 * If the `connections` field is absent, it either renders nothing or displays the full offline screen when the device is offline.
 * Use this HOC when you need the policy object with its connections field populated.
 */
function withPolicyConnections(WrappedComponent: ComponentType<{policy: Policy}>) {
    function WithPolicyConnections() {
        const {isOffline} = useNetwork();
        const policy = usePolicyWithConnectionsData();

        if (!policy?.connections) {
            if (isOffline) {
                return <FullPageOfflineBlockingView>{null}</FullPageOfflineBlockingView>;
            }

            return null;
        }

        return <WrappedComponent policy={policy} />;
    }

    return WithPolicyConnections;
}

export {PolicyWithConnectionsDataContextProvider, withPolicyConnections};
