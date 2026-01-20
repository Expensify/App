/* eslint-disable react/jsx-props-no-spreading -- Using spread for defaultProps in tests for cleaner test code */
import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import SettlementButton from '@components/SettlementButton';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BankAccountList, LastPaymentMethod, Policy, Report} from '@src/types/onyx';
import {signInWithTestUser, translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

// Mock Navigation
jest.mock('@libs/Navigation/Navigation', () => {
    const mockRef = {
        getCurrentRoute: jest.fn(() => ({
            name: 'Report',
            params: {},
        })),
        getState: jest.fn(() => ({})),
    };
    return {
        navigate: jest.fn(),
        goBack: jest.fn(),
        navigationRef: mockRef,
        getActiveRoute: jest.fn(() => '/r/123'),
    };
});

jest.mock('@libs/Navigation/navigationRef', () => ({
    getCurrentRoute: jest.fn(() => ({
        name: 'Report',
        params: {},
    })),
    getState: jest.fn(() => ({})),
}));

jest.mock('@react-navigation/native', () => {
    const mockRef = {
        getCurrentRoute: jest.fn(() => ({
            name: 'Report',
            params: {},
        })),
        getState: jest.fn(() => ({})),
    };
    return {
        createNavigationContainerRef: jest.fn(() => mockRef),
        useIsFocused: () => true,
        useNavigation: () => ({navigate: jest.fn(), addListener: jest.fn()}),
        useFocusEffect: jest.fn(),
        usePreventRemove: jest.fn(),
    };
});

jest.mock('@src/hooks/useResponsiveLayout');

jest.mock('@components/ProductTrainingContext', () => ({
    useProductTrainingContext: () => [false],
}));

// Test constants
const ACCOUNT_ID = 1;
const ACCOUNT_LOGIN = 'test@user.com';
const REPORT_ID = '123';
const CHAT_REPORT_ID = '456';
const POLICY_ID = 'test-policy-id';
const BANK_ACCOUNT_ID = 12345;

// Helper to create a basic policy
function createTestPolicy(overrides: Partial<Policy> = {}): Policy {
    return {
        id: POLICY_ID,
        name: 'Test Policy',
        type: CONST.POLICY.TYPE.CORPORATE,
        owner: ACCOUNT_LOGIN,
        ownerAccountID: ACCOUNT_ID,
        outputCurrency: 'USD',
        role: CONST.POLICY.ROLE.ADMIN,
        isPolicyExpenseChatEnabled: true,
        ...overrides,
    } as Policy;
}

// Helper to create IOU report
function createIOUReport(overrides: Partial<Report> = {}): Report {
    return {
        reportID: REPORT_ID,
        type: CONST.REPORT.TYPE.IOU,
        ownerAccountID: ACCOUNT_ID,
        managerID: 2,
        currency: 'USD',
        total: 10000,
        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
        ...overrides,
    } as Report;
}

// Helper to create expense report
function createExpenseReport(overrides: Partial<Report> = {}): Report {
    return {
        reportID: REPORT_ID,
        type: CONST.REPORT.TYPE.EXPENSE,
        policyID: POLICY_ID,
        ownerAccountID: ACCOUNT_ID,
        managerID: 2,
        currency: 'USD',
        total: 10000,
        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
        ...overrides,
    } as Report;
}

// Helper to create invoice report
function createInvoiceReport(overrides: Partial<Report> = {}): Report {
    return {
        reportID: REPORT_ID,
        type: CONST.REPORT.TYPE.INVOICE,
        policyID: POLICY_ID,
        ownerAccountID: ACCOUNT_ID,
        managerID: 2,
        currency: 'USD',
        total: 10000,
        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
        ...overrides,
    } as Report;
}

// Helper to create chat report
function createChatReport(overrides: Partial<Report> = {}): Report {
    return {
        reportID: CHAT_REPORT_ID,
        type: CONST.REPORT.TYPE.CHAT,
        policyID: POLICY_ID,
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        ...overrides,
    } as Report;
}

// Helper to create bank account list
function createBankAccountList(accountNumber = '1234'): BankAccountList {
    return {
        [BANK_ACCOUNT_ID]: {
            accountData: {
                accountNumber,
                bankAccountID: BANK_ACCOUNT_ID,
                state: CONST.BANK_ACCOUNT.STATE.OPEN,
                type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
                routingNumber: '123456789',
            },
            isDefault: true,
            methodID: BANK_ACCOUNT_ID,
            accountType: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
            title: `Bank Account ****${accountNumber}`,
            description: 'Business Account',
            bankCurrency: 'USD',
            bankCountry: 'US',
        },
    };
}

// Helper to create personal bank account
function createPersonalBankAccount(accountNumber = '5678'): BankAccountList {
    const personalBankAccountID = 67890;
    return {
        [personalBankAccountID]: {
            accountData: {
                accountNumber,
                bankAccountID: personalBankAccountID,
                state: CONST.BANK_ACCOUNT.STATE.OPEN,
                type: CONST.BANK_ACCOUNT.TYPE.PERSONAL,
                routingNumber: '987654321',
            },
            isDefault: false,
            methodID: personalBankAccountID,
            accountType: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
            title: `Personal Account ****${accountNumber}`,
            description: 'Personal Account',
            bankCurrency: 'USD',
            bankCountry: 'US',
        },
    };
}

// Wrapper component with all required providers
function SettlementButtonWrapper({children}: {children: React.ReactNode}) {
    return (
        <OnyxListItemProvider>
            <CurrentUserPersonalDetailsProvider>
                <LocaleContextProvider>{children}</LocaleContextProvider>
            </CurrentUserPersonalDetailsProvider>
        </OnyxListItemProvider>
    );
}

// Default props for SettlementButton
const defaultProps = {
    onPress: jest.fn(),
    enablePaymentsRoute: ROUTES.ENABLE_PAYMENTS as typeof ROUTES.ENABLE_PAYMENTS,
    policyID: POLICY_ID,
    chatReportID: CHAT_REPORT_ID,
    formattedAmount: '$100.00',
};

describe('SettlementButton', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    describe('customText (button label)', () => {
        it('displays "Pay" when shouldUseShortForm is true', async () => {
            const iouReport = createIOUReport();

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, iouReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, createChatReport());
            });

            render(
                <SettlementButtonWrapper>
                    <SettlementButton
                        {...defaultProps}
                        iouReport={iouReport}
                        shouldUseShortForm
                    />
                </SettlementButtonWrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(translateLocal('iou.pay'))).toBeTruthy();
        });

        it('displays "Mark as paid" when lastPaymentMethod is ELSEWHERE', async () => {
            const iouReport = createIOUReport();

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, iouReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, createChatReport());
                // LastPaymentMethodType expects PaymentInformation objects with a 'name' property
                await Onyx.merge(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {
                    [CONST.POLICY.ID_FAKE]: {
                        lastUsed: {name: CONST.IOU.PAYMENT_TYPE.ELSEWHERE},
                        iou: {name: CONST.IOU.PAYMENT_TYPE.ELSEWHERE},
                        expense: {name: CONST.IOU.PAYMENT_TYPE.ELSEWHERE},
                        invoice: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                    },
                });
            });

            render(
                <SettlementButtonWrapper>
                    <SettlementButton
                        {...defaultProps}
                        iouReport={iouReport}
                        policyID={undefined}
                    />
                </SettlementButtonWrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            // payElsewhere returns "Mark $X as paid" format
            expect(screen.getByText(translateLocal('iou.payElsewhere', {formattedAmount: '$100.00'}))).toBeTruthy();
        });

        it('displays "Pay $100.00" (settlePayment) by default', async () => {
            const iouReport = createIOUReport();

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, iouReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, createChatReport());
            });

            render(
                <SettlementButtonWrapper>
                    <SettlementButton
                        {...defaultProps}
                        iouReport={iouReport}
                    />
                </SettlementButtonWrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(translateLocal('iou.settlePayment', {formattedAmount: '$100.00'}))).toBeTruthy();
        });
    });

    describe('secondLineText (subtitle) for IOU Reports', () => {
        it('returns undefined when shouldUseShortForm is true', async () => {
            const iouReport = createIOUReport();
            const bankAccountList = createPersonalBankAccount();

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, iouReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, createChatReport());
                await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);
                await Onyx.merge(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {
                    [CONST.POLICY.ID_FAKE]: {
                        lastUsed: {name: CONST.IOU.PAYMENT_TYPE.EXPENSIFY},
                        iou: {name: CONST.IOU.PAYMENT_TYPE.EXPENSIFY},
                        expense: {name: CONST.IOU.PAYMENT_TYPE.EXPENSIFY},
                        invoice: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                    },
                } as LastPaymentMethod);
            });

            render(
                <SettlementButtonWrapper>
                    <SettlementButton
                        {...defaultProps}
                        iouReport={iouReport}
                        shouldUseShortForm
                        policyID={undefined}
                    />
                </SettlementButtonWrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            // With shortForm, there should be no subtitle (Wallet text should not appear)
            expect(screen.queryByText(translateLocal('common.wallet'))).toBeNull();
        });

        it('returns undefined when lastPaymentMethod is ELSEWHERE', async () => {
            const iouReport = createIOUReport();

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, iouReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, createChatReport());
                await Onyx.merge(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {
                    [CONST.POLICY.ID_FAKE]: {
                        lastUsed: {name: CONST.IOU.PAYMENT_TYPE.ELSEWHERE},
                        iou: {name: CONST.IOU.PAYMENT_TYPE.ELSEWHERE},
                        expense: {name: CONST.IOU.PAYMENT_TYPE.ELSEWHERE},
                        invoice: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                    },
                });
            });

            render(
                <SettlementButtonWrapper>
                    <SettlementButton
                        {...defaultProps}
                        iouReport={iouReport}
                        policyID={undefined}
                    />
                </SettlementButtonWrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            // When paying elsewhere, no subtitle should be shown
            expect(screen.queryByText(translateLocal('common.wallet'))).toBeNull();
        });

        it('shows "Wallet" for IOU report with EXPENSIFY payment method and personal bank accounts', async () => {
            const iouReport = createIOUReport();
            const bankAccountList = createPersonalBankAccount();

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, iouReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, createChatReport());
                await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);
                await Onyx.merge(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {
                    [CONST.POLICY.ID_FAKE]: {
                        lastUsed: {name: CONST.IOU.PAYMENT_TYPE.EXPENSIFY},
                        iou: {name: CONST.IOU.PAYMENT_TYPE.EXPENSIFY},
                        expense: {name: CONST.IOU.PAYMENT_TYPE.EXPENSIFY},
                        invoice: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                    },
                });
            });

            render(
                <SettlementButtonWrapper>
                    <SettlementButton
                        {...defaultProps}
                        iouReport={iouReport}
                        policyID={undefined}
                    />
                </SettlementButtonWrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(translateLocal('common.wallet'))).toBeTruthy();
        });
    });

    describe('secondLineText (subtitle) for Expense Reports', () => {
        it('shows bank account last four digits for expense report with policy achAccount', async () => {
            const expenseReport = createExpenseReport();
            const policy = createTestPolicy({
                achAccount: {
                    bankAccountID: BANK_ACCOUNT_ID,
                    accountNumber: '9876',
                    routingNumber: '123456789',
                    addressName: 'Test Business',
                    bankName: 'Test Bank',
                    reimburser: 'reimburser@test.com',
                    state: CONST.BANK_ACCOUNT.STATE.OPEN,
                },
            });
            const bankAccountList = createBankAccountList('9876');

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, expenseReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, createChatReport());
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
                await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);
                await Onyx.merge(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {
                    [POLICY_ID]: {
                        lastUsed: {name: CONST.IOU.PAYMENT_TYPE.VBBA},
                        iou: {name: CONST.IOU.PAYMENT_TYPE.VBBA},
                        expense: {name: CONST.IOU.PAYMENT_TYPE.VBBA},
                        invoice: CONST.IOU.PAYMENT_TYPE.VBBA,
                    },
                });
            });

            render(
                <SettlementButtonWrapper>
                    <SettlementButton
                        {...defaultProps}
                        iouReport={expenseReport}
                    />
                </SettlementButtonWrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            // Should show bank account last 4 digits
            expect(screen.getByText(translateLocal('paymentMethodList.bankAccountLastFour', '9876'))).toBeTruthy();
        });

        it('shows bank account not wallet for expense reports with hasIntentToPay (PR #78915 regression test)', async () => {
            // This test validates the fix from PR #78915
            // When hasIntentToPay is true (single payment method), expense reports should show bank account, not wallet
            const expenseReport = createExpenseReport();
            const policy = createTestPolicy({
                achAccount: {
                    bankAccountID: BANK_ACCOUNT_ID,
                    accountNumber: '9876',
                    routingNumber: '123456789',
                    addressName: 'Test Business',
                    bankName: 'Test Bank',
                    reimburser: 'reimburser@test.com',
                    state: CONST.BANK_ACCOUNT.STATE.OPEN,
                },
            });
            const bankAccountList = {
                ...createBankAccountList('9876'),
                ...createPersonalBankAccount('5678'),
            };

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, expenseReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, createChatReport());
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
                await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);
                // No explicit lastPaymentMethod - hasIntentToPay will be true
                // This is the exact scenario PR #78915 fixed
            });

            render(
                <SettlementButtonWrapper>
                    <SettlementButton
                        {...defaultProps}
                        iouReport={expenseReport}
                    />
                </SettlementButtonWrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            // CRITICAL: Should show bank account, NOT wallet for expense reports
            expect(screen.getByText(translateLocal('paymentMethodList.bankAccountLastFour', '9876'))).toBeTruthy();
            expect(screen.queryByText(translateLocal('common.wallet'))).toBeNull();
        });

        it('shows bank account for expense report with hasIntentToPay and policy achAccount', async () => {
            const expenseReport = createExpenseReport();
            const policy = createTestPolicy({
                achAccount: {
                    bankAccountID: BANK_ACCOUNT_ID,
                    accountNumber: '4321',
                    routingNumber: '123456789',
                    addressName: 'Test Business',
                    bankName: 'Test Bank',
                    reimburser: 'reimburser@test.com',
                    state: CONST.BANK_ACCOUNT.STATE.OPEN,
                },
            });
            const bankAccountList = createBankAccountList('4321');

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, expenseReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, createChatReport());
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
                await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);
                // No lastPaymentMethod - hasIntentToPay will be true with single payment method
            });

            render(
                <SettlementButtonWrapper>
                    <SettlementButton
                        {...defaultProps}
                        iouReport={expenseReport}
                    />
                </SettlementButtonWrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            // Should show bank account, not wallet
            expect(screen.getByText(translateLocal('paymentMethodList.bankAccountLastFour', '4321'))).toBeTruthy();
            expect(screen.queryByText(translateLocal('common.wallet'))).toBeNull();
        });
    });

    describe('secondLineText (subtitle) for Invoice Reports', () => {
        // Note: Invoice reports require complex setup including:
        // - Invoice receiver on the chat report
        // - Proper invoice room configuration
        // - Personal details for the receiver
        // These tests verify the invoice button renders without errors

        it('renders payment button for invoice report', async () => {
            const invoiceReport = createInvoiceReport();
            const chatReport = createChatReport({
                invoiceReceiver: {
                    type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
                    accountID: 2,
                },
            });
            const bankAccountList = createBankAccountList('8888');

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, invoiceReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, chatReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, createTestPolicy());
                await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);
            });

            render(
                <SettlementButtonWrapper>
                    <SettlementButton
                        {...defaultProps}
                        iouReport={invoiceReport}
                    />
                </SettlementButtonWrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            // Invoice should show a payment button (settlePayment format)
            expect(screen.getByText(translateLocal('iou.settlePayment', {formattedAmount: '$100.00'}))).toBeTruthy();
        });
    });

    describe('paymentButtonOptions', () => {
        it('shows only Approve button when shouldHidePaymentOptions and shouldShowApproveButton are true', async () => {
            const expenseReport = createExpenseReport();

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, expenseReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, createChatReport());
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, createTestPolicy());
            });

            render(
                <SettlementButtonWrapper>
                    <SettlementButton
                        {...defaultProps}
                        iouReport={expenseReport}
                        shouldHidePaymentOptions
                        shouldShowApproveButton
                    />
                </SettlementButtonWrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            // Should show approve button
            expect(screen.getByText(translateLocal('iou.approve', {formattedAmount: '$100.00'}))).toBeTruthy();
        });

        it('shows only Pay elsewhere button when onlyShowPayElsewhere is true', async () => {
            const iouReport = createIOUReport();

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, iouReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, createChatReport());
            });

            render(
                <SettlementButtonWrapper>
                    <SettlementButton
                        {...defaultProps}
                        iouReport={iouReport}
                        onlyShowPayElsewhere
                    />
                </SettlementButtonWrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            // Should show pay elsewhere
            expect(screen.getByText(translateLocal('iou.payElsewhere', {formattedAmount: ''}))).toBeTruthy();
        });

        it('shows short form Pay button when onlyShowPayElsewhere and shouldUseShortForm are true', async () => {
            const iouReport = createIOUReport();

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, iouReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, createChatReport());
            });

            render(
                <SettlementButtonWrapper>
                    <SettlementButton
                        {...defaultProps}
                        iouReport={iouReport}
                        onlyShowPayElsewhere
                        shouldUseShortForm
                    />
                </SettlementButtonWrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            // Should show short form "Pay" button
            expect(screen.getByText(translateLocal('iou.pay'))).toBeTruthy();
        });

        it('does NOT show wallet option for expense reports in dropdown', async () => {
            const expenseReport = createExpenseReport();
            const policy = createTestPolicy({
                achAccount: {
                    bankAccountID: BANK_ACCOUNT_ID,
                    accountNumber: '9876',
                    routingNumber: '123456789',
                    addressName: 'Test Business',
                    bankName: 'Test Bank',
                    reimburser: 'reimburser@test.com',
                    state: CONST.BANK_ACCOUNT.STATE.OPEN,
                },
            });
            const bankAccountList = {
                ...createBankAccountList('9876'),
                ...createPersonalBankAccount('5678'),
            };

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, expenseReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, createChatReport());
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
                await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);
            });

            render(
                <SettlementButtonWrapper>
                    <SettlementButton
                        {...defaultProps}
                        iouReport={expenseReport}
                    />
                </SettlementButtonWrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            // Wallet option should NOT appear for expense reports
            expect(screen.queryByText(translateLocal('iou.settleWallet', {formattedAmount: ''}))).toBeNull();
        });
    });

    describe('special cases', () => {
        it('returns undefined for secondLineText when only ELSEWHERE options are available', async () => {
            const iouReport = createIOUReport();

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, iouReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, createChatReport());
                // No bank accounts configured - only ELSEWHERE option available
            });

            render(
                <SettlementButtonWrapper>
                    <SettlementButton
                        {...defaultProps}
                        iouReport={iouReport}
                        policyID={undefined}
                    />
                </SettlementButtonWrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            // No subtitle should be shown when only ELSEWHERE is available
            expect(screen.queryByText(translateLocal('common.wallet'))).toBeNull();
        });

        it('shows policy name when lastPaymentPolicy exists', async () => {
            const iouReport = createIOUReport();
            const policy = createTestPolicy({name: 'My Workspace'});

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, iouReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, createChatReport());
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
                // When lastPaymentMethod points to a policyID instead of a payment type,
                // it shows that policy's name as the subtitle
                await Onyx.merge(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {
                    [CONST.POLICY.ID_FAKE]: {
                        lastUsed: {name: POLICY_ID},
                        iou: {name: POLICY_ID},
                        expense: {name: POLICY_ID},
                        invoice: POLICY_ID,
                    },
                });
            });

            render(
                <SettlementButtonWrapper>
                    <SettlementButton
                        {...defaultProps}
                        iouReport={iouReport}
                        policyID={undefined}
                    />
                </SettlementButtonWrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            // Should show the policy name as subtitle
            expect(screen.getByText('My Workspace')).toBeTruthy();
        });
    });
});
