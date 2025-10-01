import {useCallback} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import * as Expensicons from '@components/Icon/Expensicons';
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import useIsPolicyConnectedToUberReceiptPartner from './useIsPolicyConnectedToUberReceiptPartner';
import useLocalize from './useLocalize';
import usePolicy from './usePolicy';

export default function useGetReceiptPartnersIntegrationData(policyID?: string) {
    const policy = usePolicy(policyID);
    const {translate} = useLocalize();

    const uber = policy?.receiptPartners?.uber;
    const isUberConnected = useIsPolicyConnectedToUberReceiptPartner({policyID});
    const shouldShowEnterCredentialsError = isUberConnected && !!uber?.error;

    const getReceiptPartnersIntegrationData = useCallback(
        (receiptPartnerName: string) => {
            switch (receiptPartnerName) {
                case CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER: {
                    return {
                        title: CONST.POLICY.RECEIPT_PARTNERS.NAME_USER_FRIENDLY[CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER],
                        description: translate('workspace.receiptPartners.uber.subtitle', {organizationName: uber?.organizationName ?? ''}),
                        icon: Expensicons.Uber,
                        errorFields: uber?.errorFields,
                        errors: uber?.errors,
                    };
                }
                default:
                    return undefined;
            }
        },
        [translate, uber?.errorFields, uber?.errors, uber?.organizationName],
    );

    const getUberConnectionErrorDirectlyFromPolicy = useCallback((currentPolicy: OnyxEntry<Policy>) => {
        const receiptUber = currentPolicy?.receiptPartners?.uber;
        const isReceiptUberConnected = !!currentPolicy?.receiptPartners?.uber?.enabled;

        return isReceiptUberConnected && !!receiptUber?.error;
    }, []);

    return {getReceiptPartnersIntegrationData, shouldShowEnterCredentialsError, isUberConnected, getUberConnectionErrorDirectlyFromPolicy};
}
