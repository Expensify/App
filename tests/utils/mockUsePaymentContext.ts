type MockPaymentContextOverrides = Partial<typeof defaultMockPaymentContextValue>;

const defaultMockPaymentContextValue = {
    currentUserAccountID: 1,
    currentUserLogin: 'test@example.com',
    email: 'test@example.com',
    localCurrencyCode: 'USD',
    introSelected: undefined,
    betas: undefined,
    isSelfTourViewed: false,
    activePolicyID: undefined,
    activePolicy: undefined,
    conciergeReportID: undefined,
    defaultWorkspaceName: 'Test Workspace',
    userBillingGracePeriodEnds: undefined,
    amountOwed: undefined,
    ownerBillingGracePeriodEnd: undefined,
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
            existingB2BInvoiceReport: undefined,
        }),
    };
}

export default createMockUsePaymentContextModule();
export {createMockUsePaymentContextModule, defaultMockPaymentContextValue};
