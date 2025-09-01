import usePolicy from './usePolicy';

export default function useIsUberConnected({policyID}: {policyID?: string}) {
    const policy = usePolicy(policyID);

    const integrations = policy?.receiptPartners;
    return !!integrations?.uber?.organizationID;
}
