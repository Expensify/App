import type {OnyxEntry} from 'react-native-onyx';
import type {BankAccountMenuItem} from '@components/Search/types';
import {setPersonalBankAccountContinueKYCOnSuccess} from '@libs/actions/BankAccounts';
import {approveMoneyRequest} from '@libs/actions/IOU/ReportWorkflow';
import Navigation from '@libs/Navigation/Navigation';
import {getActivePaymentType, getBusinessBankAccountOptions, handleUnvalidatedAccount, selectPaymentType} from '@libs/PaymentUtils';
import type {SelectPaymentTypeParams} from '@libs/PaymentUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import {calculateWalletTransferBalanceFee} from '@src/libs/PaymentUtils';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type PaymentMethod from '@src/types/onyx/PaymentMethod';
import createMockPaymentMethod from '../utils/collections/paymentMethods';
import createRandomPolicy from '../utils/collections/policies';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(),
}));

jest.mock('@libs/SubscriptionUtils', () => ({
    shouldRestrictUserBillableActions: jest.fn(),
}));

jest.mock('@libs/actions/BankAccounts', () => ({
    setPersonalBankAccountContinueKYCOnSuccess: jest.fn(),
}));

jest.mock('@libs/actions/IOU/ReportWorkflow', () => ({
    approveMoneyRequest: jest.fn(),
}));

describe('PaymentUtils', () => {
    it('Test rounding wallet transfer instant fee', () => {
        expect(calculateWalletTransferBalanceFee(2100, CONST.WALLET.TRANSFER_METHOD_TYPE.INSTANT)).toBe(32);
    });
    describe('handleUnvalidatedAccount', () => {
        const mockNavigate = Navigation.navigate as jest.MockedFunction<typeof Navigation.navigate>;
        const mockGetActiveRoute = Navigation.getActiveRoute as jest.MockedFunction<typeof Navigation.getActiveRoute>;

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it.each([
            {
                description: 'search money request report route',
                reportID: '123',
                activeRoute: 'search/r/123',
                expectedRoute: 'search/r/123/verify-account',
            },
            {
                description: 'search report route',
                reportID: '456',
                activeRoute: 'search/view/456',
                expectedRoute: 'search/view/456/verify-account',
            },
            {
                description: 'regular report route',
                reportID: '789',
                activeRoute: 'r/789',
                expectedRoute: 'r/789/verify-account',
            },
            {
                description: 'non-search route defaults to regular report verification',
                reportID: undefined,
                activeRoute: 'r',
                expectedRoute: 'settings/profile/contact-methods/verify?backTo=r',
            },
        ])('should navigate to $expectedRoute when on $description', ({reportID, activeRoute, expectedRoute}) => {
            mockGetActiveRoute.mockReturnValue(activeRoute);

            const iouReport: OnyxEntry<Report> = {reportID} as Report;

            handleUnvalidatedAccount(iouReport);

            expect(mockNavigate).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith(expectedRoute);
        });
    });

    describe('getActivePaymentType', () => {
        const randomPolicyA = createRandomPolicy(1);
        const randomPolicyB = createRandomPolicy(2);
        const bankItem = {
            text: 'Bank Account',
            description: 'Test bank',
            methodID: 1,
            value: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
        } as BankAccountMenuItem;

        it('should return EXPENSIFY payment type when paymentMethod is PERSONAL_BANK_ACCOUNT', () => {
            const result = getActivePaymentType(CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT, [], undefined);

            expect(result.paymentType).toBe(CONST.IOU.PAYMENT_TYPE.EXPENSIFY);
            expect(result.shouldSelectPaymentMethod).toBe(true);
            expect(result.policyFromContext).toBeUndefined();
            expect(result.policyFromPaymentMethod).toBeUndefined();
        });

        it('should return VBBA payment type when paymentMethod is BUSINESS_BANK_ACCOUNT', () => {
            const result = getActivePaymentType(CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT, [], undefined);

            expect(result.paymentType).toBe(CONST.IOU.PAYMENT_TYPE.VBBA);
            expect(result.shouldSelectPaymentMethod).toBe(true);
            expect(result.policyFromContext).toBeUndefined();
            expect(result.policyFromPaymentMethod).toBeUndefined();
        });

        it('should return ELSEWHERE payment type when paymentMethod is DEBIT_CARD', () => {
            const result = getActivePaymentType(CONST.PAYMENT_METHODS.DEBIT_CARD, [], undefined);

            expect(result.paymentType).toBe(CONST.IOU.PAYMENT_TYPE.ELSEWHERE);
            expect(result.shouldSelectPaymentMethod).toBe(true);
            expect(result.policyFromContext).toBeUndefined();
            expect(result.policyFromPaymentMethod).toBeUndefined();
        });

        it('should return ELSEWHERE payment type when paymentMethod is undefined', () => {
            const result = getActivePaymentType(undefined, [], undefined);

            expect(result.paymentType).toBe(CONST.IOU.PAYMENT_TYPE.ELSEWHERE);
            expect(result.shouldSelectPaymentMethod).toBe(false);
            expect(result.policyFromContext).toBeUndefined();
            expect(result.policyFromPaymentMethod).toBeUndefined();
        });

        it('should set shouldSelectPaymentMethod to true when businessBankAccountOptions is not empty', () => {
            const result = getActivePaymentType(undefined, [], [bankItem]);

            expect(result.paymentType).toBe(CONST.IOU.PAYMENT_TYPE.ELSEWHERE);
            expect(result.shouldSelectPaymentMethod).toBe(true);
        });

        it('should set shouldSelectPaymentMethod to false when paymentMethod is explicitly ELSEWHERE (Mark as Paid)', () => {
            const result = getActivePaymentType(CONST.IOU.PAYMENT_TYPE.ELSEWHERE, [], [bankItem]);

            expect(result.paymentType).toBe(CONST.IOU.PAYMENT_TYPE.ELSEWHERE);
            expect(result.shouldSelectPaymentMethod).toBe(false);
        });

        it('should find policyFromContext by policyID', () => {
            const result = getActivePaymentType(undefined, [randomPolicyA, randomPolicyB], undefined, randomPolicyA.id);

            expect(result.policyFromContext).toEqual(randomPolicyA);
            expect(result.policyFromPaymentMethod).toBeUndefined();
        });

        it('should find policyFromPaymentMethod when paymentMethod matches policy id (Pay via workspace scenario)', () => {
            const result = getActivePaymentType(randomPolicyB.id, [randomPolicyA, randomPolicyB], undefined);

            expect(result.policyFromPaymentMethod).toEqual(randomPolicyB);
            expect(result.policyFromContext).toBeUndefined();
            expect(result.paymentType).toBe(CONST.IOU.PAYMENT_TYPE.ELSEWHERE);
            expect(result.shouldSelectPaymentMethod).toBe(false);
        });

        it('should return both policyFromContext and policyFromPaymentMethod when both match', () => {
            const result = getActivePaymentType(randomPolicyB.id, [randomPolicyA, randomPolicyB], undefined, randomPolicyA.id);

            expect(result.policyFromContext).toEqual(randomPolicyA);
            expect(result.policyFromPaymentMethod).toEqual(randomPolicyB);
        });

        it('should return undefined policies when no matching policy is found', () => {
            const result = getActivePaymentType(undefined, [randomPolicyA], undefined, 'non-existent-policy');

            expect(result.policyFromContext).toBeUndefined();
            expect(result.policyFromPaymentMethod).toBeUndefined();
        });
    });

    describe('selectPaymentType', () => {
        const mockNavigate = Navigation.navigate as jest.MockedFunction<typeof Navigation.navigate>;
        const mockShouldRestrict = shouldRestrictUserBillableActions as jest.MockedFunction<typeof shouldRestrictUserBillableActions>;
        const mockOnPress = jest.fn();
        const mockTriggerKYCFlow = jest.fn();
        const mockConfirmApproval = jest.fn();
        const testPolicy = createRandomPolicy(1);
        const testPolicyID = testPolicy.id;

        const baseParams: SelectPaymentTypeParams = {
            event: undefined,
            iouPaymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            triggerKYCFlow: mockTriggerKYCFlow,
            expenseReportPolicy: testPolicy,
            policy: testPolicy,
            onPress: mockOnPress,
            currentAccountID: 1,
            currentEmail: 'test@test.com',
            hasViolations: false,
            isASAPSubmitBetaEnabled: false,
            isUserValidated: true,
            iouReport: {reportID: '1'} as Report,
            iouReportNextStep: undefined,
            betas: [],
            userBillingGracePeriodEnds: undefined,
            amountOwed: 0,
            ownerBillingGracePeriodEnd: undefined,
            delegateEmail: undefined,
        };

        beforeEach(() => {
            jest.clearAllMocks();
            mockShouldRestrict.mockReturnValue(false);
        });

        it('should navigate to restricted action page when billable actions are restricted and amountOwed > 0', () => {
            mockShouldRestrict.mockReturnValue(true);
            const params = {...baseParams, amountOwed: 100, ownerBillingGracePeriodEnd: 999};

            selectPaymentType(params);

            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.RESTRICTED_ACTION.getRoute(testPolicyID));
            expect(mockOnPress).not.toHaveBeenCalled();
        });

        it('should not navigate to restricted action page when amountOwed is 0', () => {
            mockShouldRestrict.mockReturnValue(false);
            const params = {...baseParams, amountOwed: 0, ownerBillingGracePeriodEnd: undefined};

            selectPaymentType(params);

            expect(mockOnPress).toHaveBeenCalledWith({paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE});
        });

        it('should pass amountOwed, ownerBillingGracePeriodEnd and policy to shouldRestrictUserBillableActions', () => {
            const params = {...baseParams, amountOwed: 42, ownerBillingGracePeriodEnd: 999};

            selectPaymentType(params);

            expect(mockShouldRestrict).toHaveBeenCalledWith(testPolicy, 999, params.userBillingGracePeriodEnds, 42);
        });

        it('should trigger KYC flow for EXPENSIFY payment type when user is validated', () => {
            const params = {...baseParams, iouPaymentType: CONST.IOU.PAYMENT_TYPE.EXPENSIFY as PaymentMethodType};

            selectPaymentType(params);

            expect(mockTriggerKYCFlow).toHaveBeenCalledWith({event: undefined, iouPaymentType: CONST.IOU.PAYMENT_TYPE.EXPENSIFY, policy: testPolicy});
            expect(setPersonalBankAccountContinueKYCOnSuccess).toHaveBeenCalledWith(ROUTES.ENABLE_PAYMENTS);
        });

        it('should navigate to unvalidated account page for EXPENSIFY payment type when user is not validated', () => {
            const mockGetActiveRoute = Navigation.getActiveRoute as jest.MockedFunction<typeof Navigation.getActiveRoute>;
            mockGetActiveRoute.mockReturnValue('r/1');
            const params = {...baseParams, iouPaymentType: CONST.IOU.PAYMENT_TYPE.EXPENSIFY as PaymentMethodType, isUserValidated: false};

            selectPaymentType(params);

            expect(mockTriggerKYCFlow).not.toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalled();
        });

        it('should call confirmApproval when payment type is APPROVE and confirmApproval is provided', () => {
            const params = {...baseParams, iouPaymentType: CONST.IOU.REPORT_ACTION_TYPE.APPROVE as PaymentMethodType, confirmApproval: mockConfirmApproval};

            selectPaymentType(params);

            expect(mockConfirmApproval).toHaveBeenCalled();
            expect(approveMoneyRequest).not.toHaveBeenCalled();
        });

        it('should call approveMoneyRequest with amountOwed and ownerBillingGracePeriodEnd when payment type is APPROVE and no confirmApproval', () => {
            const params = {...baseParams, iouPaymentType: CONST.IOU.REPORT_ACTION_TYPE.APPROVE as PaymentMethodType, amountOwed: 42, ownerBillingGracePeriodEnd: 999};

            selectPaymentType(params);

            expect(approveMoneyRequest).toHaveBeenCalledWith({
                expenseReport: params.iouReport,
                expenseReportPolicy: params.expenseReportPolicy,
                policy: params.policy,
                currentUserAccountIDParam: params.currentAccountID,
                currentUserEmailParam: params.currentEmail,
                hasViolations: params.hasViolations,
                isASAPSubmitBetaEnabled: params.isASAPSubmitBetaEnabled,
                expenseReportCurrentNextStepDeprecated: params.iouReportNextStep,
                betas: params.betas,
                userBillingGracePeriodEnds: params.userBillingGracePeriodEnds,
                amountOwed: 42,
                ownerBillingGracePeriodEnd: 999,
                full: true,
                delegateEmail: undefined,
            });
        });

        it('should pass amountOwed and ownerBillingGracePeriodEnd as undefined to approveMoneyRequest when they are undefined', () => {
            const params = {...baseParams, iouPaymentType: CONST.IOU.REPORT_ACTION_TYPE.APPROVE as PaymentMethodType, amountOwed: undefined, ownerBillingGracePeriodEnd: undefined};

            selectPaymentType(params);

            expect(approveMoneyRequest).toHaveBeenCalledWith({
                expenseReport: params.iouReport,
                expenseReportPolicy: params.expenseReportPolicy,
                policy: params.policy,
                currentUserAccountIDParam: params.currentAccountID,
                currentUserEmailParam: params.currentEmail,
                hasViolations: params.hasViolations,
                isASAPSubmitBetaEnabled: params.isASAPSubmitBetaEnabled,
                expenseReportCurrentNextStepDeprecated: params.iouReportNextStep,
                betas: params.betas,
                userBillingGracePeriodEnds: params.userBillingGracePeriodEnds,
                amountOwed: undefined,
                ownerBillingGracePeriodEnd: undefined,
                full: true,
                delegateEmail: undefined,
            });
        });

        it('should call onPress with payment type for other payment types', () => {
            const params = {...baseParams, iouPaymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE as PaymentMethodType};

            selectPaymentType(params);

            expect(mockOnPress).toHaveBeenCalledWith({paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE});
        });

        it('should not restrict when policy is undefined', () => {
            const params = {...baseParams, policy: undefined, amountOwed: 100};

            selectPaymentType(params);

            expect(mockShouldRestrict).not.toHaveBeenCalled();
            expect(mockOnPress).toHaveBeenCalledWith({paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE});
        });

        it('should pass amountOwed and ownerBillingGracePeriodEnd as undefined when they are undefined', () => {
            const params = {...baseParams, amountOwed: undefined, ownerBillingGracePeriodEnd: undefined};

            selectPaymentType(params);

            expect(mockShouldRestrict).toHaveBeenCalledWith(testPolicy, undefined, params.userBillingGracePeriodEnds, undefined);
        });
    });

    describe('getBusinessBankAccountOptions', () => {
        it('returns empty array when no payment methods passed', () => {
            expect(getBusinessBankAccountOptions([])).toEqual([]);
        });

        it('drops methods without valid accountData', () => {
            const methods: PaymentMethod[] = [
                createMockPaymentMethod({accountData: undefined}),
                createMockPaymentMethod({accountData: null}),
                createMockPaymentMethod({accountData: {}}),
                createMockPaymentMethod({accountData: {state: CONST.BANK_ACCOUNT.STATE.OPEN}}),
                createMockPaymentMethod({accountData: {type: CONST.BANK_ACCOUNT.TYPE.BUSINESS}}),
            ];
            expect(getBusinessBankAccountOptions(methods)).toHaveLength(0);
        });

        it('drops PERSONAL account type (only BUSINESS included)', () => {
            const methods: PaymentMethod[] = [createMockPaymentMethod({accountData: {type: CONST.BANK_ACCOUNT.TYPE.PERSONAL, state: CONST.BANK_ACCOUNT.STATE.OPEN}})];
            expect(getBusinessBankAccountOptions(methods)).toHaveLength(0);
        });

        it('drops partially setup accounts', () => {
            expect(getBusinessBankAccountOptions([createMockPaymentMethod({accountData: {type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, state: CONST.BANK_ACCOUNT.STATE.SETUP}})])).toHaveLength(0);
            expect(getBusinessBankAccountOptions([createMockPaymentMethod({accountData: {type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, state: CONST.BANK_ACCOUNT.STATE.VERIFYING}})])).toHaveLength(
                0,
            );
            expect(getBusinessBankAccountOptions([createMockPaymentMethod({accountData: {type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, state: CONST.BANK_ACCOUNT.STATE.PENDING}})])).toHaveLength(
                0,
            );
        });

        it('drops non-OPEN and non-LOCKED state', () => {
            const methods: PaymentMethod[] = [
                createMockPaymentMethod({accountData: {type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, state: CONST.BANK_ACCOUNT.STATE.VERIFYING}}),
                createMockPaymentMethod({accountData: {type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, state: CONST.BANK_ACCOUNT.STATE.OPEN}}),
                createMockPaymentMethod({accountData: {type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, state: CONST.BANK_ACCOUNT.STATE.LOCKED}}),
            ];
            expect(getBusinessBankAccountOptions(methods)).toHaveLength(2);
        });

        it('drops methods with null or undefined methodID', () => {
            expect(getBusinessBankAccountOptions([createMockPaymentMethod({methodID: null})])).toHaveLength(0);
            expect(getBusinessBankAccountOptions([createMockPaymentMethod({methodID: undefined})])).toHaveLength(0);
        });

        it('returns properly constructed BusinessBankAccountOption for valid BUSINESS OPEN account with methodID', () => {
            const methods: PaymentMethod[] = [createMockPaymentMethod({title: 'Acme Corp', description: 'USD • 1234', methodID: 456})];
            const result = getBusinessBankAccountOptions(methods);

            expect(result).toHaveLength(1);
            expect(result.at(0)).toEqual({
                text: 'Acme Corp',
                description: 'USD • 1234',
                icon: undefined,
                iconStyles: [],
                iconSize: 40,
                methodID: 456,
            });
        });

        it('returns multiple options when multiple valid business bank accounts passed', () => {
            const methods: PaymentMethod[] = [createMockPaymentMethod({title: 'Account A', methodID: 1}), createMockPaymentMethod({title: 'Account B', methodID: 2})];
            const result = getBusinessBankAccountOptions(methods);

            expect(result).toHaveLength(2);
            expect(result.at(0)?.text).toBe('Account A');
            expect(result.at(0)?.methodID).toBe(1);
            expect(result.at(1)?.text).toBe('Account B');
            expect(result.at(1)?.methodID).toBe(2);
        });

        it('filters to only valid BUSINESS OPEN or LOCKED with methodID and maps rest correctly', () => {
            const methods: PaymentMethod[] = [
                createMockPaymentMethod({accountData: {type: CONST.BANK_ACCOUNT.TYPE.PERSONAL, state: CONST.BANK_ACCOUNT.STATE.OPEN}, title: 'Personal'}),
                createMockPaymentMethod({title: 'Valid Business'}),
                createMockPaymentMethod({accountData: {type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, state: CONST.BANK_ACCOUNT.STATE.SETUP}, title: 'Setup'}),
                createMockPaymentMethod({accountData: {type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, state: CONST.BANK_ACCOUNT.STATE.LOCKED}, title: 'Locked'}),
            ];
            const result = getBusinessBankAccountOptions(methods);

            expect(result).toHaveLength(2);
            expect(result.at(0)?.text).toBe('Valid Business');
        });
    });
});
