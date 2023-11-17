// TODO: String literal for Violation Type
import {PolicyTags, Transaction} from '@src/types/onyx';
import {PolicyCategories} from '@src/types/onyx/PolicyCategory';

type ViolationType =string;

// TODO: String literal for Violation Name
type ViolationName = string;

type ViolationField = 'merchant' | 'amount' | 'category' | 'date' | 'tag' | 'comment' | 'billable' | 'receipt' | 'tax';

type TransactionViolation = {
    type: ViolationType;
    name: ViolationName;
    userMessage: string;
    data?: Record<string, string>
};

const formFields = {
    merchant: 'merchant',
    amount: 'amount',
    category: 'category',
    date: 'date',
    tag: 'tag',
    comment: 'comment',
    billable: 'billable',
    receipt: 'receipt',
    tax: 'tax',
};

const violationFields = {
    perDayLimit: formFields.amount,
    maxAge: formFields.date,
    overLimit: formFields.amount,
    overLimitAttendee: formFields.amount,
    overCategoryLimit: formFields.amount,
    receiptRequired: formFields.receipt,
    missingCategory: formFields.category,
    categoryOutOfPolicy: formFields.category,
    missingTag: formFields.tag,
    tagOutOfPolicy: formFields.tag,
    missingComment: formFields.comment,
    taxRequired: formFields.tax,
    taxOutOfPolicy: formFields.tax,
    billableExpense: formFields.billable,
};



const ViolationsUtils = {
    getViolationForField(transactionViolation:TransactionViolation, field:ViolationField
) :string {
        console.log('getViolationsForField()', {transactionViolation, field});
        throw new Error('Not implemented: getViolationsForField');
    },
    getViolationsOnyxData(
        {
            transaction,
            transactionViolations,
            policyRequiresCategories,
            policyRequiresTags,
            policyCategories,
            policyTags
        }:{
            transaction: Transaction,
            transactionViolations: TransactionViolation,
            policyRequiresTags: boolean,
            policyTags: PolicyTags,
            policyRequiresCategories:boolean,
            policyCategories: PolicyCategories
        }){

        console.log('getViolationsOnyxData()', {
            transaction,
            transactionViolations,
            policyRequiresCategories,
            policyRequiresTags,
            policyCategories,
            policyTags
        });

        throw new Error('Not implemented: getViolationsOnyxData()');
    },


}

export default ViolationsUtils;
