import usePolicy from './usePolicy';

export default function useIsPolicyConnectedToUberReceiptPartner({policyID}: {policyID?: string}) {
    const policy = usePolicy(policyID);

    return !!policy?.receiptPartners?.uber?.enabled;
}
