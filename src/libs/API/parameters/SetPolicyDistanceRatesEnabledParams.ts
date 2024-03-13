import type {Rate} from '@src/types/onyx/Policy';

type SetPolicyDistanceRatesEnabledParams = {
    policyID: string;
    customUnitID: string;
    customUnitRates: Rate[];
};

export default SetPolicyDistanceRatesEnabledParams;
