import type {OnyxEntry} from 'react-native-onyx';
import type {BankAccountMenuItem} from '@components/Search/types';
import Navigation from '@libs/Navigation/Navigation';
import {getActivePaymentType, handleUnvalidatedAccount} from '@libs/PaymentUtils';
import CONST from '@src/CONST';
import {calculateWalletTransferBalanceFee} from '@src/libs/PaymentUtils';
import type {Report} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(),
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
            expect(result.selectedPolicy).toBeUndefined();
        });

        it('should return VBBA payment type when paymentMethod is BUSINESS_BANK_ACCOUNT', () => {
            const result = getActivePaymentType(CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT, [], undefined);

            expect(result.paymentType).toBe(CONST.IOU.PAYMENT_TYPE.VBBA);
            expect(result.shouldSelectPaymentMethod).toBe(true);
            expect(result.selectedPolicy).toBeUndefined();
        });

        it('should return ELSEWHERE payment type when paymentMethod is DEBIT_CARD', () => {
            const result = getActivePaymentType(CONST.PAYMENT_METHODS.DEBIT_CARD, [], undefined);

            expect(result.paymentType).toBe(CONST.IOU.PAYMENT_TYPE.ELSEWHERE);
            expect(result.shouldSelectPaymentMethod).toBe(true);
            expect(result.selectedPolicy).toBeUndefined();
        });

        it('should return ELSEWHERE payment type when paymentMethod is undefined', () => {
            const result = getActivePaymentType(undefined, [], undefined);

            expect(result.paymentType).toBe(CONST.IOU.PAYMENT_TYPE.ELSEWHERE);
            expect(result.shouldSelectPaymentMethod).toBe(false);
            expect(result.selectedPolicy).toBeUndefined();
        });

        it('should set shouldSelectPaymentMethod to true when latestBankItems is not empty', () => {
            const result = getActivePaymentType(undefined, [], [bankItem]);

            expect(result.paymentType).toBe(CONST.IOU.PAYMENT_TYPE.ELSEWHERE);
            expect(result.shouldSelectPaymentMethod).toBe(true);
        });

        it('should find selectedPolicy by policyID', () => {
            const result = getActivePaymentType(undefined, [randomPolicyA, randomPolicyB], undefined, randomPolicyA.id);

            expect(result.selectedPolicy).toEqual(randomPolicyA);
        });

        it('should find selectedPolicy by paymentMethod when it matches policy id (Pay via workspace scenario)', () => {
            const result = getActivePaymentType(randomPolicyB.id, [randomPolicyA, randomPolicyB], undefined);

            expect(result.selectedPolicy).toEqual(randomPolicyB);
            expect(result.paymentType).toBe(CONST.IOU.PAYMENT_TYPE.ELSEWHERE);
            expect(result.shouldSelectPaymentMethod).toBe(false);
        });

        it('should return undefined selectedPolicy when no matching policy is found', () => {
            const result = getActivePaymentType(undefined, [randomPolicyA], undefined, 'non-existent-policy');

            expect(result.selectedPolicy).toBeUndefined();
        });
    });
});
