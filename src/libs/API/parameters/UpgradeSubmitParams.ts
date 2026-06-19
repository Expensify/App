import type Policy from '@src/types/onyx/Policy';

type UpgradeSubmitParams = {
    policyID: string;
    targetType: Policy['type'];
    reportID?: string | undefined;
};

export default UpgradeSubmitParams;
