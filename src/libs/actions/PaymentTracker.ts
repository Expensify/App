import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {OnyxUpdate} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Invoice, PaymentSource} from '@src/types/onyx';

type PaymentSourceType = 'reimbursement_account' | 'external' | 'manual' | 'classic_sync';

type PaymentRecord = {
    invoiceID: string;
    amount: number;
    source: PaymentSourceType;
    sourceDetails?: {
        accountID?: string;
        bankName?: string;
        lastFourDigits?: string;
        classicReportID?: string;
    };
    timestamp: string;
    status: 'pending' | 'completed' | 'failed';
};

type UpdatePaymentStatusParams = {
    invoiceID: string;
    status: 'paid' | 'unpaid' | 'processing';
    paymentSource?: PaymentSourceType;
    sourceDetails?: PaymentRecord['sourceDetails'];
};

const optimisticData: OnyxUpdate[] = [];
const successData: OnyxUpdate[] = [];
const failureData: OnyxUpdate[] = [];

function recordReimbursementAccountPayment(invoiceID: string, amount: number, accountDetails: {accountID: string; bankName?: string; lastFourDigits?: string}) {
    const paymentRecord: PaymentRecord = {
        invoiceID,
        amount,
        source: 'reimbursement_account',
        sourceDetails: accountDetails,
        timestamp: new Date().toISOString(),
        status: 'pending',
    };

    const optimisticInvoiceData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.INVOICE}${invoiceID}`,
        value: {
            paymentStatus: 'processing',
            lastPaymentSource: 'reimbursement_account',
            lastPaymentTimestamp: paymentRecord.timestamp,
        },
    };

    optimisticData.push(optimisticInvoiceData);

    const successInvoiceData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.INVOICE}${invoiceID}`,
        value: {
            paymentStatus: 'paid',
            paymentRecord,
        },
    };

    successData.push(successInvoiceData);

    const failureInvoiceData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.INVOICE}${invoiceID}`,
        value: {
            paymentStatus: 'unpaid',
            lastPaymentSource: undefined,
            lastPaymentTimestamp: undefined,
        },
    };

    failureData.push(failureInvoiceData);

    const parameters = {
        invoiceID,
        amount,
        paymentSource: 'reimbursement_account',
        accountID: accountDetails.accountID,
        bankName: accountDetails.bankName || '',
        lastFourDigits: accountDetails.lastFourDigits || '',
    };

    API.write('RecordReimbursementAccountPayment', parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

function updatePaymentStatus({invoiceID, status, paymentSource, sourceDetails}: UpdatePaymentStatusParams) {
    const optimisticInvoiceData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.INVOICE}${invoiceID}`,
        value: {
            paymentStatus: status,
            lastPaymentSource: paymentSource,
            lastPaymentTimestamp: new Date().toISOString(),
        },
    };

    const parameters = {
        invoiceID,
        status,
        paymentSource: paymentSource || 'manual',
        sourceDetails: JSON.stringify(sourceDetails || {}),
    };

    API.write('UpdateInvoicePaymentStatus', parameters, {
        optimisticData: [optimisticInvoiceData],
    });
}

function syncPaymentFromClassic(invoiceID: string, classicReportID: string, paymentData: {amount: number; timestamp: string; method: string}) {
    const paymentRecord: PaymentRecord = {
        invoiceID,
        amount: paymentData.amount,
        source: 'classic_sync',
        sourceDetails: {
            classicReportID,
        },
        timestamp: paymentData.timestamp,
        status: 'completed',
    };

    const optimisticInvoiceData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.INVOICE}${invoiceID}`,
        value: {
            paymentStatus: 'paid',
            lastPaymentSource: 'classic_sync',
            lastPaymentTimestamp: paymentData.timestamp,
            paymentRecord,
        },
    };

    const parameters = {
        invoiceID,
        classicReportID,
        amount: paymentData.amount,
        timestamp: paymentData.timestamp,
        paymentMethod: paymentData.method,
    };

    API.write('SyncPaymentFromClassic', parameters, {
        optimisticData: [optimisticInvoiceData],
    });
}

function markAsExternalPayment(invoiceID: string, sourceDetails?: {description?: string; reference?: string}) {
    updatePaymentStatus({
        invoiceID,
        status: 'paid',
        paymentSource: 'external',
        sourceDetails: {
            ...sourceDetails,
        },
    });
}

function validatePaymentSource(invoice: Invoice): boolean {
    if (!invoice.paymentRecord) {
        return false;
    }

    const {source, sourceDetails} = invoice.paymentRecord;

    switch (source) {
        case 'reimbursement_account':
            return !!(sourceDetails?.accountID);
        case 'classic_sync':
            return !!(sourceDetails?.classicReportID);
        case 'external':
        case 'manual':
            return true;
        default:
            return false;
    }
}

function getPaymentSourceDisplay(paymentRecord: PaymentRecord): string {
    switch (paymentRecord.source) {
        case 'reimbursement_account':
            return `Bank Account (${paymentRecord.sourceDetails?.lastFourDigits || 'Unknown'})`;
        case 'classic_sync':
            return 'Classic Expensify';
        case 'external':
            return 'External Payment';
        case 'manual':
            return 'Manual Entry';
        default:
            return 'Unknown Source';
    }
}

export {
    recordReimbursementAccountPayment,
    updatePaymentStatus,
    syncPaymentFromClassic,
    markAsExternalPayment,
    validatePaymentSource,
    getPaymentSourceDisplay,
};

export type {PaymentRecord, PaymentSourceType, UpdatePaymentStatusParams};
