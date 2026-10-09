/**
 * Builds the Receipts listings (receipt partners such as Uber for Business) for the Connections page.
 */
import useGetReceiptPartnersIntegrationData from '@hooks/useGetReceiptPartnersIntegrationData';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import usePrevious from '@hooks/usePrevious';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import {openExternalLink} from '@userActions/Link';
import {enablePolicyFeatureForConnection} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useEffect, useRef} from 'react';

import type {ConnectionListing} from './types';

function useReceiptPartnerConnectionListings(policy: OnyxEntry<Policy>): ConnectionListing[] {
    const policyID = policy?.id;
    const {translate} = useLocalize();
    const {getReceiptPartnersIntegrationData, shouldShowEnterCredentialsError, isUberConnected} = useGetReceiptPartnersIntegrationData(policyID);
    const {canWrite, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.MORE_FEATURES);
    const prevIsUberConnected = usePrevious(isUberConnected);
    const {isOffline} = useNetwork();
    const hasStartedUberConnectionRef = useRef(false);

    // The Uber connection finishes outside the app, so the invite flow opens once the connection shows up here. It only
    // opens for a connection started from this page, not for one that shows up when the data first loads.
    useEffect(() => {
        if (!policyID || !isUberConnected || prevIsUberConnected || !canWrite || !hasStartedUberConnectionRef.current) {
            return;
        }
        hasStartedUberConnectionRef.current = false;
        Navigation.navigate(
            createDynamicRoute(
                DYNAMIC_ROUTES.WORKSPACE_RECEIPT_PARTNERS_INVITE.getRoute(CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER),
                ROUTES.WORKSPACE_CONNECTIONS_RECEIPT_PARTNERS.getRoute(policyID),
            ),
        );
    }, [prevIsUberConnected, isUberConnected, policyID, canWrite]);

    const uberData = getReceiptPartnersIntegrationData(CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER);
    if (!policyID || !uberData) {
        return [];
    }

    const connectUber = () => {
        if (!canWrite) {
            showReadOnlyModal();
            return;
        }
        const connectFormData = policy?.receiptPartners?.uber?.connectFormData;
        if (!connectFormData) {
            return;
        }
        enablePolicyFeatureForConnection(policy, CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED);
        hasStartedUberConnectionRef.current = true;
        openExternalLink(`${CONST.UBER_CONNECT_URL}?${connectFormData}`);
    };

    const isConnected = isUberConnected || shouldShowEnterCredentialsError;
    const isBroken = shouldShowEnterCredentialsError || !!uberData.errorFields;

    return [
        {
            key: CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER,
            category: CONST.TAB.CONNECTIONS.RECEIPTS,
            title: uberData.title,
            icon: uberData.icon,
            status: isConnected
                ? {
                      isBroken,
                      message: isBroken ? translate('workspace.connections.brokenConnection') : uberData.description,
                  }
                : undefined,
            // The Uber partner offer only applies to new connections
            offer: isConnected
                ? undefined
                : {
                      onPress: canWrite
                          ? () => {
                                hasStartedUberConnectionRef.current = true;
                                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CLAIM_OFFER.getRoute(policyID, CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER));
                            }
                          : undefined,
                  },
            onConnect: connectUber,
            isLoading: !policy?.receiptPartners?.uber && !isOffline && !!policy?.isLoadingReceiptPartners,
            onConfigure: () => Navigation.navigate(ROUTES.WORKSPACE_CONNECTIONS_RECEIPT_PARTNERS.getRoute(policyID)),
        },
    ];
}

export default useReceiptPartnerConnectionListings;
