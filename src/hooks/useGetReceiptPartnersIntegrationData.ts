import {useCallback} from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import CONST from '@src/CONST';
import useLocalize from './useLocalize';
import usePolicy from './usePolicy';

export default function useGetReceiptPartnersIntegrationData({policyID}: {policyID?: string}) {
    const policy = usePolicy(policyID);
    const {translate} = useLocalize();

    const uber = policy?.receiptPartners?.uber;

    const getReceiptPartnersIntegrationData = useCallback(
        (receiptPartnerName: string) => {
            switch (receiptPartnerName) {
                case CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER: {
                    return {
                        title: CONST.POLICY.RECEIPT_PARTNERS.NAME_USER_FRIENDLY[CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER],
                        description: translate('workspace.receiptPartners.uber.subtitle'),
                        icon: Expensicons.Uber,
                        errorFields: uber?.errorFields,
                        errors: uber?.errors,
                    };
                }
                default:
                    return undefined;
            }
        },
        [translate, uber?.errorFields, uber?.errors],
    );

    return {getReceiptPartnersIntegrationData};
}
