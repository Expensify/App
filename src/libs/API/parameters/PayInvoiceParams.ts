import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type CreateWorkspaceParams from './CreateWorkspaceParams';

type PayInvoiceParams = Partial<CreateWorkspaceParams> & {
    reportID: string;
    reportActionID: string;
    paymentMethodType: PaymentMethodType;
    payAsBusiness: boolean;
    bankAccountID?: number;
    fundID?: number;
};

export default PayInvoiceParams;
