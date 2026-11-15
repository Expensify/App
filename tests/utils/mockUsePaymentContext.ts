import type {PaymentContextValue} from '@hooks/usePaymentContext';

type MockPaymentContextOverrides = Partial<PaymentContextValue>;

const defaultMockPaymentContextValue: PaymentContextValue = {
    currentUserAccountID: 1,
    currentUserLogin: 'test@example.com',
    email: 'test@example.com',
    localCurrencyCode: 'USD',
    isASAPSubmitBetaEnabled: false,
    isWiseReimbursementsBetaEnabled: false,
    activePolicyID: undefined,
    activePolicy: undefined,
    defaultWorkspaceName: 'Test Workspace',
    delegateEmail: undefined,
    delegateAccountID: undefined,
    readSearchActionInputs: () => Promise.resolve({conciergeChat: undefined, introSelected: undefined, isSelfTourViewed: false, amountOwed: undefined, bankAccountList: undefined}),
};

function createMockUsePaymentContextModule(overrides: MockPaymentContextOverrides = {}) {
    const mockPaymentContextValue = {
        ...defaultMockPaymentContextValue,
        ...overrides,
    };

    return {
        __esModule: true,
        default: () => mockPaymentContextValue,
        useReportPaymentContext: () => ({
            ...mockPaymentContextValue,
            nextStep: undefined,
            chatReportPolicy: undefined,
        }),
    };
}

/** @public Read only through `jest.requireActual` in tests, which knip cannot see. Remove this tag together with the last such call. */
export default createMockUsePaymentContextModule();
