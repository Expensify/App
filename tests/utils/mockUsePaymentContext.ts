type MockPaymentContextOverrides = Partial<typeof defaultMockPaymentContextValue>;

const defaultMockPaymentContextValue = {
    currentUserAccountID: 1,
    currentUserLogin: 'test@example.com',
    email: 'test@example.com',
    localCurrencyCode: 'USD',
    isASAPSubmitBetaEnabled: false,
    activePolicyID: undefined,
    activePolicy: undefined,
    defaultWorkspaceName: 'Test Workspace',
    delegateEmail: undefined,
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

export default createMockUsePaymentContextModule();
export {createMockUsePaymentContextModule, defaultMockPaymentContextValue};
