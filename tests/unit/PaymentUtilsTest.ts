import type {OnyxEntry} from 'react-native-onyx';
import type {BankAccountMenuItem} from '@components/Search/types';
import {setPersonalBankAccountContinueKYCOnSuccess} from '@libs/actions/BankAccounts';
import {approveMoneyRequest} from '@libs/actions/IOU';
import Navigation from '@libs/Navigation/Navigation';
import {getActivePaymentType, handleUnvalidatedAccount, selectPaymentType} from '@libs/PaymentUtils';
import type {SelectPaymentTypeParams} from '@libs/PaymentUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import {calculateWalletTransferBalanceFee} from '@src/libs/PaymentUtils';
import ROUTES from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
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

jest.mock('@libs/actions/IOU', () => ({
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

        it('should set shouldSelectPaymentMethod to true when latestBankItems is not empty', () => {
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
        const testPolicy = createRandomPolicy(1) as OnyxEntry<Policy>;
        const testPolicyID = testPolicy?.id ?? '';

        const baseParams: SelectPaymentTypeParams = {
            event: undefined,
            iouPaymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            triggerKYCFlow: mockTriggerKYCFlow,
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
            userBillingGraceEndPeriods: undefined,
            amountOwed: 0,
        };

        beforeEach(() => {
            jest.clearAllMocks();
            mockShouldRestrict.mockReturnValue(false);
        });

        it('should navigate to restricted action page when billable actions are restricted', () => {
            mockShouldRestrict.mockReturnValue(true);
            const params = {...baseParams, amountOwed: 100};

            selectPaymentType(params);

            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.RESTRICTED_ACTION.getRoute(testPolicyID));
            expect(mockOnPress).not.toHaveBeenCalled();
        });

        it('should not restrict when amountOwed is 0', () => {
            mockShouldRestrict.mockReturnValue(false);

            selectPaymentType({...baseParams, amountOwed: 0});

            expect(mockOnPress).toHaveBeenCalledWith({paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE});
        });

        it('should trigger KYC flow for EXPENSIFY payment type when user is validated', () => {
            const params: SelectPaymentTypeParams = {...baseParams, iouPaymentType: CONST.IOU.PAYMENT_TYPE.EXPENSIFY as PaymentMethodType};

            selectPaymentType(params);

            expect(mockTriggerKYCFlow).toHaveBeenCalledWith({event: undefined, iouPaymentType: CONST.IOU.PAYMENT_TYPE.EXPENSIFY});
            expect(setPersonalBankAccountContinueKYCOnSuccess).toHaveBeenCalledWith(ROUTES.ENABLE_PAYMENTS);
        });

        it('should navigate to unvalidated account page for EXPENSIFY payment when user is not validated', () => {
            const mockGetActiveRoute = Navigation.getActiveRoute as jest.MockedFunction<typeof Navigation.getActiveRoute>;
            mockGetActiveRoute.mockReturnValue('r/1');
            const params: SelectPaymentTypeParams = {...baseParams, iouPaymentType: CONST.IOU.PAYMENT_TYPE.EXPENSIFY as PaymentMethodType, isUserValidated: false};

            selectPaymentType(params);

            expect(mockTriggerKYCFlow).not.toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalled();
        });

        it('should call confirmApproval when payment type is APPROVE and confirmApproval is provided', () => {
            const params: SelectPaymentTypeParams = {
                ...baseParams,
                iouPaymentType: CONST.IOU.REPORT_ACTION_TYPE.APPROVE as PaymentMethodType,
                confirmApproval: mockConfirmApproval,
            };

            selectPaymentType(params);

            expect(mockConfirmApproval).toHaveBeenCalled();
            expect(approveMoneyRequest).not.toHaveBeenCalled();
        });

        it('should call approveMoneyRequest with amountOwed when payment type is APPROVE and no confirmApproval', () => {
            const params: SelectPaymentTypeParams = {
                ...baseParams,
                iouPaymentType: CONST.IOU.REPORT_ACTION_TYPE.APPROVE as PaymentMethodType,
                amountOwed: 42,
            };

            selectPaymentType(params);

            expect(approveMoneyRequest).toHaveBeenCalledWith(
                params.iouReport,
                params.policy,
                params.currentAccountID,
                params.currentEmail,
                params.hasViolations,
                params.isASAPSubmitBetaEnabled,
                params.iouReportNextStep,
                params.betas,
                params.userBillingGraceEndPeriods,
                42,
                true,
            );
        });

        it('should pass amountOwed as undefined to approveMoneyRequest when amountOwed is undefined', () => {
            const params: SelectPaymentTypeParams = {
                ...baseParams,
                iouPaymentType: CONST.IOU.REPORT_ACTION_TYPE.APPROVE as PaymentMethodType,
                amountOwed: undefined,
            };

            selectPaymentType(params);

            expect(approveMoneyRequest).toHaveBeenCalledWith(
                params.iouReport,
                params.policy,
                params.currentAccountID,
                params.currentEmail,
                params.hasViolations,
                params.isASAPSubmitBetaEnabled,
                params.iouReportNextStep,
                params.betas,
                params.userBillingGraceEndPeriods,
                undefined,
                true,
            );
        });

        it('should call onPress with payment type for other payment types', () => {
            selectPaymentType({...baseParams, iouPaymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE as PaymentMethodType});

            expect(mockOnPress).toHaveBeenCalledWith({paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE});
        });

        it('should not restrict when policy is undefined', () => {
            const params: SelectPaymentTypeParams = {...baseParams, policy: undefined, amountOwed: 100};

            selectPaymentType(params);

            expect(mockShouldRestrict).not.toHaveBeenCalled();
            expect(mockOnPress).toHaveBeenCalledWith({paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE});
        });
    });
});
