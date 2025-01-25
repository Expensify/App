import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type CreateWorkspaceParams from './CreateWorkspaceParams';

type PayInvoiceParams = Partial<CreateWorkspaceParams> & {
    reportID: string | undefined;
    reportActionID: string;
    paymentMethodType: PaymentMethodType;
    payAsBusiness: boolean;
};

export default PayInvoiceParams;
