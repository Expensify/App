import CONST from '@src/CONST';
import {
    getIsTravelInvoicingEnabled,
    getTravelLimit,
    getTravelSettlementAccount,
    getTravelSettlementFrequency,
    getTravelSpend,
    hasTravelInvoicingSettlementAccount,
} from '@src/libs/TravelInvoicingUtils';
import type {BankAccountList} from '@src/types/onyx';
import type ExpensifyCardSettings from '@src/types/onyx/ExpensifyCardSettings';

describe('TravelInvoicingUtils', () => {
    describe('PROGRAM_TRAVEL_US constant', () => {
        it('Should be defined as TRAVEL_US', () => {
            expect(CONST.TRAVEL.PROGRAM_TRAVEL_US).toBe('TRAVEL_US');
        });
    });

    describe('getIsTravelInvoicingEnabled', () => {
        it('Should return false when cardSettings is undefined', () => {
            const result = getIsTravelInvoicingEnabled(undefined);
            expect(result).toBe(false);
        });

        it('Should return false when cardSettings is null', () => {
            // Using undefined since OnyxEntry doesn't accept null
            const result = getIsTravelInvoicingEnabled(undefined);
            expect(result).toBe(false);
        });

        it('Should return false when paymentBankAccountID is not set', () => {
            const cardSettings = {} as ExpensifyCardSettings;
            const result = getIsTravelInvoicingEnabled(cardSettings);
            expect(result).toBe(false);
        });

        it('Should return false when paymentBankAccountID is 0', () => {
            const cardSettings = {paymentBankAccountID: 0} as ExpensifyCardSettings;
            const result = getIsTravelInvoicingEnabled(cardSettings);
            expect(result).toBe(false);
        });

        it('Should return true when paymentBankAccountID is set to a valid value', () => {
            const cardSettings = {paymentBankAccountID: 12345} as ExpensifyCardSettings;
            const result = getIsTravelInvoicingEnabled(cardSettings);
            expect(result).toBe(true);
        });
    });

    describe('hasTravelInvoicingSettlementAccount', () => {
        it('Should return false when cardSettings is undefined', () => {
            const result = hasTravelInvoicingSettlementAccount(undefined);
            expect(result).toBe(false);
        });

        it('Should return false when paymentBankAccountID is not set', () => {
            const cardSettings = {} as ExpensifyCardSettings;
            const result = hasTravelInvoicingSettlementAccount(cardSettings);
            expect(result).toBe(false);
        });

        it('Should return false when paymentBankAccountID is DEFAULT_NUMBER_ID (0)', () => {
            const cardSettings = {paymentBankAccountID: CONST.DEFAULT_NUMBER_ID} as ExpensifyCardSettings;
            const result = hasTravelInvoicingSettlementAccount(cardSettings);
            expect(result).toBe(false);
        });

        it('Should return true when paymentBankAccountID is a valid non-zero value', () => {
            const cardSettings = {paymentBankAccountID: 67890} as ExpensifyCardSettings;
            const result = hasTravelInvoicingSettlementAccount(cardSettings);
            expect(result).toBe(true);
        });
    });

    describe('getTravelLimit', () => {
        it('Should return 0 when cardSettings is undefined', () => {
            const result = getTravelLimit(undefined);
            expect(result).toBe(0);
        });

        it('Should return 0 when remainingLimit is not set', () => {
            const cardSettings = {} as ExpensifyCardSettings;
            const result = getTravelLimit(cardSettings);
            expect(result).toBe(0);
        });

        it('Should return the remainingLimit value when set', () => {
            const cardSettings = {remainingLimit: 50000} as ExpensifyCardSettings;
            const result = getTravelLimit(cardSettings);
            expect(result).toBe(50000);
        });
    });

    describe('getTravelSpend', () => {
        it('Should return 0 when cardSettings is undefined', () => {
            const result = getTravelSpend(undefined);
            expect(result).toBe(0);
        });

        it('Should return 0 when currentBalance is not set', () => {
            const cardSettings = {} as ExpensifyCardSettings;
            const result = getTravelSpend(cardSettings);
            expect(result).toBe(0);
        });

        it('Should return the currentBalance value when set', () => {
            const cardSettings = {currentBalance: 25000} as ExpensifyCardSettings;
            const result = getTravelSpend(cardSettings);
            expect(result).toBe(25000);
        });
    });

    describe('getTravelSettlementFrequency', () => {
        it('Should return monthly (default) when cardSettings is undefined', () => {
            const result = getTravelSettlementFrequency(undefined);
            expect(result).toBe(CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY);
        });

        it('Should return daily when monthlySettlementDate is not set', () => {
            const cardSettings = {} as ExpensifyCardSettings;
            const result = getTravelSettlementFrequency(cardSettings);
            expect(result).toBe(CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY);
        });

        it('Should return monthly when monthlySettlementDate is set', () => {
            const cardSettings = {monthlySettlementDate: new Date('2024-01-15')} as ExpensifyCardSettings;
            const result = getTravelSettlementFrequency(cardSettings);
            expect(result).toBe(CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY);
        });
    });

    describe('getTravelSettlementAccount', () => {
        const mockBankAccountList: BankAccountList = {
            bankAccountID: {
                bankCurrency: 'USD',
                bankCountry: 'US',
                accountData: {
                    addressName: 'Test Company',
                    accountNumber: '****1234',
                    routingNumber: '123456789',
                    bankAccountID: 12345,
                },
            },
        };

        it('Should return undefined when cardSettings is undefined', () => {
            const result = getTravelSettlementAccount(undefined, mockBankAccountList);
            expect(result).toBeUndefined();
        });

        it('Should return undefined when paymentBankAccountID is not set', () => {
            const cardSettings = {} as ExpensifyCardSettings;
            const result = getTravelSettlementAccount(cardSettings, mockBankAccountList);
            expect(result).toBeUndefined();
        });

        it('Should use paymentBankAccountAddressName when available', () => {
            const cardSettings = {
                paymentBankAccountID: 12345,
                paymentBankAccountAddressName: 'Custom Name',
                paymentBankAccountNumber: '****5678',
            } as ExpensifyCardSettings;
            const result = getTravelSettlementAccount(cardSettings, mockBankAccountList);
            expect(result).toBeDefined();
            expect(result?.displayName).toBe('Custom Name');
            expect(result?.last4).toBe('5678');
        });

        it('Should fallback to bank account data when paymentBankAccountAddressName is not set', () => {
            const cardSettings = {
                paymentBankAccountID: 'bankAccountID' as unknown as number,
            } as ExpensifyCardSettings;
            const result = getTravelSettlementAccount(cardSettings, mockBankAccountList);
            expect(result).toBeDefined();
            expect(result?.displayName).toBe('Test Company');
            expect(result?.last4).toBe('1234');
        });

        it('Should return bankAccountID in the result', () => {
            const cardSettings = {
                paymentBankAccountID: 12345,
            } as ExpensifyCardSettings;
            const result = getTravelSettlementAccount(cardSettings, mockBankAccountList);
            expect(result).toBeDefined();
            expect(result?.bankAccountID).toBe(12345);
        });

        it('Should handle missing bank account in list gracefully', () => {
            const cardSettings = {
                paymentBankAccountID: 99999,
            } as ExpensifyCardSettings;
            const result = getTravelSettlementAccount(cardSettings, mockBankAccountList);
            expect(result).toBeDefined();
            expect(result?.displayName).toBe('');
            expect(result?.last4).toBe('');
        });
    });
});
