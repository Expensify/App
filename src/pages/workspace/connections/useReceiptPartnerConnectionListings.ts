/**
 * Builds the Travel & Delivery listings (receipt partners such as Uber for Business) for the Connections page.
 */
import useGetReceiptPartnersIntegrationData from '@hooks/useGetReceiptPartnersIntegrationData';
import useLocalize from '@hooks/useLocalize';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import usePrevious from '@hooks/usePrevious';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import {openExternalLink} from '@userActions/Link';
import {enablePolicyReceiptPartners} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useEffect} from 'react';

import type {ConnectionListing} from './types';

function useReceiptPartnerConnectionListings(policy: OnyxEntry<Policy>): ConnectionListing[] {
    const policyID = policy?.id;
    const {translate} = useLocalize();
    const {getReceiptPartnersIntegrationData, shouldShowEnterCredentialsError, isUberConnected} = useGetReceiptPartnersIntegrationData(policyID);
    const {canWrite, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.MORE_FEATURES);
    const prevIsUberConnected = usePrevious(isUberConnected);

    // The Uber connection finishes outside the app, so the invite flow opens once the connection shows up here
    useEffect(() => {
        if (!policyID || !isUberConnected || prevIsUberConnected || !canWrite) {
            return;
        }
        Navigation.navigate(
            createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_RECEIPT_PARTNERS_INVITE.getRoute(CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER), ROUTES.WORKSPACE_RECEIPT_PARTNERS.getRoute(policyID)),
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
        if (!policy?.receiptPartners?.enabled) {
            enablePolicyReceiptPartners(policyID, true);
        }
        openExternalLink(`${CONST.UBER_CONNECT_URL}?${policy?.receiptPartners?.uber?.connectFormData}`);
    };

    const isConnected = isUberConnected || shouldShowEnterCredentialsError;

    return [
        {
            key: CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER,
            category: CONST.TAB.CONNECTIONS.TRAVEL,
            title: uberData.title,
            icon: uberData.icon,
            status: isConnected
                ? {
                      isBroken: shouldShowEnterCredentialsError,
                      message: shouldShowEnterCredentialsError ? translate('workspace.connections.brokenConnection') : uberData.description,
                  }
                : undefined,
            onConnect: connectUber,
            onConfigure: () => Navigation.navigate(ROUTES.WORKSPACE_RECEIPT_PARTNERS.getRoute(policyID)),
        },
    ];
}

export default useReceiptPartnerConnectionListings;
