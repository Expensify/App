import React, {useEffect} from 'react';
import type {ComponentType} from 'react';
import {useOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useNetwork from '@hooks/useNetwork';
import {openPolicyAccountingPage} from '@libs/actions/PolicyConnections';
import ONYXKEYS from '@src/ONYXKEYS';
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
function withPolicyConnections<TProps extends WithPolicyConnectionsProps>(WrappedComponent: ComponentType<TProps>) {
    function WithPolicyConnections(props: TProps) {
        const {isOffline} = useNetwork();
        const [hasConnectionsDataBeenFetched, {status}] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_HAS_CONNECTIONS_DATA_BEEN_FETCHED}${props.policy?.id ?? '0'}`, {
            initWithStoredValues: false,
        });
        const isConnectionDataFetchSkipped = isOffline || !props.policy || !props.policy.areConnectionsEnabled || !!hasConnectionsDataBeenFetched || !!props.policy.connections;

        useEffect(() => {
            // When the accounting feature is not enabled, or if the connections data already exists,
            // there is no need to fetch the connections data.
            if (isConnectionDataFetchSkipped || !props?.policy?.id) {
                return;
            }

            openPolicyAccountingPage(props.policy.id);
        }, [hasConnectionsDataBeenFetched, props.policy, isOffline, isConnectionDataFetchSkipped]);

        if (props.policy?.areConnectionsEnabled && (!props.policy || status === 'loading')) {
            return (
                <FullPageOfflineBlockingView>
                    <FullScreenLoadingIndicator />
                </FullPageOfflineBlockingView>
            );
        }

        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                isConnectionDataFetchSkipped={isConnectionDataFetchSkipped}
            />
        );
    }

    return withPolicy(WithPolicyConnections);
}

export default withPolicyConnections;

export type {WithPolicyConnectionsProps};
