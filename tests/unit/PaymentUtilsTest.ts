import type {OnyxEntry} from 'react-native-onyx';
import type {BankAccountMenuItem} from '@components/Search/types';
import Navigation from '@libs/Navigation/Navigation';
import {getActivePaymentType, getBusinessBankAccountMenu, getBusinessBankAccountOptions, handleUnvalidatedAccount} from '@libs/PaymentUtils';
import type {BusinessBankAccountOption} from '@libs/PaymentUtils';
import CONST from '@src/CONST';
import {calculateWalletTransferBalanceFee} from '@src/libs/PaymentUtils';
import type {Report} from '@src/types/onyx';
import type PaymentMethod from '@src/types/onyx/PaymentMethod';
import createMockPaymentMethod from '../utils/collections/paymentMethods';
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

        it('drops non-OPEN state', () => {
            const methods: PaymentMethod[] = [createMockPaymentMethod({accountData: {type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, state: CONST.BANK_ACCOUNT.STATE.LOCKED}})];
            expect(getBusinessBankAccountOptions(methods)).toHaveLength(0);
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

        it('filters to only valid BUSINESS OPEN with methodID and maps rest correctly', () => {
            const methods: PaymentMethod[] = [
                createMockPaymentMethod({accountData: {type: CONST.BANK_ACCOUNT.TYPE.PERSONAL, state: CONST.BANK_ACCOUNT.STATE.OPEN}, title: 'Personal'}),
                createMockPaymentMethod({title: 'Valid Business'}),
                createMockPaymentMethod({accountData: {type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, state: CONST.BANK_ACCOUNT.STATE.SETUP}, title: 'Setup'}),
            ];
            const result = getBusinessBankAccountOptions(methods);

            expect(result).toHaveLength(1);
            expect(result.at(0)?.text).toBe('Valid Business');
        });
    });

    describe('getBusinessBankAccountMenu', () => {
        it('returns NONE when zero options', () => {
            const result = getBusinessBankAccountMenu([] as BusinessBankAccountOption[]);
            expect(result).toEqual({type: CONST.IOU.BUSINESS_BANK_ACCOUNT_MENU_TYPE.NONE});
        });

        it('returns SINGLE_VBBA with account when one option available', () => {
            const methods: PaymentMethod[] = [createMockPaymentMethod({title: 'Only Account', methodID: 1})];
            const options = getBusinessBankAccountOptions(methods);
            const result = getBusinessBankAccountMenu(options);

            expect(result).toEqual({
                type: CONST.IOU.BUSINESS_BANK_ACCOUNT_MENU_TYPE.SINGLE_VBBA,
                account: options.at(0),
            });
        });

        it('returns MULTIPLE_VBBA with accounts array when two or more options available', () => {
            const methods: PaymentMethod[] = [createMockPaymentMethod({title: 'A', methodID: 1}), createMockPaymentMethod({title: 'B', methodID: 2})];
            const options = getBusinessBankAccountOptions(methods);
            const result = getBusinessBankAccountMenu(options);

            expect(result).toEqual({
                type: CONST.IOU.BUSINESS_BANK_ACCOUNT_MENU_TYPE.MULTIPLE_VBBA,
                accounts: options,
            });
        });
    });
});
