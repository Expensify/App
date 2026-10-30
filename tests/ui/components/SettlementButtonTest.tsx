import {act, fireEvent, render, screen} from '@testing-library/react-native';

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
import {navigateToBankAccountRoute} from '@libs/actions/ReimbursementAccount';
import Navigation from '@libs/Navigation/Navigation';

import {openPaymentMethods, openPaymentMethodsOnce} from '@userActions/PaymentMethods';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BankAccountList, Beta, LastPaymentMethod, Policy, Report} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import React from 'react';
import Onyx from 'react-native-onyx';

import {getOnyxData, translateLocal} from '../../utils/TestHelper';
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
        getActiveRouteWithoutParams: jest.fn(() => ''),
        isNavigationReady: jest.fn(() => Promise.resolve()),
        isTopmostRouteModalScreen: jest.fn(() => false),
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
        ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
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

jest.mock('@libs/actions/ReimbursementAccount', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/actions/ReimbursementAccount'),
    navigateToBankAccountRoute: jest.fn(),
}));

// Dropdown items defer onSelected until the popover finishes hiding, and the payment methods load once it has shown,
// so the modal has to report both.
jest.mock('@components/Modal/ReanimatedModal', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {useEffect, useRef}: {useEffect: typeof React.useEffect; useRef: typeof React.useRef} = require('react');

    return function MockReanimatedModal({
        isVisible,
        onModalShow,
        onModalHide,
        children,
    }: {
        isVisible: boolean;
        onModalShow?: () => void;
        onModalHide?: () => void;
        children: React.ReactElement;
    }) {
        // The popover mounts already visible, so it starts as hidden for the first render to count as it showing
        const wasVisible = useRef<boolean>(false);

        useEffect(() => {
            if (!wasVisible.current && isVisible) {
                onModalShow?.();
            }
            if (wasVisible.current && !isVisible) {
                onModalHide?.();
            }
            wasVisible.current = isVisible;
        }, [isVisible, onModalShow, onModalHide]);

        if (!isVisible) {
            return null;
        }

        return children;
    };
});

jest.mock('@userActions/PaymentMethods', () => ({
    ...jest.requireActual<Record<string, unknown>>('@userActions/PaymentMethods'),
    openPaymentMethods: jest.fn(),
    openPaymentMethodsOnce: jest.fn(),
}));

const mockVerifyAccountAndResume = jest.fn();

jest.mock('@hooks/useVerifyAccountAndResume', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        isUserValidated: true,
        verifyAccountAndResume: mockVerifyAccountAndResume,
    })),
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

// Fires the layout event the popover waits for before showing its modal, which never happens on its own in tests
function showMeasuredPopover() {
    fireEvent(screen.getByText(translateLocal('iou.payElsewhere', '')), 'layout', {nativeEvent: {layout: {width: 100, height: 100}}});
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
    extraPolicies?: Policy[];
    activePolicyID?: string;
    personalPolicyID?: string;
    bankAccountList?: BankAccountList;
    lastPaymentMethod?: LastPaymentMethod;
    userWallet?: {tierName?: ValueOf<typeof CONST.WALLET.TIER_NAME>};
    betas?: Beta[];
};

async function setupOnyxState({report, chatReport, policy, extraPolicies, activePolicyID, personalPolicyID, bankAccountList, lastPaymentMethod, userWallet, betas}: OnyxSetupParams) {
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
        for (const extraPolicy of extraPolicies ?? []) {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${extraPolicy.id}`, extraPolicy);
        }
        if (activePolicyID) {
            await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, activePolicyID);
        }
        if (personalPolicyID) {
            await Onyx.merge(ONYXKEYS.PERSONAL_POLICY_ID, personalPolicyID);
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

    describe('payment options dropdown', () => {
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

            const payButton = screen.getByText(translateLocal('iou.settlePayment', '$100.00'));
            fireEvent.press(payButton);
            expect(screen.getByText(translateLocal('iou.payElsewhere', ''))).toBeTruthy();
        });

        it('loads the payment methods when the options open on an AUD policy', async () => {
            // Given an expense report on an AUD policy, which can be paid via ABA
            const expenseReport = createExpenseReport({currency: CONST.CURRENCY.AUD});
            const onPaymentOptionsShow = jest.fn();
            await setupOnyxState({
                report: expenseReport,
                chatReport: createChatReport(),
                policy: createTestPolicy({outputCurrency: CONST.CURRENCY.AUD}),
            });

            render(
                <SettlementButtonWrapper>
                    <SettlementButton
                        {...defaultProps}
                        currency={CONST.CURRENCY.AUD}
                        iouReport={expenseReport}
                        onPaymentOptionsShow={onPaymentOptionsShow}
                    />
                </SettlementButtonWrapper>,
            );
            await waitForBatchedUpdatesWithAct();

            // When the payment options are opened
            fireEvent.press(screen.getByText(translateLocal('iou.settlePayment', '$100.00')));
            showMeasuredPopover();
            await waitForBatchedUpdatesWithAct();

            // Then the payment methods are loaded so the ABA option can be shown, and the caller still hears that the options opened
            expect(openPaymentMethods).toHaveBeenCalledTimes(1);
            expect(onPaymentOptionsShow).toHaveBeenCalledTimes(1);
        });

        it('loads the payment methods as soon as the button shows on an AUD policy', async () => {
            // Given an expense report on an AUD policy, which can be paid via ABA
            const expenseReport = createExpenseReport({currency: CONST.CURRENCY.AUD});
            await setupOnyxState({
                report: expenseReport,
                chatReport: createChatReport(),
                policy: createTestPolicy({outputCurrency: CONST.CURRENCY.AUD}),
            });

            // When the Pay button shows
            render(
                <SettlementButtonWrapper>
                    <SettlementButton
                        {...defaultProps}
                        currency={CONST.CURRENCY.AUD}
                        iouReport={expenseReport}
                    />
                </SettlementButtonWrapper>,
            );
            await waitForBatchedUpdatesWithAct();

            // Then the payment methods start loading before the options open, so the ABA option is there when they do
            expect(openPaymentMethodsOnce).toHaveBeenCalledTimes(1);
        });

        it('does not load the payment methods when the options open on a non-AUD policy', async () => {
            // Given an expense report on a USD policy, which can't be paid via ABA
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
                    />
                </SettlementButtonWrapper>,
            );
            await waitForBatchedUpdatesWithAct();

            // When the payment options are opened
            fireEvent.press(screen.getByText(translateLocal('iou.settlePayment', '$100.00')));
            showMeasuredPopover();
            await waitForBatchedUpdatesWithAct();

            // Then nothing is loaded, since there's no ABA option to show
            expect(openPaymentMethods).not.toHaveBeenCalled();
            expect(openPaymentMethodsOnce).not.toHaveBeenCalled();
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

    describe('pay via ABA', () => {
        function pressPayViaABA() {
            const menuItem = screen.getByTestId(`PopoverMenuItem-${translateLocal('iou.payViaABA')}`);

            // MenuItem only forwards the press when it receives an event, so a GestureResponderEvent-shaped one is required.
            fireEvent.press(menuItem, {nativeEvent: {}, type: 'press', target: menuItem, currentTarget: menuItem});
        }

        async function renderAUDExpenseReport(policyOverrides?: Partial<Policy>) {
            const expenseReport = createExpenseReport({currency: CONST.CURRENCY.AUD});
            const onPress = jest.fn();
            await setupOnyxState({
                report: expenseReport,
                chatReport: createChatReport(),
                policy: createTestPolicy({
                    outputCurrency: CONST.CURRENCY.AUD,
                    reimbursement: {countries: {[CONST.COUNTRY.AU]: {bankAccountID: BANK_ACCOUNT_ID, state: CONST.BANK_ACCOUNT.STATE.OPEN}}},
                    ...policyOverrides,
                }),
            });

            render(
                <SettlementButtonWrapper>
                    <SettlementButton
                        {...defaultProps}
                        currency={CONST.CURRENCY.AUD}
                        iouReport={expenseReport}
                        onPress={onPress}
                    />
                </SettlementButtonWrapper>,
            );
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByText(translateLocal('iou.settlePayment', '$100.00')));
            await waitForBatchedUpdatesWithAct();
            return onPress;
        }

        it('pays via ABA when an admin picks the option on an AUD workspace with an open AU withdrawal account', async () => {
            // Given an admin opening the payment options on an AUD workspace's report, with an open AU withdrawal account
            const onPress = await renderAUDExpenseReport();

            // When they pick "Pay via ABA"
            pressPayViaABA();
            await waitForBatchedUpdatesWithAct();

            // Then the report is paid as Elsewhere via ABA, since the ABA file pays it from outside Expensify
            expect(onPress).toHaveBeenCalledWith({paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE, paymentMethod: CONST.PAYMENT_METHODS.ABA});
        });

        it('does not show the option when the workspace has no AU withdrawal account', async () => {
            // Given an AUD workspace without an AU withdrawal account
            const policyOverrides = {reimbursement: {countries: {}}};

            // When the payment options are opened
            await renderAUDExpenseReport(policyOverrides);

            // Then "Pay via ABA" isn't offered, since there's no account for the ABA file to pay from
            expect(screen.queryByText(translateLocal('iou.payViaABA'))).toBeNull();
        });

        it('does not pay when the option is picked while offline', async () => {
            // Given the user is offline
            await act(async () => {
                await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true});
            });
            const onPress = await renderAUDExpenseReport();

            // When they pick "Pay via ABA"
            pressPayViaABA();
            await waitForBatchedUpdatesWithAct();

            // Then nothing is paid, since the ABA file can only be downloaded while online
            expect(onPress).not.toHaveBeenCalled();
        });
    });

    describe('createWorkspace regression test', () => {
        it('should NOT call createWorkspace during render for invoice scenarios', async () => {
            const createWorkspaceMock = jest.mocked(createWorkspace);
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

    describe('expense payment funding source', () => {
        const workspaceBankAccount = {
            bankAccountID: BANK_ACCOUNT_ID + 1,
            accountNumber: 'XXXX1111',
            routingNumber: '123456789',
            addressName: 'Workspace account',
            bankName: 'Workspace bank',
            reimburser: 'payer@test.com',
            state: CONST.BANK_ACCOUNT.STATE.OPEN,
        };

        async function selectExpensePaymentOption(policy: Policy, optionText: string, bankAccountList?: BankAccountList) {
            const expenseReport = createExpenseReport();
            await setupOnyxState({report: expenseReport, chatReport: createChatReport(), policy, bankAccountList});
            render(
                <SettlementButtonWrapper>
                    <SettlementButton
                        {...defaultProps}
                        iouReport={expenseReport}
                    />
                </SettlementButtonWrapper>,
            );
            await waitForBatchedUpdatesWithAct();
            fireEvent.press(screen.getByText(translateLocal('iou.settlePayment', '$100.00')));
            await waitForBatchedUpdatesWithAct();
            const menuItem = screen.getByTestId(`PopoverMenuItem-${optionText}`);
            fireEvent.press(menuItem, {nativeEvent: {}, type: 'press', target: menuItem, currentTarget: menuItem});
            await waitForBatchedUpdatesWithAct();
        }

        it.each([CONST.BANK_ACCOUNT.STATE.OPEN, CONST.BANK_ACCOUNT.STATE.LOCKED])('adds a standalone account when the inaccessible workspace account is %s', async (state) => {
            // Given an existing workspace account and stale setup data, neither may be used for a new funding source.
            const policy = createTestPolicy({achAccount: {...workspaceBankAccount, state}});
            await Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData: {bankAccountID: workspaceBankAccount.bankAccountID, policyID: POLICY_ID}});
            await Onyx.set(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {accountNumber: '1111'});

            // When an admin without that account chooses business-bank payment.
            await selectExpensePaymentOption(policy, translateLocal('iou.settleBusiness', ''));

            // Then setup receives no policyID and cannot replace the workspace account or reuse stale account details.
            expect(navigateToBankAccountRoute).toHaveBeenCalledWith({backTo: ''});
            expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.BANK_ACCOUNT_CONNECT_EXISTING_BUSINESS_BANK_ACCOUNT.getRoute(POLICY_ID));
            await getOnyxData({
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                callback: (setup) => {
                    expect(setup?.achData?.policyID).toBeFalsy();
                    expect(setup?.achData?.bankAccountID).toBeFalsy();
                },
            });
            await getOnyxData({key: `${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, callback: (workspace) => expect(workspace?.achAccount).toEqual(policy.achAccount)});
        });

        it('resumes the admin’s partially configured business account without linking it to the workspace', async () => {
            // Given an existing workspace account and another bank account that the admin has not finished setting up.
            const policy = createTestPolicy({achAccount: workspaceBankAccount});
            const bankAccountList = createBankAccountList();
            bankAccountList[BANK_ACCOUNT_ID].accountData = {...bankAccountList[BANK_ACCOUNT_ID].accountData, state: CONST.BANK_ACCOUNT.STATE.SETUP};

            await Onyx.set(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {accountNumber: '5678'});

            // When business-bank payment would otherwise open connect-existing setup.
            await selectExpensePaymentOption(policy, translateLocal('iou.settleBusiness', ''), bankAccountList);

            // Then the admin resumes their account and the workspace keeps its existing account.
            await getOnyxData({key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, callback: (draft) => expect(draft?.accountNumber).toBe('5678')});
            expect(navigateToBankAccountRoute).toHaveBeenCalledWith({bankAccountID: BANK_ACCOUNT_ID, backTo: ''});
            expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.BANK_ACCOUNT_CONNECT_EXISTING_BUSINESS_BANK_ACCOUNT.getRoute(POLICY_ID));
            await getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`,
                callback: (workspace) => expect(workspace?.achAccount).toEqual(workspaceBankAccount),
            });
        });

        it.each([
            {bankCurrency: CONST.CURRENCY.USD, policyIDs: ['another-workspace']},
            {bankCurrency: CONST.CURRENCY.GBP, policyIDs: []},
        ])('starts fresh instead of resuming a partial account with currency $bankCurrency and policies $policyIDs', async ({bankCurrency, policyIDs}) => {
            // Given a partial business account that belongs to another workspace or uses a different currency.
            const policy = createTestPolicy({achAccount: workspaceBankAccount});
            const bankAccountList = createBankAccountList();
            bankAccountList[BANK_ACCOUNT_ID].bankCurrency = bankCurrency;
            bankAccountList[BANK_ACCOUNT_ID].accountData = {
                ...bankAccountList[BANK_ACCOUNT_ID].accountData,
                state: CONST.BANK_ACCOUNT.STATE.SETUP,
                policyIDs,
            };
            await Onyx.set(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {
                accountNumber: '5678',
            });

            // When the admin adds a funding source for this USD report.
            await selectExpensePaymentOption(policy, translateLocal('iou.settleBusiness', ''), bankAccountList);

            // Then a fresh standalone setup avoids resuming an unsuitable account and preserves the workspace account.
            expect(navigateToBankAccountRoute).toHaveBeenCalledWith({backTo: ''});
            await getOnyxData({
                key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
                callback: (draft) => expect(draft?.accountNumber).toBeFalsy(),
            });
            await getOnyxData({key: `${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, callback: (workspace) => expect(workspace?.achAccount).toEqual(workspaceBankAccount)});
        });

        it.each([CONST.BANK_ACCOUNT.STATE.SETUP, CONST.BANK_ACCOUNT.STATE.PENDING])('resumes an accessible workspace account in %s with policy context', async (state) => {
            // Given the workspace account itself is shared with the admin and still needs setup.
            const bankAccountList = createBankAccountList();
            bankAccountList[BANK_ACCOUNT_ID].accountData = {...bankAccountList[BANK_ACCOUNT_ID].accountData, state};
            const policy = createTestPolicy({achAccount: {...workspaceBankAccount, bankAccountID: BANK_ACCOUNT_ID, state}});

            // When the admin chooses business-bank payment.
            await selectExpensePaymentOption(policy, translateLocal('iou.settleBusiness', ''), bankAccountList);

            // Then continue this account rather than creating or connecting a replacement.
            expect(navigateToBankAccountRoute).toHaveBeenCalledWith({policyID: POLICY_ID, backTo: ''});
            expect(Navigation.navigate).not.toHaveBeenCalled();
        });

        it('pays from another accessible business account without connecting it to the workspace', async () => {
            // Given the admin owns a usable account different from the workspace account.
            const policy = createTestPolicy({achAccount: workspaceBankAccount});
            const bankAccountList = createBankAccountList('5678');

            // When the admin selects that account directly in the pay menu.
            await selectExpensePaymentOption(policy, 'Test Bank Account', bankAccountList);

            // Then the selected account funds payment without entering workspace bank setup.
            expect(defaultProps.onPress).toHaveBeenCalledWith({
                paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
                payAsBusiness: true,
                methodID: BANK_ACCOUNT_ID,
                paymentMethod: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
            });
            expect(navigateToBankAccountRoute).not.toHaveBeenCalled();
            await getOnyxData({key: `${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, callback: (workspace) => expect(workspace?.achAccount).toEqual(workspaceBankAccount)});
        });

        it('keeps first-account setup linked to a workspace with no bank account', async () => {
            // Given the workspace has no bank account and the admin has no existing accounts.
            const policy = createTestPolicy();

            // When the admin chooses business-bank payment.
            await selectExpensePaymentOption(policy, translateLocal('iou.settleBusiness', ''));

            // Then the normal setup may establish the workspace's first account.
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({policyID: POLICY_ID, backTo: ''}));
            expect(navigateToBankAccountRoute).not.toHaveBeenCalled();
        });

        it('marks a report as paid without entering bank setup', async () => {
            // Given the admin cannot access the workspace bank account.
            const policy = createTestPolicy({achAccount: workspaceBankAccount});

            // When the admin chooses pay elsewhere.
            await selectExpensePaymentOption(policy, translateLocal('iou.payElsewhere', ''));

            // Then manual payment proceeds independently of bank-account setup.
            expect(defaultProps.onPress).toHaveBeenCalledWith({paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE, payAsBusiness: false});
            expect(navigateToBankAccountRoute).not.toHaveBeenCalled();
            expect(Navigation.navigate).not.toHaveBeenCalled();
        });
    });

    describe('invoice business add bank account workspace reuse', () => {
        const ACTIVE_POLICY_ID = 'active-admin-policy-id';
        const PERSONAL_POLICY_ID = 'personal-policy-id';

        function pressPopoverMenuItem(text: string) {
            const menuItem = screen.getByTestId(`PopoverMenuItem-${text}`);

            // MenuItem only forwards the press when it receives an event, so a GestureResponderEvent-shaped one is required.
            fireEvent.press(menuItem, {nativeEvent: {}, type: 'press', target: menuItem, currentTarget: menuItem});
        }

        function createPersonalPolicy(): Policy {
            return createTestPolicy({
                id: PERSONAL_POLICY_ID,
                name: 'Personal Policy',
                type: CONST.POLICY.TYPE.PERSONAL,
                outputCurrency: CONST.CURRENCY.USD,
            });
        }

        async function payAsBusinessAddBankAccount(params: Omit<OnyxSetupParams, 'report' | 'betas'>) {
            const invoiceReport = createInvoiceReport();

            await setupOnyxState({
                report: invoiceReport,
                betas: [CONST.BETAS.PAY_INVOICE_VIA_EXPENSIFY],
                ...params,
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

            fireEvent.press(screen.getByText(translateLocal('iou.settlePayment', '$100.00')));
            await waitForBatchedUpdatesWithAct();

            pressPopoverMenuItem(translateLocal('bankAccount.addBankAccount'));
            await waitForBatchedUpdatesWithAct();
        }

        const individualReceiverChat = () =>
            createChatReport({
                invoiceReceiver: {
                    type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
                    accountID: ACCOUNT_ID,
                },
            });

        it('should reuse the active admin workspace when its currency is not supported for direct reimbursement', async () => {
            await payAsBusinessAddBankAccount({
                chatReport: individualReceiverChat(),
                policy: createTestPolicy({id: ACTIVE_POLICY_ID, outputCurrency: CONST.CURRENCY.EUR}),
                extraPolicies: [createPersonalPolicy()],
                activePolicyID: ACTIVE_POLICY_ID,
                personalPolicyID: PERSONAL_POLICY_ID,
            });

            expect(createWorkspace).not.toHaveBeenCalled();
            expect(navigateToBankAccountRoute).toHaveBeenCalledWith({policyID: ACTIVE_POLICY_ID});
        });

        it('should reuse the active admin workspace when its currency is supported for direct reimbursement', async () => {
            await payAsBusinessAddBankAccount({
                chatReport: individualReceiverChat(),
                policy: createTestPolicy({id: ACTIVE_POLICY_ID, outputCurrency: CONST.CURRENCY.USD}),
                extraPolicies: [createPersonalPolicy()],
                activePolicyID: ACTIVE_POLICY_ID,
                personalPolicyID: PERSONAL_POLICY_ID,
            });

            expect(createWorkspace).not.toHaveBeenCalled();
            expect(navigateToBankAccountRoute).toHaveBeenCalledWith({policyID: ACTIVE_POLICY_ID});
        });

        it('should create a workspace when the active policy is not one the user administers', async () => {
            await payAsBusinessAddBankAccount({
                chatReport: individualReceiverChat(),
                policy: createTestPolicy({id: ACTIVE_POLICY_ID, outputCurrency: CONST.CURRENCY.EUR, role: CONST.POLICY.ROLE.USER}),
                extraPolicies: [createPersonalPolicy()],
                activePolicyID: ACTIVE_POLICY_ID,
                personalPolicyID: PERSONAL_POLICY_ID,
            });

            expect(createWorkspace).toHaveBeenCalled();
            expect(navigateToBankAccountRoute).toHaveBeenCalledWith({policyID: 'mock-created-policy-id'});
        });

        it('should use the receiver workspace for a business invoice receiver', async () => {
            await payAsBusinessAddBankAccount({
                chatReport: createChatReport({
                    invoiceReceiver: {
                        type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS,
                        policyID: POLICY_ID,
                    },
                }),
                policy: createTestPolicy(),
                extraPolicies: [createTestPolicy({id: ACTIVE_POLICY_ID, outputCurrency: CONST.CURRENCY.EUR})],
                activePolicyID: ACTIVE_POLICY_ID,
            });

            expect(createWorkspace).not.toHaveBeenCalled();
            expect(navigateToBankAccountRoute).toHaveBeenCalledWith({policyID: POLICY_ID});
        });
    });
});
