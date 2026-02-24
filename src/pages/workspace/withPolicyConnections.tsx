import isBoolean from 'lodash/isBoolean';
import React, {useEffect, useState} from 'react';
import type {ComponentType} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import {openPolicyAccountingPage} from '@libs/actions/PolicyConnections';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import withPolicy from './withPolicy';
import type {WithPolicyProps} from './withPolicy';

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
        const {isOffline} = useNetwork();
        const [hasConnectionsDataBeenFetched, hasConnectionsDataBeenFetchedResult] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_HAS_CONNECTIONS_DATA_BEEN_FETCHED}${props.policy?.id}`);
        const isOnyxDataLoading = isLoadingOnyxValue(hasConnectionsDataBeenFetchedResult);
        const isConnectionDataFetchNeeded =
            !isOnyxDataLoading && !isOffline && !!props.policy && (!!props.policy.areConnectionsEnabled || !isEmptyObject(props.policy.connections)) && !hasConnectionsDataBeenFetched;

        const [isFetchingData, setIsFetchingData] = useState(false);

        const prevHasConnectionsDataBeenFetched = usePrevious(hasConnectionsDataBeenFetched);

        if (prevHasConnectionsDataBeenFetched === undefined && isBoolean(hasConnectionsDataBeenFetched) && isFetchingData) {
            setIsFetchingData(false);
        }

        const [prevFetchKey, setPrevFetchKey] = useState({policyId: props.policy?.id, isConnectionDataFetchNeeded});
        if (prevFetchKey.policyId !== props.policy?.id || prevFetchKey.isConnectionDataFetchNeeded !== isConnectionDataFetchNeeded) {
            setPrevFetchKey({policyId: props.policy?.id, isConnectionDataFetchNeeded});
            if (!isConnectionDataFetchNeeded || !props.policy?.id) {
                if (isFetchingData) {
                    setIsFetchingData(false);
                }
            } else {
                setIsFetchingData(true);
            }
        }

        useEffect(() => {
            if (!isConnectionDataFetchNeeded || !props.policy?.id) {
                return;
            }
            openPolicyAccountingPage(props.policy.id);
        }, [props.policy?.id, isConnectionDataFetchNeeded]);

        if ((isConnectionDataFetchNeeded || isFetchingData || isOnyxDataLoading) && shouldBlockView) {
            return <FullScreenLoadingIndicator />;
        }

        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                isConnectionDataFetchNeeded={isConnectionDataFetchNeeded}
            />
        );
    }

    return withPolicy(WithPolicyConnections);
}

export default withPolicyConnections;

export type {WithPolicyConnectionsProps};
