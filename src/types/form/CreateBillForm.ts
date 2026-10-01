import type Form from './Form';

type CreateBillForm = Form<
    'domain' | 'vendorEmail' | 'merchant' | 'amount' | 'currency' | 'date',
    {
        domain: string;
        vendorEmail: string;
        merchant: string;
        amount: string;
        currency: string;
        date: string;
    }
>;

export default CreateBillForm;
