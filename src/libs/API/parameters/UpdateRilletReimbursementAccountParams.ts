import type {RilletExport} from '@src/types/onyx/Policy';

type UpdateRilletReimbursementAccountParams = {
    policyID: string;
    reimbursementAccountCode: RilletExport['reimbursementAccountCode'];
};

export default UpdateRilletReimbursementAccountParams;
