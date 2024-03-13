import type {Rate} from '@src/types/onyx/Policy';

type UpdatePolicyDistanceRateValueParams = {
    policyID: string;
    customUnitID: string;
    customUnitRates: Rate[];
};

export default UpdatePolicyDistanceRateValueParams;
