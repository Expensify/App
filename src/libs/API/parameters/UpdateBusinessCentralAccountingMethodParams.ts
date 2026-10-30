import type {BusinessCentralExport} from '@src/types/onyx/Policy';

type UpdateBusinessCentralAccountingMethodParams = {
    policyID: string;
    accountingMethod: BusinessCentralExport['accountingMethod'];
};

export default UpdateBusinessCentralAccountingMethodParams;
