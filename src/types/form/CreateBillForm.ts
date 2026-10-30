import type Form from './Form';

type CreateBillForm = Form<
    'vendorEmail' | 'merchant' | 'amount' | 'date',
    {
        vendorEmail: string;
        merchant: string;
        amount: string;
        date: string;
    }
>;

export default CreateBillForm;
