import type {Rate} from '@src/types/onyx/Policy';

type CreatePolicyDistanceRateParams = {
    policyID: string;
    customUnitID: string;
    customUnitRate: Rate;
};

export default CreatePolicyDistanceRateParams;
