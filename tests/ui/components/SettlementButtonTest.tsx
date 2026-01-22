/* eslint-disable react/jsx-props-no-spreading -- Using spread for defaultProps in tests for cleaner test code */
import {act, fireEvent, render, screen} from '@testing-library/react-native';
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

const ACCOUNT_ID = 1;
const ACCOUNT_LOGIN = 'test@user.com';
const REPORT_ID = '123';
const CHAT_REPORT_ID = '456';
const POLICY_ID = 'test-policy-id';
const BANK_ACCOUNT_ID = 12345;

/**
 * Helper to create a basic policy for testing.
 * Uses Partial<Policy> internally but casts to Policy for test convenience.
 * This is acceptable in tests where we only need specific fields.
 */
function createTestPolicy(overrides: Partial<Policy> = {}): Policy {
    const basePolicy: Partial<Policy> = {
        id: POLICY_ID,
        name: 'Test Policy',
        type: CONST.POLICY.TYPE.CORPORATE,
        owner: ACCOUNT_LOGIN,
        ownerAccountID: ACCOUNT_ID,
        outputCurrency: 'USD',
        role: CONST.POLICY.ROLE.ADMIN,
        isPolicyExpenseChatEnabled: true,
    };
    return {...basePolicy, ...overrides} as Policy;
}

/**
 * Helper to create IOU report for testing personal money requests.
 */
function createIOUReport(overrides: Partial<Report> = {}): Report {
    const baseReport: Partial<Report> = {
        reportID: REPORT_ID,
        type: CONST.REPORT.TYPE.IOU,
        ownerAccountID: ACCOUNT_ID,
        managerID: 2,
        currency: 'USD',
        total: 10000,
        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
    };
    return {...baseReport, ...overrides} as Report;
}

/**
 * Helper to create expense report for testing workspace reimbursements.
 */
function createExpenseReport(overrides: Partial<Report> = {}): Report {
    const baseReport: Partial<Report> = {
        reportID: REPORT_ID,
        type: CONST.REPORT.TYPE.EXPENSE,
        policyID: POLICY_ID,
        ownerAccountID: ACCOUNT_ID,
        managerID: 2,
        currency: 'USD',
        total: 10000,
        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
    };
    return {...baseReport, ...overrides} as Report;
}

/**
 * Helper to create invoice report for testing billing.
 */
function createInvoiceReport(overrides: Partial<Report> = {}): Report {
    const baseReport: Partial<Report> = {
        reportID: REPORT_ID,
        type: CONST.REPORT.TYPE.INVOICE,
        policyID: POLICY_ID,
        ownerAccountID: ACCOUNT_ID,
        managerID: 2,
        currency: 'USD',
        total: 10000,
        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
    };
    return {...baseReport, ...overrides} as Report;
}

/**
 * Helper to create chat report for testing report relationships.
 */
function createChatReport(overrides: Partial<Report> = {}): Report {
    const baseReport: Partial<Report> = {
        reportID: CHAT_REPORT_ID,
        type: CONST.REPORT.TYPE.CHAT,
        policyID: POLICY_ID,
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
    };
    return {...baseReport, ...overrides} as Report;
}

/**
 * Helper to create business bank account list for testing.
 */
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

/**
 * Helper to create personal bank account for testing wallet payments.
 */
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

/**
 * Wrapper component with all required providers for rendering SettlementButton.
 */
function SettlementButtonWrapper({children}: {children: React.ReactNode}) {
    return (
        <OnyxListItemProvider>
            <CurrentUserPersonalDetailsProvider>
                <LocaleContextProvider>{children}</LocaleContextProvider>
            </CurrentUserPersonalDetailsProvider>
        </OnyxListItemProvider>
    );
}

type OnyxSetupParams = {
    report?: Report;
    chatReport?: Report;
    policy?: Policy;
    bankAccountList?: BankAccountList;
    lastPaymentMethod?: LastPaymentMethod;
};

/**
 * Helper to set up Onyx state for tests, reducing boilerplate.
 */
async function setupOnyxState({report, chatReport, policy, bankAccountList, lastPaymentMethod}: OnyxSetupParams) {
    await act(async () => {
        if (report) {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
        }
        if (chatReport) {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, chatReport);
        }
        if (policy) {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        }
        if (bankAccountList) {
            await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);
        }
        if (lastPaymentMethod) {
            await Onyx.merge(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, lastPaymentMethod);
        }
    });
}

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

    describe('button label', () => {
        it('displays short form "Pay" when shouldUseShortForm is true', async () => {
            const iouReport = createIOUReport();

            await setupOnyxState({
                report: iouReport,
                chatReport: createChatReport(),
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

        it('displays "Pay elsewhere" (iou.payElsewhere) when last payment method is ELSEWHERE', async () => {
            const iouReport = createIOUReport();

            await setupOnyxState({
                report: iouReport,
                chatReport: createChatReport(),
                lastPaymentMethod: {
                    [CONST.POLICY.ID_FAKE]: {
                        lastUsed: {name: CONST.IOU.PAYMENT_TYPE.ELSEWHERE},
                        iou: {name: CONST.IOU.PAYMENT_TYPE.ELSEWHERE},
                        expense: {name: CONST.IOU.PAYMENT_TYPE.ELSEWHERE},
                        invoice: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                    },
                },
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

            expect(screen.getByText(translateLocal('iou.payElsewhere', '$100.00'))).toBeTruthy();
        });

        it('displays "Pay $100.00" by default', async () => {
            const iouReport = createIOUReport();

            await setupOnyxState({
                report: iouReport,
                chatReport: createChatReport(),
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

            expect(screen.getByText(translateLocal('iou.settlePayment', '$100.00'))).toBeTruthy();
        });
    });

    describe('button subtitle', () => {
        describe('IOU reports', () => {
            it('shows no subtitle when shouldUseShortForm is true', async () => {
                const iouReport = createIOUReport();

                await setupOnyxState({
                    report: iouReport,
                    chatReport: createChatReport(),
                    bankAccountList: createPersonalBankAccount(),
                    lastPaymentMethod: {
                        [CONST.POLICY.ID_FAKE]: {
                            lastUsed: {name: CONST.IOU.PAYMENT_TYPE.EXPENSIFY},
                            iou: {name: CONST.IOU.PAYMENT_TYPE.EXPENSIFY},
                            expense: {name: CONST.IOU.PAYMENT_TYPE.EXPENSIFY},
                            invoice: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                        },
                    },
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

                expect(screen.queryByText(translateLocal('common.wallet'))).toBeNull();
            });

            it('shows no subtitle when last payment method is ELSEWHERE', async () => {
                const iouReport = createIOUReport();

                await setupOnyxState({
                    report: iouReport,
                    chatReport: createChatReport(),
                    lastPaymentMethod: {
                        [CONST.POLICY.ID_FAKE]: {
                            lastUsed: {name: CONST.IOU.PAYMENT_TYPE.ELSEWHERE},
                            iou: {name: CONST.IOU.PAYMENT_TYPE.ELSEWHERE},
                            expense: {name: CONST.IOU.PAYMENT_TYPE.ELSEWHERE},
                            invoice: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                        },
                    },
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

                expect(screen.queryByText(translateLocal('common.wallet'))).toBeNull();
            });

            it('shows no subtitle when only ELSEWHERE option is available', async () => {
                const iouReport = createIOUReport();

                await setupOnyxState({
                    report: iouReport,
                    chatReport: createChatReport(),
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

                expect(screen.queryByText(translateLocal('common.wallet'))).toBeNull();
            });

            it('shows "Wallet" when payment method is EXPENSIFY and personal bank accounts exist', async () => {
                const iouReport = createIOUReport();

                await setupOnyxState({
                    report: iouReport,
                    chatReport: createChatReport(),
                    bankAccountList: createPersonalBankAccount(),
                    lastPaymentMethod: {
                        [CONST.POLICY.ID_FAKE]: {
                            lastUsed: {name: CONST.IOU.PAYMENT_TYPE.EXPENSIFY},
                            iou: {name: CONST.IOU.PAYMENT_TYPE.EXPENSIFY},
                            expense: {name: CONST.IOU.PAYMENT_TYPE.EXPENSIFY},
                            invoice: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                        },
                    },
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

            it('shows no wallet when payment method is EXPENSIFY but no personal bank accounts exist', async () => {
                const iouReport = createIOUReport();

                await setupOnyxState({
                    report: iouReport,
                    chatReport: createChatReport(),
                    lastPaymentMethod: {
                        [CONST.POLICY.ID_FAKE]: {
                            lastUsed: {name: CONST.IOU.PAYMENT_TYPE.EXPENSIFY},
                            iou: {name: CONST.IOU.PAYMENT_TYPE.EXPENSIFY},
                            expense: {name: CONST.IOU.PAYMENT_TYPE.EXPENSIFY},
                            invoice: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                        },
                    },
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

                expect(screen.queryByText(translateLocal('common.wallet'))).toBeNull();
            });

            it('shows no wallet when only business bank accounts exist', async () => {
                const iouReport = createIOUReport();

                await setupOnyxState({
                    report: iouReport,
                    chatReport: createChatReport(),
                    bankAccountList: createBankAccountList('9999'),
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

                expect(screen.queryByText(translateLocal('common.wallet'))).toBeNull();
                expect(screen.queryByText(translateLocal('iou.settleWallet', ''))).toBeNull();
            });

            it('shows policy name when last payment method references a policy', async () => {
                const iouReport = createIOUReport();

                await setupOnyxState({
                    report: iouReport,
                    chatReport: createChatReport(),
                    policy: createTestPolicy({name: 'My Workspace'}),
                    lastPaymentMethod: {
                        [CONST.POLICY.ID_FAKE]: {
                            lastUsed: {name: POLICY_ID},
                            iou: {name: POLICY_ID},
                            expense: {name: POLICY_ID},
                            invoice: POLICY_ID,
                        },
                    },
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

                expect(screen.getByText('My Workspace')).toBeTruthy();
            });

            it('does not show bank account last four digits (only expense reports show this)', async () => {
                const iouReport = createIOUReport();

                await setupOnyxState({
                    report: iouReport,
                    chatReport: createChatReport(),
                    bankAccountList: createBankAccountList('7777'),
                    lastPaymentMethod: {
                        [CONST.POLICY.ID_FAKE]: {
                            lastUsed: {name: CONST.IOU.PAYMENT_TYPE.VBBA},
                            iou: {name: CONST.IOU.PAYMENT_TYPE.VBBA},
                            expense: {name: CONST.IOU.PAYMENT_TYPE.VBBA},
                            invoice: CONST.IOU.PAYMENT_TYPE.VBBA,
                        },
                    },
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

                expect(screen.queryByText(translateLocal('paymentMethodList.bankAccountLastFour', '7777'))).toBeNull();
            });
        });

        describe('expense reports', () => {
            it('shows bank account last four digits when policy has achAccount', async () => {
                const expenseReport = createExpenseReport();

                await setupOnyxState({
                    report: expenseReport,
                    chatReport: createChatReport(),
                    policy: createTestPolicy({
                        achAccount: {
                            bankAccountID: BANK_ACCOUNT_ID,
                            accountNumber: '9876',
                            routingNumber: '123456789',
                            addressName: 'Test Business',
                            bankName: 'Test Bank',
                            reimburser: 'reimburser@test.com',
                            state: CONST.BANK_ACCOUNT.STATE.OPEN,
                        },
                    }),
                    bankAccountList: createBankAccountList('9876'),
                    lastPaymentMethod: {
                        [POLICY_ID]: {
                            lastUsed: {name: CONST.IOU.PAYMENT_TYPE.VBBA},
                            iou: {name: CONST.IOU.PAYMENT_TYPE.VBBA},
                            expense: {name: CONST.IOU.PAYMENT_TYPE.VBBA},
                            invoice: CONST.IOU.PAYMENT_TYPE.VBBA,
                        },
                    },
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

                expect(screen.getByText(translateLocal('paymentMethodList.bankAccountLastFour', '9876'))).toBeTruthy();
            });

            it('shows bank account not wallet even with personal bank accounts', async () => {
                const expenseReport = createExpenseReport();

                await setupOnyxState({
                    report: expenseReport,
                    chatReport: createChatReport(),
                    policy: createTestPolicy({
                        achAccount: {
                            bankAccountID: BANK_ACCOUNT_ID,
                            accountNumber: '9876',
                            routingNumber: '123456789',
                            addressName: 'Test Business',
                            bankName: 'Test Bank',
                            reimburser: 'reimburser@test.com',
                            state: CONST.BANK_ACCOUNT.STATE.OPEN,
                        },
                    }),
                    bankAccountList: {
                        ...createBankAccountList('9876'),
                        ...createPersonalBankAccount('5678'),
                    },
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

                expect(screen.getByText(translateLocal('paymentMethodList.bankAccountLastFour', '9876'))).toBeTruthy();
                expect(screen.queryByText(translateLocal('common.wallet'))).toBeNull();
            });

            it('shows bank account when hasIntentToPay is true with policy achAccount', async () => {
                const expenseReport = createExpenseReport();

                await setupOnyxState({
                    report: expenseReport,
                    chatReport: createChatReport(),
                    policy: createTestPolicy({
                        achAccount: {
                            bankAccountID: BANK_ACCOUNT_ID,
                            accountNumber: '4321',
                            routingNumber: '123456789',
                            addressName: 'Test Business',
                            bankName: 'Test Bank',
                            reimburser: 'reimburser@test.com',
                            state: CONST.BANK_ACCOUNT.STATE.OPEN,
                        },
                    }),
                    bankAccountList: createBankAccountList('4321'),
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

                expect(screen.getByText(translateLocal('paymentMethodList.bankAccountLastFour', '4321'))).toBeTruthy();
                expect(screen.queryByText(translateLocal('common.wallet'))).toBeNull();
            });

            it('shows bank account even when hasIntentToPay but no personal bank accounts', async () => {
                const expenseReport = createExpenseReport();

                await setupOnyxState({
                    report: expenseReport,
                    chatReport: createChatReport(),
                    policy: createTestPolicy({
                        achAccount: {
                            bankAccountID: BANK_ACCOUNT_ID,
                            accountNumber: '1111',
                            routingNumber: '123456789',
                            addressName: 'Test Business',
                            bankName: 'Test Bank',
                            reimburser: 'reimburser@test.com',
                            state: CONST.BANK_ACCOUNT.STATE.OPEN,
                        },
                    }),
                    bankAccountList: createBankAccountList('1111'),
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

                expect(screen.getByText(translateLocal('paymentMethodList.bankAccountLastFour', '1111'))).toBeTruthy();
                expect(screen.queryByText(translateLocal('common.wallet'))).toBeNull();
            });

            it('renders button when VBBA payment method but achAccount has no account number', async () => {
                const expenseReport = createExpenseReport();

                await setupOnyxState({
                    report: expenseReport,
                    chatReport: createChatReport(),
                    policy: createTestPolicy({
                        achAccount: {
                            bankAccountID: BANK_ACCOUNT_ID,
                            routingNumber: '123456789',
                            addressName: 'Test Business',
                            bankName: 'Test Bank',
                            reimburser: 'reimburser@test.com',
                            state: CONST.BANK_ACCOUNT.STATE.OPEN,
                        } as Policy['achAccount'],
                    }),
                    lastPaymentMethod: {
                        [POLICY_ID]: {
                            lastUsed: {name: CONST.IOU.PAYMENT_TYPE.VBBA},
                            iou: {name: CONST.IOU.PAYMENT_TYPE.VBBA},
                            expense: {name: CONST.IOU.PAYMENT_TYPE.VBBA},
                            invoice: CONST.IOU.PAYMENT_TYPE.VBBA,
                        },
                    },
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

                expect(screen.getByText(translateLocal('iou.settlePayment', '$100.00'))).toBeTruthy();
            });

            it('shows bank account from formattedPaymentMethods when achAccount has no account number but hasIntentToPay', async () => {
                const expenseReport = createExpenseReport();

                await setupOnyxState({
                    report: expenseReport,
                    chatReport: createChatReport(),
                    policy: createTestPolicy({
                        achAccount: {
                            bankAccountID: BANK_ACCOUNT_ID,
                            routingNumber: '123456789',
                            addressName: 'Test Business',
                            bankName: 'Test Bank',
                            reimburser: 'reimburser@test.com',
                            state: CONST.BANK_ACCOUNT.STATE.OPEN,
                        } as Policy['achAccount'],
                    }),
                    bankAccountList: createBankAccountList('3333'),
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

                expect(screen.getByText(translateLocal('paymentMethodList.bankAccountLastFour', '3333'))).toBeTruthy();
            });

            it('shows bank account when business bank matches policy achAccount via lastBankAccountID', async () => {
                const expenseReport = createExpenseReport();

                await setupOnyxState({
                    report: expenseReport,
                    chatReport: createChatReport(),
                    policy: createTestPolicy({
                        achAccount: {
                            bankAccountID: BANK_ACCOUNT_ID,
                            accountNumber: '2222',
                            routingNumber: '123456789',
                            addressName: 'Test Business',
                            bankName: 'Test Bank',
                            reimburser: 'reimburser@test.com',
                            state: CONST.BANK_ACCOUNT.STATE.OPEN,
                        },
                    }),
                    bankAccountList: createBankAccountList('2222'),
                    lastPaymentMethod: {
                        [POLICY_ID]: {
                            lastUsed: {name: 'customPaymentMethod', bankAccountID: BANK_ACCOUNT_ID},
                            iou: {name: 'customPaymentMethod', bankAccountID: BANK_ACCOUNT_ID},
                            expense: {name: 'customPaymentMethod', bankAccountID: BANK_ACCOUNT_ID},
                            invoice: 'customPaymentMethod',
                        },
                    },
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

                expect(screen.getByText(translateLocal('paymentMethodList.bankAccountLastFour', '2222'))).toBeTruthy();
            });
        });

        describe('invoice reports', () => {
            it('renders payment button for invoice report', async () => {
                const invoiceReport = createInvoiceReport();

                await setupOnyxState({
                    report: invoiceReport,
                    chatReport: createChatReport({
                        invoiceReceiver: {
                            type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
                            accountID: 2,
                        },
                    }),
                    policy: createTestPolicy(),
                    bankAccountList: createBankAccountList('8888'),
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

                expect(screen.getByText(translateLocal('iou.settlePayment', '$100.00'))).toBeTruthy();
            });

            it('shows business bank label for invoice with business bank account and hasIntentToPay', async () => {
                const invoiceReport = createInvoiceReport();

                await setupOnyxState({
                    report: invoiceReport,
                    chatReport: createChatReport({
                        invoiceReceiver: {
                            type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
                            accountID: 2,
                        },
                    }),
                    policy: createTestPolicy({
                        achAccount: {
                            bankAccountID: BANK_ACCOUNT_ID,
                            accountNumber: '4444',
                            routingNumber: '123456789',
                            addressName: 'Test Business',
                            bankName: 'Test Bank',
                            reimburser: 'reimburser@test.com',
                            state: CONST.BANK_ACCOUNT.STATE.OPEN,
                        },
                    }),
                    bankAccountList: createBankAccountList('4444'),
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

                expect(screen.getByText(translateLocal('iou.invoiceBusinessBank', '4444'))).toBeTruthy();
            });

            it('shows personal bank label for invoice with personal bank account and hasIntentToPay', async () => {
                const invoiceReport = createInvoiceReport();

                await setupOnyxState({
                    report: invoiceReport,
                    chatReport: createChatReport({
                        invoiceReceiver: {
                            type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
                            accountID: 2,
                        },
                    }),
                    policy: createTestPolicy({
                        achAccount: {
                            bankAccountID: BANK_ACCOUNT_ID,
                            accountNumber: '5555',
                            routingNumber: '123456789',
                            addressName: 'Test Business',
                            bankName: 'Test Bank',
                            reimburser: 'reimburser@test.com',
                            state: CONST.BANK_ACCOUNT.STATE.OPEN,
                        },
                    }),
                    bankAccountList: createPersonalBankAccount('5555'),
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

                expect(screen.getByText(translateLocal('iou.invoicePersonalBank', '5555'))).toBeTruthy();
            });
        });
    });

    describe('payment options dropdown', () => {
        it('shows approve button when shouldHidePaymentOptions and shouldShowApproveButton are true', async () => {
            const expenseReport = createExpenseReport();

            await setupOnyxState({
                report: expenseReport,
                chatReport: createChatReport(),
                policy: createTestPolicy(),
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

            expect(screen.getByText(translateLocal('iou.approve', {formattedAmount: '$100.00'}))).toBeTruthy();
        });

        it('does not show approve button when shouldShowApproveButton is false', async () => {
            const expenseReport = createExpenseReport();

            await setupOnyxState({
                report: expenseReport,
                chatReport: createChatReport(),
                policy: createTestPolicy(),
            });

            render(
                <SettlementButtonWrapper>
                    <SettlementButton
                        {...defaultProps}
                        iouReport={expenseReport}
                        shouldShowApproveButton={false}
                    />
                </SettlementButtonWrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText(translateLocal('iou.approve', {formattedAmount: '$100.00'}))).toBeNull();
        });

        it('does not show payment options when shouldHidePaymentOptions is true without approve button', async () => {
            const expenseReport = createExpenseReport();

            await setupOnyxState({
                report: expenseReport,
                chatReport: createChatReport(),
                policy: createTestPolicy(),
            });

            render(
                <SettlementButtonWrapper>
                    <SettlementButton
                        {...defaultProps}
                        iouReport={expenseReport}
                        shouldHidePaymentOptions
                        shouldShowApproveButton={false}
                    />
                </SettlementButtonWrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText(translateLocal('iou.approve', {formattedAmount: '$100.00'}))).toBeNull();
        });

        it('shows pay elsewhere button when onlyShowPayElsewhere is true', async () => {
            const iouReport = createIOUReport();

            await setupOnyxState({
                report: iouReport,
                chatReport: createChatReport(),
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

            expect(screen.getByText(translateLocal('iou.payElsewhere', ''))).toBeTruthy();
        });

        it('shows no subtitle when shouldHidePaymentOptions and onlyShowPayElsewhere are true', async () => {
            const iouReport = createIOUReport();

            await setupOnyxState({
                report: iouReport,
                chatReport: createChatReport(),
                bankAccountList: createPersonalBankAccount(),
                lastPaymentMethod: {
                    [CONST.POLICY.ID_FAKE]: {
                        lastUsed: {name: CONST.IOU.PAYMENT_TYPE.EXPENSIFY},
                        iou: {name: CONST.IOU.PAYMENT_TYPE.EXPENSIFY},
                        expense: {name: CONST.IOU.PAYMENT_TYPE.EXPENSIFY},
                        invoice: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                    },
                },
            });

            render(
                <SettlementButtonWrapper>
                    <SettlementButton
                        {...defaultProps}
                        iouReport={iouReport}
                        policyID={undefined}
                        shouldHidePaymentOptions
                        onlyShowPayElsewhere
                    />
                </SettlementButtonWrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText(translateLocal('common.wallet'))).toBeNull();
        });

        it('shows short form pay button when onlyShowPayElsewhere and shouldUseShortForm are true', async () => {
            const iouReport = createIOUReport();

            await setupOnyxState({
                report: iouReport,
                chatReport: createChatReport(),
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

            expect(screen.getByText(translateLocal('iou.pay'))).toBeTruthy();
        });

        it('does not show wallet option for expense reports (subtitle shows bank account)', async () => {
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

            await setupOnyxState({
                report: expenseReport,
                chatReport: createChatReport(),
                policy,
                bankAccountList,
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

            expect(screen.getByText(translateLocal('paymentMethodList.bankAccountLastFour', '9876'))).toBeTruthy();
            expect(screen.queryByText(translateLocal('common.wallet'))).toBeNull();

            const payButton = screen.getByText(translateLocal('iou.settlePayment', '$100.00'));
            fireEvent.press(payButton);
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText(translateLocal('iou.settleWallet', ''))).toBeNull();
        });
    });
});
