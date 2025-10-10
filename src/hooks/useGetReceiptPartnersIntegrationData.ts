import {useCallback} from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import CONST from '@src/CONST';
import useIsPolicyConnectedToUberReceiptPartner from './useIsPolicyConnectedToUberReceiptPartner';
import useLocalize from './useLocalize';
import usePolicy from './usePolicy';

export default function useGetReceiptPartnersIntegrationData(policyID?: string) {
    const policy = usePolicy(policyID);
    const {translate} = useLocalize();

    const uber = policy?.receiptPartners?.uber;
    const isUberConnected = useIsPolicyConnectedToUberReceiptPartner({policyID});
    const shouldShowEnterCredentialsError = !!uber?.error;

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

    return {getReceiptPartnersIntegrationData, shouldShowEnterCredentialsError, isUberConnected};
}
