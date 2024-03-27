import {useEffect} from 'react';
import type {ComponentType} from 'react';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import useNetwork from '@hooks/useNetwork';
import {openPolicyAccountingPage} from '@libs/actions/PolicyConnections';
import withPolicy from './withPolicy';
import type {WithPolicyProps} from './withPolicy';

type WithPolicyConnectionsProps = WithPolicyProps;

function withPolicyConnections(WrappedComponent: ComponentType<WithPolicyConnectionsProps>) {
    function WithPolicyConnections({policy, policyMembers, policyDraft, policyMembersDraft, route}: WithPolicyConnectionsProps) {
        const {isOffline} = useNetwork();

        useEffect(() => {
            if (!policy?.connections || policy?.connections) {
                return;
            }

            openPolicyAccountingPage({policyID: policy?.id});
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
