import type {BusinessCentralSync} from '@src/types/onyx/Policy';

type UpdateBusinessCentralSettlementsBankAccountParams = {
    policyID: string;
    settlementsBankAccountID: BusinessCentralSync['settlementsBankAccountID'];
};

export default UpdateBusinessCentralSettlementsBankAccountParams;
