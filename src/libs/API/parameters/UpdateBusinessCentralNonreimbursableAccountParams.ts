import type {BusinessCentralExport} from '@src/types/onyx/Policy';

type UpdateBusinessCentralNonreimbursableAccountParams = {
    policyID: string;
    value: BusinessCentralExport['nonReimbursableAccount'];
};

export default UpdateBusinessCentralNonreimbursableAccountParams;
