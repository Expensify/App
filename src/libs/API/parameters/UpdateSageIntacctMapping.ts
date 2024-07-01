import type {SageIntacctMappingValue} from '@src/types/onyx/Policy';

type UpdateSageIntacctMapping = {
    policyID: string;
    mapping: SageIntacctMappingValue;
};

export default UpdateSageIntacctMapping;
