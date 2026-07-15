import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import usePolicyConnectionsPrefetch from '@hooks/usePolicyConnectionsPrefetch';

import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import type {ComponentType} from 'react';

import isBoolean from 'lodash/isBoolean';
import React from 'react';

import type {WithPolicyProps} from './withPolicy';

import withPolicy from './withPolicy';

type WithPolicyConnectionsProps = WithPolicyProps & {
    isConnectionDataFetchNeeded: boolean;
};

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
function withPolicyConnections<TProps extends WithPolicyConnectionsProps>(WrappedComponent: ComponentType<TProps>, shouldBlockView = true) {
    function WithPolicyConnections(props: TProps) {
        const {
            isFetchNeeded: isConnectionDataFetchNeeded,
            isLoadingFetchedFlag: isOnyxDataLoading,
            hasBeenFetched: hasConnectionsDataBeenFetched,
        } = usePolicyConnectionsPrefetch(props.policy, true);
        const isFetchingData = isConnectionDataFetchNeeded && !!props.policy?.id && !isBoolean(hasConnectionsDataBeenFetched);

        if ((isFetchingData || isOnyxDataLoading) && shouldBlockView) {
            const reasonAttributes: SkeletonSpanReasonAttributes = {
                context: 'withPolicyConnections',
                isFetchingData,
                isOnyxDataLoading,
            };
            return <FullScreenLoadingIndicator reasonAttributes={reasonAttributes} />;
        }

        return (
            <WrappedComponent
                {...props}
                isConnectionDataFetchNeeded={isConnectionDataFetchNeeded}
            />
        );
    }

    // OXC's React Compiler does not memoize this component on web; memoize it before wrapping so it is
    // memoized on both platforms.
    return withPolicy(React.memo(WithPolicyConnections));
}

export default withPolicyConnections;

export type {WithPolicyConnectionsProps};
