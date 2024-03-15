import type {Rate} from '@src/types/onyx/Policy';

type SetPolicyDistanceRatesEnabledParams = {
    policyID: string;
    customUnitID: string;
    customUnitRateArray: string;
};

export default SetPolicyDistanceRatesEnabledParams;
