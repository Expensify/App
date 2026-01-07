import {renderHook} from '@testing-library/react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import {getSecondaryText, handleUnvalidatedUserNavigation, useSettlementButtonPaymentMethods} from '@libs/SettlementButtonUtils';
import type {GetSecondaryTextParams} from '@libs/SettlementButtonUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {BankAccount, Policy} from '@src/types/onyx';

jest.mock('@libs/Navigation/Navigation');

const mockTranslate = jest.fn((key: string) => key);

jest.mock('@hooks/useLocalize', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({
        translate: mockTranslate,
    }),
}));

describe('handleUnvalidatedUserNavigation', () => {
    const mockReportID = '123456789';
    const mockChatReportID = '987654321';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // handleUnvalidatedUserNavigation navigates to the correct route
    it.each([
        {
            description: 'navigate to ROUTES.SEARCH_ROOT_VERIFY_ACCOUNT when active route is ROUTES.SEARCH_ROOT',
            mockActiveRoute: ROUTES.SEARCH_ROOT.getRoute({query: ''}),
            expectedRouteToNavigate: ROUTES.SEARCH_ROOT_VERIFY_ACCOUNT,
        },
        {
            description: 'navigate to ROUTES.SEARCH_REPORT_VERIFY_ACCOUNT.getRoute(reportID) when active route is ROUTES.SEARCH_REPORT.getRoute(reportID)',
            mockActiveRoute: ROUTES.SEARCH_REPORT.getRoute({reportID: mockReportID}),
            expectedRouteToNavigate: ROUTES.SEARCH_REPORT_VERIFY_ACCOUNT.getRoute(mockReportID),
        },
        {
            description: 'navigate to ROUTES.SEARCH_REPORT_VERIFY_ACCOUNT.getRoute(chatReportID) when active route is ROUTES.SEARCH_REPORT.getRoute({reportID: chatReportID})',
            mockActiveRoute: ROUTES.SEARCH_REPORT.getRoute({reportID: mockChatReportID}),
            expectedRouteToNavigate: ROUTES.SEARCH_REPORT_VERIFY_ACCOUNT.getRoute(mockChatReportID),
        },
        {
            description: 'navigate to ROUTES.SEARCH_MONEY_REQUEST_REPORT_VERIFY_ACCOUNT when active route is ROUTES.SEARCH_MONEY_REQUEST_REPORT',
            mockActiveRoute: ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: mockReportID}),
            expectedRouteToNavigate: ROUTES.SEARCH_MONEY_REQUEST_REPORT_VERIFY_ACCOUNT.getRoute(mockReportID),
        },
        {
            description: 'navigate to ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(chatReportID) when active route is ROUTES.REPORT_WITH_ID.getRoute(chatReportID)',
            mockActiveRoute: ROUTES.REPORT_WITH_ID.getRoute(mockChatReportID),
            expectedRouteToNavigate: ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(mockChatReportID),
        },
        {
            description: 'navigate to ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(reportID) when active route is ROUTES.REPORT_WITH_ID.getRoute(reportID)',
            mockActiveRoute: ROUTES.REPORT_WITH_ID.getRoute(mockReportID),
            expectedRouteToNavigate: ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(mockReportID),
        },
        {
            description: 'navigate to ROUTES.MONEY_REQUEST_STEP_CONFIRMATION_VERIFY_ACCOUNT when active route is ROUTES.MONEY_REQUEST_STEP_CONFIRMATION',
            mockActiveRoute: ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.PAY, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, mockChatReportID),
            expectedRouteToNavigate: ROUTES.MONEY_REQUEST_STEP_CONFIRMATION_VERIFY_ACCOUNT.getRoute(
                CONST.IOU.ACTION.CREATE,
                CONST.IOU.TYPE.PAY,
                CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                mockChatReportID,
            ),
        },
    ])('$description', ({mockActiveRoute, expectedRouteToNavigate}) => {
        (Navigation.getActiveRoute as jest.Mock).mockReturnValue(mockActiveRoute);
        handleUnvalidatedUserNavigation(mockChatReportID, mockReportID);
        expect(Navigation.navigate).toHaveBeenCalledWith(expectedRouteToNavigate);
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
    });

    // handleUnvalidatedUserNavigation does not navigate to the route that require reportID, when reportID is undefined
    it.each([
        {
            description: 'do not navigate to ROUTES.SEARCH_MONEY_REQUEST_REPORT_VERIFY_ACCOUNT when reportID is undefined',
            mockActiveRoute: ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: mockReportID}),
        },
        {
            description: 'do not navigate to ROUTES.SEARCH_REPORT_VERIFY_ACCOUNT when reportID is undefined',
            mockActiveRoute: ROUTES.SEARCH_REPORT.getRoute({reportID: mockReportID}),
        },
        {
            description: 'do not navigate when active route is ROUTES.REPORT_WITH_ID.getRoute(reportID) and reportID is undefined',
            mockActiveRoute: ROUTES.REPORT_WITH_ID.getRoute(mockReportID),
        },
    ])('$description', ({mockActiveRoute}) => {
        (Navigation.getActiveRoute as jest.Mock).mockReturnValue(mockActiveRoute);
        handleUnvalidatedUserNavigation(mockChatReportID);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    // handleUnvalidatedUserNavigation matches the first applicable route when multiple conditions could match
    it('match ROUTES.SEARCH_MONEY_REQUEST_REPORT over ROUTES.REPORT_WITH_ID', () => {
        const mockActiveRoute = ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: mockReportID});
        (Navigation.getActiveRoute as jest.Mock).mockReturnValue(mockActiveRoute);
        handleUnvalidatedUserNavigation(mockChatReportID, mockReportID);
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_MONEY_REQUEST_REPORT_VERIFY_ACCOUNT.getRoute(mockReportID));
        expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(mockReportID));
    });

    // handleUnvalidatedUserNavigation does not navigate when no route mapping matches
    it('when no route mapping matches, user should not be navigated', () => {
        (Navigation.getActiveRoute as jest.Mock).mockReturnValue('/just/unmatched/route');
        handleUnvalidatedUserNavigation(mockChatReportID, mockReportID);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });
});

describe('useSettlementButtonPaymentMethods', () => {
    const {translate} = useLocalize();
    const {result: icons} = renderHook(() => useMemoizedLazyExpensifyIcons(['User', 'Building', 'CheckCircle'] as const));

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return payment method with wallet for PERSONAL_BANK_ACCOUNT when hasActivatedWallet is true', () => {
        const {result} = renderHook(() => useSettlementButtonPaymentMethods(true, translate));
        expect(result.current[CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT]).toEqual({
            text: translate('iou.settleWallet', {formattedAmount: ''}),
            icon: icons.current.User,
            value: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
            key: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
        });
    });

    it('should return payment method with personal bank account for PERSONAL_BANK_ACCOUNT when hasActivatedWallet is false', () => {
        const {result} = renderHook(() => useSettlementButtonPaymentMethods(false, translate));
        expect(result.current[CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT]).toEqual({
            text: translate('iou.settlePersonal', {formattedAmount: ''}),
            icon: icons.current.User,
            value: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
            key: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
        });
    });

    it('should return payment method with business bank account for BUSINESS_BANK_ACCOUNT', () => {
        const {result} = renderHook(() => useSettlementButtonPaymentMethods(true, translate));
        expect(result.current[CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]).toEqual({
            text: translate('iou.settleBusiness', {formattedAmount: ''}),
            icon: icons.current.Building,
            value: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
            key: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
        });
    });

    it('should return payment method elsewhere for ELSEWHERE', () => {
        const {result} = renderHook(() => useSettlementButtonPaymentMethods(true, translate));
        expect(result.current[CONST.IOU.PAYMENT_TYPE.ELSEWHERE]).toEqual({
            text: translate('iou.payElsewhere', {formattedAmount: ''}),
            icon: icons.current.CheckCircle,
            value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            shouldUpdateSelectedIndex: false,
            key: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
        });
    });

    it('should return all three payment methods', () => {
        const {result} = renderHook(() => useSettlementButtonPaymentMethods(true, translate));
        expect(Object.keys(result.current)).toHaveLength(3);
        expect(result.current).toHaveProperty(CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT);
        expect(result.current).toHaveProperty(CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT);
        expect(result.current).toHaveProperty(CONST.IOU.PAYMENT_TYPE.ELSEWHERE);
    });

    it.each([
        {hasActivatedWallet: true, expectedPersonalKey: 'iou.settleWallet'},
        {hasActivatedWallet: false, expectedPersonalKey: 'iou.settlePersonal'},
    ])('should use correct texts for each payment method when hasActivatedWallet is $hasActivatedWallet', ({hasActivatedWallet, expectedPersonalKey}) => {
        const {result} = renderHook(() => useSettlementButtonPaymentMethods(hasActivatedWallet, translate));
        expect(translate).toHaveBeenCalledTimes(3);
        expect(translate).toHaveBeenCalledWith(expectedPersonalKey, {formattedAmount: ''});
        expect(translate).toHaveBeenCalledWith('iou.settleBusiness', {formattedAmount: ''});
        expect(translate).toHaveBeenCalledWith('iou.payElsewhere', {formattedAmount: ''});
        expect(result.current[CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT].text).toBe(expectedPersonalKey);
        expect(result.current[CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT].text).toBe('iou.settleBusiness');
        expect(result.current[CONST.IOU.PAYMENT_TYPE.ELSEWHERE].text).toBe('iou.payElsewhere');
    });

    it.each([
        {
            method: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
            expectedIcon: icons.current.User,
            expectedValue: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
            description: 'PERSONAL_BANK_ACCOUNT',
        },
        {
            method: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
            expectedIcon: icons.current.Building,
            expectedValue: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
            description: 'BUSINESS_BANK_ACCOUNT',
        },
        {
            method: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            expectedIcon: icons.current.CheckCircle,
            expectedValue: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            description: 'ELSEWHERE',
        },
    ])('should use correct icon and value for $description regardless of hasActivatedWallet', ({method, expectedIcon, expectedValue}) => {
        const {result: resultWithWallet} = renderHook(() => useSettlementButtonPaymentMethods(true, translate));
        const {result: resultWithoutWallet} = renderHook(() => useSettlementButtonPaymentMethods(false, translate));
        for (const result of [resultWithWallet.current, resultWithoutWallet.current]) {
            const paymentMethod = result[method];
            expect(paymentMethod.icon).toStrictEqual(expectedIcon);
            expect(paymentMethod.value).toStrictEqual(expectedValue);
        }
    });

    it('should only set shouldUpdateSelectedIndex for elsewhere payment type', () => {
        const {result} = renderHook(() => useSettlementButtonPaymentMethods(true, translate));
        expect(result.current[CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT]).not.toHaveProperty('shouldUpdateSelectedIndex');
        expect(result.current[CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]).not.toHaveProperty('shouldUpdateSelectedIndex');
        expect(result.current[CONST.IOU.PAYMENT_TYPE.ELSEWHERE].shouldUpdateSelectedIndex).toBe(false);
    });
});

describe('getSecondaryText', () => {
    const mockTranslateFunc = jest.fn((key: string, params?: Record<string, string>) => {
        if (params) {
            return `${key}:${JSON.stringify(params)}`;
        }
        return key;
    });

    const createDefaultParams = (overrides: Partial<GetSecondaryTextParams> = {}): GetSecondaryTextParams => ({
        shouldUseShortForm: false,
        lastPaymentMethod: undefined,
        paymentButtonOptions: [{value: CONST.IOU.PAYMENT_TYPE.EXPENSIFY, text: 'Pay'}],
        shouldHidePaymentOptions: false,
        shouldShowApproveButton: false,
        onlyShowPayElsewhere: false,
        lastPaymentPolicy: null,
        hasIntentToPay: false,
        isExpenseReport: false,
        isInvoiceReport: false,
        policy: null,
        bankAccountToDisplay: undefined,
        personalBankAccountList: [],
        bankAccount: undefined,
        translate: mockTranslateFunc,
        ...overrides,
    });

    beforeEach(() => {
        mockTranslateFunc.mockClear();
    });

    describe('Early returns', () => {
        it('should return undefined when shouldUseShortForm is true', () => {
            const result = getSecondaryText(createDefaultParams({shouldUseShortForm: true}));
            expect(result).toBeUndefined();
        });

        it('should return undefined when lastPaymentMethod is ELSEWHERE', () => {
            const result = getSecondaryText(createDefaultParams({lastPaymentMethod: CONST.IOU.PAYMENT_TYPE.ELSEWHERE}));
            expect(result).toBeUndefined();
        });

        it('should return undefined when only ELSEWHERE option is available', () => {
            const result = getSecondaryText(
                createDefaultParams({
                    paymentButtonOptions: [{value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE, text: 'Pay elsewhere'}],
                }),
            );
            expect(result).toBeUndefined();
        });

        it('should return undefined when shouldHidePaymentOptions and shouldShowApproveButton', () => {
            const result = getSecondaryText(
                createDefaultParams({
                    shouldHidePaymentOptions: true,
                    shouldShowApproveButton: true,
                }),
            );
            expect(result).toBeUndefined();
        });
    });

    describe('Policy-based returns', () => {
        it('should return policy name when lastPaymentPolicy exists', () => {
            const mockPolicy = {name: 'Test Policy'} as Policy;
            const result = getSecondaryText(createDefaultParams({lastPaymentPolicy: mockPolicy}));
            expect(result).toBe('Test Policy');
        });
    });

    describe('Expense reports - the critical fix for issue #78310', () => {
        it('should show bank account for expense report with hasIntentToPay and policy.achAccount', () => {
            const mockPolicy = {
                achAccount: {accountNumber: '1234567890'},
            } as Policy;

            const result = getSecondaryText(
                createDefaultParams({
                    isExpenseReport: true,
                    hasIntentToPay: true,
                    policy: mockPolicy,
                }),
            );

            expect(result).toContain('paymentMethodList.bankAccountLastFour');
            expect(result).toContain('7890');
        });

        it('should return undefined for expense report with hasIntentToPay but NO policy.achAccount - NEVER show Wallet', () => {
            const result = getSecondaryText(
                createDefaultParams({
                    isExpenseReport: true,
                    hasIntentToPay: true,
                    policy: null,
                }),
            );

            // This is the critical test - expense reports should NEVER show Wallet
            expect(result).toBeUndefined();
            expect(result).not.toBe('common.wallet');
        });

        it('should show bank account for expense report with VBBA payment method and policy.achAccount', () => {
            const mockPolicy = {
                achAccount: {accountNumber: '9876543210'},
            } as Policy;

            const result = getSecondaryText(
                createDefaultParams({
                    isExpenseReport: true,
                    lastPaymentMethod: CONST.IOU.PAYMENT_TYPE.VBBA,
                    policy: mockPolicy,
                }),
            );

            expect(result).toContain('paymentMethodList.bankAccountLastFour');
            expect(result).toContain('3210');
        });

        it('should return undefined for expense report when bank account has no account number', () => {
            const mockPolicy = {
                achAccount: {bankAccountID: 123},
            } as Policy;

            const result = getSecondaryText(
                createDefaultParams({
                    isExpenseReport: true,
                    hasIntentToPay: true,
                    policy: mockPolicy,
                    bankAccountToDisplay: undefined,
                }),
            );

            expect(result).toBeUndefined();
        });

        it('should use bankAccountToDisplay when policy.achAccount has no accountNumber', () => {
            const mockPolicy = {
                achAccount: {bankAccountID: 123},
            } as Policy;
            const mockBankAccount = {
                accountData: {accountNumber: '5555666677'},
            } as BankAccount;

            const result = getSecondaryText(
                createDefaultParams({
                    isExpenseReport: true,
                    hasIntentToPay: true,
                    policy: mockPolicy,
                    bankAccountToDisplay: mockBankAccount,
                }),
            );

            expect(result).toContain('paymentMethodList.bankAccountLastFour');
            expect(result).toContain('6677');
        });
    });

    describe('Invoice reports', () => {
        it('should show business bank account text for invoice with business bank account', () => {
            const mockBankAccount = {
                accountData: {
                    type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
                    accountNumber: '1111222233',
                },
            } as BankAccount;

            const result = getSecondaryText(
                createDefaultParams({
                    isInvoiceReport: true,
                    hasIntentToPay: true,
                    bankAccountToDisplay: mockBankAccount,
                }),
            );

            expect(result).toContain('iou.invoiceBusinessBank');
        });

        it('should show personal bank account text for invoice with personal bank account', () => {
            const mockBankAccount = {
                accountData: {
                    type: CONST.BANK_ACCOUNT.TYPE.PERSONAL,
                    accountNumber: '4444555566',
                },
            } as BankAccount;

            const result = getSecondaryText(
                createDefaultParams({
                    isInvoiceReport: true,
                    hasIntentToPay: true,
                    bankAccountToDisplay: mockBankAccount,
                }),
            );

            expect(result).toContain('iou.invoicePersonalBank');
        });
    });

    describe('IOUs with Wallet', () => {
        it('should show Wallet for IOU with EXPENSIFY payment method and personal bank accounts', () => {
            const result = getSecondaryText(
                createDefaultParams({
                    isExpenseReport: false,
                    isInvoiceReport: false,
                    lastPaymentMethod: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                    personalBankAccountList: [{} as never],
                }),
            );

            expect(result).toBe('common.wallet');
        });

        it('should return undefined for IOU with EXPENSIFY payment method but no personal bank accounts', () => {
            const result = getSecondaryText(
                createDefaultParams({
                    isExpenseReport: false,
                    isInvoiceReport: false,
                    lastPaymentMethod: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                    personalBankAccountList: [],
                }),
            );

            expect(result).toBeUndefined();
        });
    });

    describe('Business bank account fallback', () => {
        it('should show bank account for business bank account on expense report', () => {
            const mockBankAccount = {
                accountData: {
                    type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
                    accountNumber: '7777888899',
                },
            } as BankAccount;

            const result = getSecondaryText(
                createDefaultParams({
                    isExpenseReport: true,
                    bankAccount: mockBankAccount,
                }),
            );

            expect(result).toContain('paymentMethodList.bankAccountLastFour');
            expect(result).toContain('8899');
        });
    });

    describe('Customer scenario from issue #78310', () => {
        it('expense report with hasIntentToPay and configured achAccount should show bank account, NOT Wallet', () => {
            const mockPolicy = {
                achAccount: {
                    bankAccountID: 2474101,
                    accountNumber: '****1234',
                },
            } as Policy;

            const result = getSecondaryText(
                createDefaultParams({
                    isExpenseReport: true,
                    hasIntentToPay: true,
                    policy: mockPolicy,
                }),
            );

            // Should show bank account info
            expect(result).toContain('paymentMethodList.bankAccountLastFour');
            // Should NOT show Wallet
            expect(result).not.toBe('common.wallet');
        });

        it('expense report with hasIntentToPay but NO achAccount should return undefined, NOT Wallet', () => {
            const result = getSecondaryText(
                createDefaultParams({
                    isExpenseReport: true,
                    hasIntentToPay: true,
                    policy: {achAccount: undefined} as Policy,
                }),
            );

            // Should return undefined (no valid payment method)
            expect(result).toBeUndefined();
            // Should absolutely NOT show Wallet for expense reports
            expect(result).not.toBe('common.wallet');
        });
    });
});
