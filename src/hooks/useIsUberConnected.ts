import usePolicy from './usePolicy';

export default function useIsUberConnected({policyID}: {policyID?: string}) {
    const policy = usePolicy(policyID);

    return !!policy?.receiptPartners?.uber?.organizationID;
}
