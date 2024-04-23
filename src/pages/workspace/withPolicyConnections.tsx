import React, {useEffect} from 'react';
import type {ComponentType} from 'react';
import {useOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useNetwork from '@hooks/useNetwork';
import {openPolicyAccountingPage} from '@libs/actions/PolicyConnections';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import withPolicy from './withPolicy';
import type {WithPolicyProps} from './withPolicy';

type WithPolicyConnectionsProps = WithPolicyProps;

/**
 * Higher-order component that fetches the connections data and populates
 * the corresponding field of the policy object if the field is empty. It then passes the policy object
 * to the wrapped component.
 *
 * Use this HOC when you need the policy object with its connections field populated.
 *
 * Only the active policy gets the complete policy data upon app start that includes the connections data.
 * For other policies, the connections data needs to be fetched when it's needed.
 */
function withPolicyConnections(WrappedComponent: ComponentType<WithPolicyConnectionsProps & {policy: Policy}>) {
    function WithPolicyConnections({policy, policyDraft, route}: WithPolicyConnectionsProps) {
        const {isOffline} = useNetwork();
        const [hasConnectionsDataBeenFetched, {status}] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_HAS_CONNECTIONS_DATA_BEEN_FETCHED}${policy?.id ?? '0'}`, {
            initWithStoredValues: false,
        });

        useEffect(() => {
            // When the accounting feature is not enabled, or if the connections data already exists,
            // there is no need to fetch the connections data.
            if (!policy || !policy.areConnectionsEnabled || !!hasConnectionsDataBeenFetched || !!policy.connections) {
                return;
            }

            openPolicyAccountingPage(policy.id);
        }, [hasConnectionsDataBeenFetched, policy, isOffline]);

        if (!policy || status === 'loading' || !hasConnectionsDataBeenFetched) {
            return (
                <FullPageOfflineBlockingView>
                    <FullScreenLoadingIndicator />
                </FullPageOfflineBlockingView>
            );
        }

        return (
            <WrappedComponent
                policy={policy}
                policyDraft={policyDraft}
                route={route}
            />
        );
    }

    return withPolicy(WithPolicyConnections);
}

export default withPolicyConnections;
