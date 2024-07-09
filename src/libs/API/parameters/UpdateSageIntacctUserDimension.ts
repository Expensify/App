import type {SageIntacctDimension} from '@src/types/onyx/Policy';

type UpdateSageIntacctUserDimension = {
    policyID: string;
    dimensions: SageIntacctDimension[];
};

export default UpdateSageIntacctUserDimension;
