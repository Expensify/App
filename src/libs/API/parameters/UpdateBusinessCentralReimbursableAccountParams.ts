import type {BusinessCentralExport} from '@src/types/onyx/Policy';

type UpdateBusinessCentralReimbursableAccountParams = {
    policyID: string;
    value: BusinessCentralExport['reimbursableAccount'];
};

export default UpdateBusinessCentralReimbursableAccountParams;
