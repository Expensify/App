import type {SageIntacctMappingValue} from '@src/types/onyx/Policy';

type UpdateSageIntacctUserDimension = {
    policyID: string;
    name: string;
    mapping: SageIntacctMappingValue;
};

export default UpdateSageIntacctUserDimension;
