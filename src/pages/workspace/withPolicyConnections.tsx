import {useEffect} from 'react';
import type {ComponentType} from 'react';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import useNetwork from '@hooks/useNetwork';
import {openPolicyAccountingPage} from '@libs/actions/PolicyConnections';
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
function withPolicyConnections(WrappedComponent: ComponentType<WithPolicyConnectionsProps>) {
    function WithPolicyConnections({policy, policyMembers, policyDraft, policyMembersDraft, route}: WithPolicyConnectionsProps) {
        const {isOffline} = useNetwork();

        useEffect(() => {
            // When the accounting feature is not enabled, or if the connections data already exists,
            // there is no need to fetch the connections data.
            if (!policy || !policy.areConnectionsEnabled || !!policy.connections || !!policy.isLoadingConnections || !policy.id) {
                return;
            }

            openPolicyAccountingPage(policy.id);
        }, [policy]);

        if (!policy?.connections) {
            if (isOffline) {
                return (
                    <FullPageOfflineBlockingView>
                        <WrappedComponent
                            policy={policy}
                            policyMembers={policyMembers}
                            policyDraft={policyDraft}
                            policyMembersDraft={policyMembersDraft}
                            route={route}
                        />
                    </FullPageOfflineBlockingView>
                );
            }

            return null;
        }

        return (
            <WrappedComponent
                policy={policy}
                policyMembers={policyMembers}
                policyDraft={policyDraft}
                policyMembersDraft={policyMembersDraft}
                route={route}
            />
        );
    }

    return withPolicy(WithPolicyConnections);
}

export default withPolicyConnections;
