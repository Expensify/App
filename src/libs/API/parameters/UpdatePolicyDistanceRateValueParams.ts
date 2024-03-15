import type {Rate} from '@src/types/onyx/Policy';

type UpdatePolicyDistanceRateValueParams = {
    policyID: string;
    customUnitID: string;
    customUnitRateArray: string;
};

export default UpdatePolicyDistanceRateValueParams;
