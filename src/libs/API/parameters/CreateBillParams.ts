import type {FileObject} from '@src/types/utils/Attachment';

type CreateBillParams = {
    reportID: string;
    invoiceReportID: string;
    domain: string;
    vendorEmail: string;
    merchant: string;
    amount: number;
    currency: string;
    date: string;
    file?: FileObject;
};

export default CreateBillParams;
