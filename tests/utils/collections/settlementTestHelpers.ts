import CONST from '@src/CONST';
import type {BankAccountList, Policy, Report} from '@src/types/onyx';

const SETTLEMENT_TEST_ACCOUNT_ID = 1;
const SETTLEMENT_TEST_ACCOUNT_LOGIN = 'test@user.com';
const SETTLEMENT_TEST_REPORT_ID = '100';
const SETTLEMENT_TEST_CHAT_REPORT_ID = '200';
const SETTLEMENT_TEST_POLICY_ID = 'test-policy-id';
const SETTLEMENT_TEST_BANK_ACCOUNT_ID = 12345;

function createSettlementIOUReport(overrides?: Partial<Report>): Report {
    return {
        reportID: SETTLEMENT_TEST_REPORT_ID,
        type: CONST.REPORT.TYPE.IOU,
        ownerAccountID: 2,
        currency: CONST.CURRENCY.USD,
        policyID: SETTLEMENT_TEST_POLICY_ID,
        ...overrides,
    } as Report;
}

function createSettlementExpenseReport(overrides?: Partial<Report>): Report {
    return {
        reportID: SETTLEMENT_TEST_REPORT_ID,
        type: CONST.REPORT.TYPE.EXPENSE,
        ownerAccountID: 2,
        currency: CONST.CURRENCY.USD,
        policyID: SETTLEMENT_TEST_POLICY_ID,
        ...overrides,
    } as Report;
}

function createSettlementInvoiceReport(overrides?: Partial<Report>): Report {
    return {
        reportID: SETTLEMENT_TEST_REPORT_ID,
        type: CONST.REPORT.TYPE.INVOICE,
        ownerAccountID: 2,
        currency: CONST.CURRENCY.USD,
        policyID: SETTLEMENT_TEST_POLICY_ID,
        ...overrides,
    } as Report;
}

function createSettlementChatReport(overrides?: Partial<Report>): Report {
    return {
        reportID: SETTLEMENT_TEST_CHAT_REPORT_ID,
        type: CONST.REPORT.TYPE.CHAT,
        ...overrides,
    } as Report;
}

function createSettlementTestPolicy(overrides?: Partial<Policy>): Policy {
    return {
        id: SETTLEMENT_TEST_POLICY_ID,
        name: 'Test Policy',
        type: CONST.POLICY.TYPE.TEAM,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: SETTLEMENT_TEST_ACCOUNT_LOGIN,
        ownerAccountID: SETTLEMENT_TEST_ACCOUNT_ID,
        outputCurrency: CONST.CURRENCY.USD,
        isPolicyExpenseChatEnabled: true,
        ...overrides,
    } as Policy;
}

function createSettlementBankAccountList(accountNumber = '1234', type: string = CONST.BANK_ACCOUNT.TYPE.BUSINESS): BankAccountList {
    return {
        [SETTLEMENT_TEST_BANK_ACCOUNT_ID]: {
            methodID: SETTLEMENT_TEST_BANK_ACCOUNT_ID,
            bankCurrency: CONST.CURRENCY.USD,
            bankCountry: 'US',
            title: 'Test Bank Account',
            description: `Account ending in ${accountNumber}`,
            accountData: {
                bankAccountID: SETTLEMENT_TEST_BANK_ACCOUNT_ID,
                type,
                state: CONST.BANK_ACCOUNT.STATE.OPEN,
                accountNumber: `00000${accountNumber}`,
                routingNumber: '123456789',
                addressName: 'Test Account',
            },
        },
    } as BankAccountList;
}

function createSettlementPersonalBankAccount(accountNumber = '5678'): BankAccountList {
    return createSettlementBankAccountList(accountNumber, CONST.BANK_ACCOUNT.TYPE.PERSONAL);
}

export {
    SETTLEMENT_TEST_ACCOUNT_ID,
    SETTLEMENT_TEST_ACCOUNT_LOGIN,
    SETTLEMENT_TEST_REPORT_ID,
    SETTLEMENT_TEST_CHAT_REPORT_ID,
    SETTLEMENT_TEST_POLICY_ID,
    SETTLEMENT_TEST_BANK_ACCOUNT_ID,
    createSettlementIOUReport,
    createSettlementExpenseReport,
    createSettlementInvoiceReport,
    createSettlementChatReport,
    createSettlementTestPolicy,
    createSettlementBankAccountList,
    createSettlementPersonalBankAccount,
};
