import type {BusinessCentralExport} from '@src/types/onyx/Policy';

type UpdateBusinessCentralPaymentMethodParams = {
    policyID: string;
    value: BusinessCentralExport['paymentMethodCode'];
};

export default UpdateBusinessCentralPaymentMethodParams;
