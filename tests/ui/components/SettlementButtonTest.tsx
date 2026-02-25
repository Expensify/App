/* eslint-disable react/jsx-props-no-spreading -- Using spread for defaultProps in tests for cleaner test code */
import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import DelegateNoAccessModalProvider from '@components/DelegateNoAccessModalProvider';
import KYCWallContextProvider from '@components/KYCWall/KYCWallContext';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import LockedAccountModalProvider from '@components/LockedAccountModalProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import SettlementButton from '@components/SettlementButton';
import type SettlementButtonProps from '@components/SettlementButton/types';
import {createWorkspace} from '@libs/actions/Policy/Policy';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BankAccountList, Beta, LastPaymentMethod, Policy, Report} from '@src/types/onyx';
import {translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/navigationRef', () => ({
    getCurrentRoute: jest.fn(() => ({
        name: 'Report',
        params: {},
    })),
    getState: jest.fn(() => ({})),
}));

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
        dismissModalWithReport: jest.fn(),
        getActiveRoute: jest.fn(() => ''),
        navigationRef: mockRef,
    };
});

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

jest.mock('@components/ProductTrainingContext', () => ({
    useProductTrainingContext: () => [false],
}));

jest.mock('@src/hooks/useResponsiveLayout');

jest.mock('@libs/actions/Policy/Policy', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/actions/Policy/Policy'),
    createWorkspace: jest.fn(() => ({policyID: 'mock-created-policy-id'})),
}));

const ACCOUNT_ID = 1;
const ACCOUNT_LOGIN = 'test@user.com';
const REPORT_ID = '100';
const CHAT_REPORT_ID = '200';
const POLICY_ID = 'test-policy-id';
const BANK_ACCOUNT_ID = 12345;

function SettlementButtonWrapper({children}: {children: React.ReactNode}) {
    return (
        <ComposeProviders
            components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider, DelegateNoAccessModalProvider, LockedAccountModalProvider, KYCWallContextProvider]}
        >
            {children}
        </ComposeProviders>
    );
}

function createIOUReport(overrides?: Partial<Report>): Report {
    return {
        reportID: REPORT_ID,
        type: CONST.REPORT.TYPE.IOU,
        ownerAccountID: 2,
        currency: CONST.CURRENCY.USD,
        policyID: POLICY_ID,
        ...overrides,
    } as Report;
}

function createExpenseReport(overrides?: Partial<Report>): Report {
    return {
        reportID: REPORT_ID,
        type: CONST.REPORT.TYPE.EXPENSE,
        ownerAccountID: 2,
        currency: CONST.CURRENCY.USD,
        policyID: POLICY_ID,
        ...overrides,
    } as Report;
}

function createInvoiceReport(overrides?: Partial<Report>): Report {
    return {
        reportID: REPORT_ID,
        type: CONST.REPORT.TYPE.INVOICE,
        ownerAccountID: 2,
        currency: CONST.CURRENCY.USD,
        policyID: POLICY_ID,
        ...overrides,
    } as Report;
}

function createChatReport(overrides?: Partial<Report>): Report {
    return {
        reportID: CHAT_REPORT_ID,
        type: CONST.REPORT.TYPE.CHAT,
        ...overrides,
    } as Report;
}

function createTestPolicy(overrides?: Partial<Policy>): Policy {
    return {
        id: POLICY_ID,
        name: 'Test Policy',
        type: CONST.POLICY.TYPE.TEAM,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: ACCOUNT_LOGIN,
        ownerAccountID: ACCOUNT_ID,
        outputCurrency: CONST.CURRENCY.USD,
        isPolicyExpenseChatEnabled: true,
        ...overrides,
    } as Policy;
}

function createBankAccountList(accountNumber = '1234', type: string = CONST.BANK_ACCOUNT.TYPE.BUSINESS): BankAccountList {
    return {
        [BANK_ACCOUNT_ID]: {
            methodID: BANK_ACCOUNT_ID,
            bankCurrency: CONST.CURRENCY.USD,
            bankCountry: 'US',
            title: 'Test Bank Account',
            description: `Account ending in ${accountNumber}`,
            accountData: {
                bankAccountID: BANK_ACCOUNT_ID,
                type,
                state: CONST.BANK_ACCOUNT.STATE.OPEN,
                accountNumber: `00000${accountNumber}`,
                routingNumber: '123456789',
                addressName: 'Test Account',
            },
        },
    } as BankAccountList;
}

function createPersonalBankAccount(accountNumber = '5678'): BankAccountList {
    return createBankAccountList(accountNumber, CONST.BANK_ACCOUNT.TYPE.PERSONAL);
}

const defaultProps: SettlementButtonProps = {
    onPress: jest.fn(),
    enablePaymentsRoute: ROUTES.ENABLE_PAYMENTS,
    policyID: POLICY_ID,
    formattedAmount: '$100.00',
    currency: CONST.CURRENCY.USD,
    chatReportID: CHAT_REPORT_ID,
};

type OnyxSetupParams = {
    report?: Report;
    chatReport?: Report;
    policy?: Policy;
    bankAccountList?: BankAccountList;
    lastPaymentMethod?: LastPaymentMethod;
    userWallet?: {tierName?: ValueOf<typeof CONST.WALLET.TIER_NAME>};
    betas?: Beta[];
};

async function setupOnyxState({report, chatReport, policy, bankAccountList, lastPaymentMethod, userWallet, betas}: OnyxSetupParams) {
    await act(async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID, email: ACCOUNT_LOGIN});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [ACCOUNT_ID]: {accountID: ACCOUNT_ID, login: ACCOUNT_LOGIN, displayName: 'Test User'},
        });

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
        if (userWallet) {
            await Onyx.merge(ONYXKEYS.USER_WALLET, userWallet);
        }
        if (betas) {
            await Onyx.merge(ONYXKEYS.BETAS, betas);
        }
    });
}

describe('SettlementButton', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]});
        IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    describe('customText', () => {
        it('shows "Pay" when shouldUseShortForm is true', async () => {
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

        it('shows "Pay elsewhere" when lastPaymentMethod is ELSEWHERE', async () => {
            const iouReport = createIOUReport();

            await setupOnyxState({
                report: iouReport,
                chatReport: createChatReport(),
                lastPaymentMethod: {
                    [POLICY_ID]: {
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
                    />
                </SettlementButtonWrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(translateLocal('iou.payElsewhere', '$100.00'))).toBeTruthy();
        });

        it('shows "Pay $X" (settlePayment) by default with a preferred payment method', async () => {
            const iouReport = createIOUReport();

            await setupOnyxState({
                report: iouReport,
                chatReport: createChatReport(),
                lastPaymentMethod: {
                    [POLICY_ID]: {
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
                    />
                </SettlementButtonWrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(translateLocal('iou.settlePayment', '$100.00'))).toBeTruthy();
        });
    });

    describe('secondLineText', () => {
        it('shows no subtitle when shouldUseShortForm is true', async () => {
            const iouReport = createIOUReport();

            await setupOnyxState({
                report: iouReport,
                chatReport: createChatReport(),
                bankAccountList: createPersonalBankAccount(),
                lastPaymentMethod: {
                    [POLICY_ID]: {
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
                    />
                </SettlementButtonWrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText(translateLocal('common.wallet'))).toBeNull();
        });

        it('shows no subtitle when lastPaymentMethod is ELSEWHERE', async () => {
            const iouReport = createIOUReport();

            await setupOnyxState({
                report: iouReport,
                chatReport: createChatReport(),
                lastPaymentMethod: {
                    [POLICY_ID]: {
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
                    />
                </SettlementButtonWrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText(translateLocal('common.wallet'))).toBeNull();
        });

        it('shows bank account last four for expense report with VBBA payment and policy achAccount', async () => {
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
                        lastUsed: {name: CONST.IOU.PAYMENT_TYPE.VBBA, bankAccountID: BANK_ACCOUNT_ID},
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
            expect(screen.getByText(translateLocal('paymentMethodList.bankAccountLastFour', '9876'))).toBeTruthy();
        });

        it('shows "Wallet" for IOU report with EXPENSIFY payment method and personal bank account', async () => {
            const iouReport = createIOUReport();

            await setupOnyxState({
                report: iouReport,
                chatReport: createChatReport(),
                bankAccountList: createPersonalBankAccount(),
                userWallet: {tierName: CONST.WALLET.TIER_NAME.GOLD},
                lastPaymentMethod: {
                    [POLICY_ID]: {
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
                    />
                </SettlementButtonWrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(translateLocal('common.wallet'))).toBeTruthy();
        });

        it('shows policy name as subtitle when lastPaymentMethod resolves to a policy', async () => {
            const iouReport = createIOUReport();
            const WORKSPACE_POLICY_ID = 'workspace-policy-id';

            await setupOnyxState({
                report: iouReport,
                chatReport: createChatReport(),
                lastPaymentMethod: {
                    [POLICY_ID]: {
                        lastUsed: {name: WORKSPACE_POLICY_ID},
                        iou: {name: WORKSPACE_POLICY_ID},
                        expense: {name: WORKSPACE_POLICY_ID},
                        invoice: WORKSPACE_POLICY_ID,
                    },
                },
            });

            await act(async () => {
                await Onyx.merge(
                    `${ONYXKEYS.COLLECTION.POLICY}${WORKSPACE_POLICY_ID}`,
                    createTestPolicy({
                        id: WORKSPACE_POLICY_ID,
                        name: 'My Workspace',
                    }),
                );
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

            expect(screen.getByText('My Workspace')).toBeTruthy();
        });

        it('shows no wallet subtitle when EXPENSIFY method but no personal bank accounts', async () => {
            const iouReport = createIOUReport();

            await setupOnyxState({
                report: iouReport,
                chatReport: createChatReport(),
                userWallet: {tierName: CONST.WALLET.TIER_NAME.GOLD},
                lastPaymentMethod: {
                    [POLICY_ID]: {
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
                    />
                </SettlementButtonWrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText(translateLocal('common.wallet'))).toBeNull();
        });

        it('renders button when VBBA payment but achAccount has no account number', async () => {
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

        it('shows bank from formattedPaymentMethods when achAccount lacks accountNumber but hasIntentToPay', async () => {
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
                // No lastPaymentMethod → hasIntentToPay = true (achAccount.state === OPEN && !lastPaymentMethod)
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

        it('shows no subtitle when shouldHidePaymentOptions and onlyShowPayElsewhere are set', async () => {
            const iouReport = createIOUReport();

            await setupOnyxState({
                report: iouReport,
                chatReport: createChatReport(),
                bankAccountList: createPersonalBankAccount(),
                lastPaymentMethod: {
                    [POLICY_ID]: {
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
                        shouldHidePaymentOptions
                        onlyShowPayElsewhere
                    />
                </SettlementButtonWrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText(translateLocal('common.wallet'))).toBeNull();
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
                betas: [CONST.BETAS.PAY_INVOICE_VIA_EXPENSIFY],
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
                betas: [CONST.BETAS.PAY_INVOICE_VIA_EXPENSIFY],
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
            const testPolicy = createTestPolicy({
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
                ...createPersonalBankAccount(),
            };

            await setupOnyxState({
                report: expenseReport,
                chatReport: createChatReport(),
                policy: testPolicy,
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

            expect(screen.queryByText(translateLocal('common.wallet'))).toBeNull();

            const payButton = screen.getByText(translateLocal('iou.settlePayment', '$100.00'));
            fireEvent.press(payButton);
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText(translateLocal('iou.settleWallet', ''))).toBeNull();
        });

        it('shows wallet option in dropdown for IOU reports with personal bank account', async () => {
            const iouReport = createIOUReport();

            await setupOnyxState({
                report: iouReport,
                chatReport: createChatReport(),
                bankAccountList: createPersonalBankAccount(),
                userWallet: {tierName: CONST.WALLET.TIER_NAME.GOLD},
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

            const payButton = screen.getByText(translateLocal('iou.settlePayment', '$100.00'));
            fireEvent.press(payButton);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(translateLocal('iou.settleWallet', ''))).toBeTruthy();
        });

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

        it('filters out partially setup bank accounts from invoice payment options', async () => {
            const invoiceReport = createInvoiceReport();

            const openAccountID = 11111;
            const setupAccountID = 22222;
            const bankAccountListWithPartial: BankAccountList = {
                [openAccountID]: {
                    methodID: openAccountID,
                    bankCurrency: CONST.CURRENCY.USD,
                    bankCountry: 'US',
                    title: 'Open Business Account',
                    description: 'Account ending in 1111',
                    accountData: {
                        bankAccountID: openAccountID,
                        type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
                        state: CONST.BANK_ACCOUNT.STATE.OPEN,
                        accountNumber: '000001111',
                        routingNumber: '123456789',
                        addressName: 'Open Account',
                    },
                },
                [setupAccountID]: {
                    methodID: setupAccountID,
                    bankCurrency: CONST.CURRENCY.USD,
                    bankCountry: 'US',
                    title: 'Setup Business Account',
                    description: 'Account ending in 2222',
                    accountData: {
                        bankAccountID: setupAccountID,
                        type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
                        state: CONST.BANK_ACCOUNT.STATE.SETUP,
                        accountNumber: '000002222',
                        routingNumber: '123456789',
                        addressName: 'Setup Account',
                    },
                },
            } as BankAccountList;

            await setupOnyxState({
                report: invoiceReport,
                chatReport: createChatReport({
                    chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                    invoiceReceiver: {
                        type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS,
                        policyID: POLICY_ID,
                    },
                }),
                policy: createTestPolicy(),
                bankAccountList: bankAccountListWithPartial,
                betas: [CONST.BETAS.PAY_INVOICE_VIA_EXPENSIFY],
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

            const payButton = screen.getByText(translateLocal('iou.settlePayment', '$100.00'));
            fireEvent.press(payButton);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('Open Business Account')).toBeTruthy();
            expect(screen.queryByText('Setup Business Account')).toBeNull();
        });
    });

    describe('createWorkspace regression test', () => {
        it('should NOT call createWorkspace during render for invoice scenarios', async () => {
            const createWorkspaceMock = createWorkspace as jest.Mock;
            createWorkspaceMock.mockClear();

            const invoiceReport = createInvoiceReport();

            await setupOnyxState({
                report: invoiceReport,
                chatReport: createChatReport({
                    chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                    invoiceReceiver: {
                        type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
                        accountID: ACCOUNT_ID,
                    },
                }),
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

            expect(createWorkspaceMock).not.toHaveBeenCalled();
        });
    });
});
