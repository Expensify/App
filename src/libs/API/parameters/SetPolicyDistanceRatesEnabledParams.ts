import type {Rate} from '@src/types/onyx/Policy';

type SetPolicyDistanceRatesEnabledParams = {
    policyID: string;
    customUnitID: string;
    customUnitRateArray: Rate[];
};

export default SetPolicyDistanceRatesEnabledParams;
