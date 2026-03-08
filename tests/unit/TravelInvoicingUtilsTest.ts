import CONST from '@src/CONST';
// Needed for testing usage with jest.spyOn
// eslint-disable-next-line no-restricted-imports
import * as Environment from '@src/libs/Environment/Environment';
import {
    getIsTravelInvoicingEnabled,
    getTravelInvoicingCard,
    getTravelLimit,
    getTravelSettlementAccount,
    getTravelSettlementFrequency,
    getTravelSpend,
    hasTravelInvoicingSettlementAccount,
    isTravelCVVEligible,
} from '@src/libs/TravelInvoicingUtils';
import type {BankAccountList, WorkspaceCardsList} from '@src/types/onyx';
import type {ExpensifyCardSettingsBase} from '@src/types/onyx/ExpensifyCardSettings';

jest.mock('@src/libs/Environment/Environment', () => ({
    getEnvironmentURL: jest.fn(() => Promise.resolve('https://new.expensify.com')),
    getOldDotEnvironmentURL: jest.fn(() => Promise.resolve('https://www.expensify.com')),
    isDevelopment: jest.fn(() => false),
    isInternalTestBuild: jest.fn(() => false),
    isStaging: jest.fn(() => false),
}));

describe('TravelInvoicingUtils', () => {
    let isDevelopmentSpy: jest.SpyInstance;
    let isInternalTestBuildSpy: jest.SpyInstance;

    beforeAll(() => {
        isDevelopmentSpy = jest.spyOn(Environment, 'isDevelopment').mockReturnValue(false);
        isInternalTestBuildSpy = jest.spyOn(Environment, 'isInternalTestBuild').mockReturnValue(false);
    });

    afterEach(() => {
        isDevelopmentSpy.mockReturnValue(false);
        isInternalTestBuildSpy.mockReturnValue(false);
        jest.clearAllMocks();
    });
    describe('PROGRAM_TRAVEL_US constant', () => {
        it('Should be defined as TRAVEL_US', () => {
            expect(CONST.TRAVEL.PROGRAM_TRAVEL_US).toBe('TRAVEL_US');
        });
    });

    describe('getIsTravelInvoicingEnabled', () => {
        it('Should return false when travelSettings is undefined', () => {
            const result = getIsTravelInvoicingEnabled(undefined);
            expect(result).toBe(false);
        });

        it('Should return false when isEnabled is false', () => {
            const travelSettings = {isEnabled: false} as ExpensifyCardSettingsBase;
            const result = getIsTravelInvoicingEnabled(travelSettings);
            expect(result).toBe(false);
        });

        it('Should return true when isEnabled is true', () => {
            const travelSettings = {isEnabled: true} as ExpensifyCardSettingsBase;
            const result = getIsTravelInvoicingEnabled(travelSettings);
            expect(result).toBe(true);
        });

        it('Should return false when isEnabled is undefined and no paymentBankAccountID (new account)', () => {
            const travelSettings = {} as ExpensifyCardSettingsBase;
            const result = getIsTravelInvoicingEnabled(travelSettings);
            expect(result).toBe(false);
        });

        it('Should return true when isEnabled is undefined but paymentBankAccountID exists (legacy)', () => {
            const travelSettings = {paymentBankAccountID: 12345} as ExpensifyCardSettingsBase;
            const result = getIsTravelInvoicingEnabled(travelSettings);
            expect(result).toBe(true);
        });

        it('Should return false when isEnabled is explicitly false even with paymentBankAccountID', () => {
            const travelSettings = {isEnabled: false, paymentBankAccountID: 12345} as ExpensifyCardSettingsBase;
            const result = getIsTravelInvoicingEnabled(travelSettings);
            expect(result).toBe(false);
        });

        it('Should return true when isEnabled is true with paymentBankAccountID', () => {
            const travelSettings = {isEnabled: true, paymentBankAccountID: 12345} as ExpensifyCardSettingsBase;
            const result = getIsTravelInvoicingEnabled(travelSettings);
            expect(result).toBe(true);
        });
    });

    describe('hasTravelInvoicingSettlementAccount', () => {
        it('Should return false when travelSettings is undefined', () => {
            const result = hasTravelInvoicingSettlementAccount(undefined);
            expect(result).toBe(false);
        });

        it('Should return false when paymentBankAccountID is not set', () => {
            const travelSettings = {} as ExpensifyCardSettingsBase;
            const result = hasTravelInvoicingSettlementAccount(travelSettings);
            expect(result).toBe(false);
        });

        it('Should return false when paymentBankAccountID is DEFAULT_NUMBER_ID (0)', () => {
            const travelSettings = {paymentBankAccountID: CONST.DEFAULT_NUMBER_ID} as ExpensifyCardSettingsBase;
            const result = hasTravelInvoicingSettlementAccount(travelSettings);
            expect(result).toBe(false);
        });

        it('Should return true when paymentBankAccountID is a valid non-zero value', () => {
            const travelSettings = {paymentBankAccountID: 67890} as ExpensifyCardSettingsBase;
            const result = hasTravelInvoicingSettlementAccount(travelSettings);
            expect(result).toBe(true);
        });
    });

    describe('getTravelLimit', () => {
        it('Should return 0 when travelSettings is undefined', () => {
            const result = getTravelLimit(undefined);
            expect(result).toBe(0);
        });

        it('Should return the remainingLimit value when set', () => {
            const travelSettings = {remainingLimit: 50000} as ExpensifyCardSettingsBase;
            const result = getTravelLimit(travelSettings);
            expect(result).toBe(50000);
        });

        it('Should return the limit value when set', () => {
            const travelSettings = {limit: 75000} as ExpensifyCardSettingsBase;
            const result = getTravelLimit(travelSettings);
            expect(result).toBe(75000);
        });
    });

    describe('getTravelSpend', () => {
        it('Should return 0 when travelSettings is undefined', () => {
            const result = getTravelSpend(undefined);
            expect(result).toBe(0);
        });

        it('Should return the currentBalance value when set', () => {
            const travelSettings = {currentBalance: 25000} as ExpensifyCardSettingsBase;
            const result = getTravelSpend(travelSettings);
            expect(result).toBe(25000);
        });
    });

    describe('getTravelSettlementFrequency', () => {
        it('Should return monthly (default) when travelSettings is undefined', () => {
            const result = getTravelSettlementFrequency(undefined);
            expect(result).toBe(CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY);
        });

        it('Should return daily when no monthlySettlementDate is set', () => {
            const travelSettings = {isEnabled: true} as ExpensifyCardSettingsBase;
            const result = getTravelSettlementFrequency(travelSettings);
            expect(result).toBe(CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY);
        });

        it('Should return monthly when monthlySettlementDate is set', () => {
            const travelSettings = {monthlySettlementDate: new Date('2024-01-15')} as ExpensifyCardSettingsBase;
            const result = getTravelSettlementFrequency(travelSettings);
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

        it('Should return undefined when travelSettings is undefined', () => {
            const result = getTravelSettlementAccount(undefined, mockBankAccountList);
            expect(result).toBeUndefined();
        });

        it('Should return undefined when paymentBankAccountID is not set', () => {
            const travelSettings = {} as ExpensifyCardSettingsBase;
            const result = getTravelSettlementAccount(travelSettings, mockBankAccountList);
            expect(result).toBeUndefined();
        });

        it('Should use paymentBankAccountAddressName when available', () => {
            const travelSettings = {
                paymentBankAccountID: 12345,
                paymentBankAccountAddressName: 'Custom Name',
                paymentBankAccountNumber: '****5678',
            } as ExpensifyCardSettingsBase;
            const result = getTravelSettlementAccount(travelSettings, mockBankAccountList);
            expect(result).toBeDefined();
            expect(result?.displayName).toBe('Custom Name');
            expect(result?.last4).toBe('5678');
        });

        it('Should fallback to bank account data when paymentBankAccountAddressName is not set', () => {
            const travelSettings = {
                paymentBankAccountID: 'bankAccountID' as unknown as number,
            } as ExpensifyCardSettingsBase;
            const result = getTravelSettlementAccount(travelSettings, mockBankAccountList);
            expect(result).toBeDefined();
            expect(result?.displayName).toBe('Test Company');
            expect(result?.last4).toBe('1234');
        });

        it('Should return bankAccountID in the result', () => {
            const travelSettings = {
                paymentBankAccountID: 12345,
            } as ExpensifyCardSettingsBase;
            const result = getTravelSettlementAccount(travelSettings, mockBankAccountList);
            expect(result).toBeDefined();
            expect(result?.bankAccountID).toBe(12345);
        });

        it('Should handle missing bank account in list gracefully', () => {
            const travelSettings = {
                paymentBankAccountID: 99999,
            } as ExpensifyCardSettingsBase;
            const result = getTravelSettlementAccount(travelSettings, mockBankAccountList);
            expect(result).toBeDefined();
            expect(result?.displayName).toBe('');
            expect(result?.last4).toBe('');
        });
    });

    describe('getTravelInvoicingCard', () => {
        it('Should return undefined when cardList is undefined', () => {
            const result = getTravelInvoicingCard(undefined);
            expect(result).toBeUndefined();
        });

        it('Should return undefined when cardList is empty', () => {
            const result = getTravelInvoicingCard({});
            expect(result).toBeUndefined();
        });

        it('Should return undefined when no travel card exists', () => {
            const cardList = {
                workspaceCards: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '1234': {
                        cardID: 1234,
                        state: 3,
                        nameValuePairs: {
                            isVirtual: true,
                            feedCountry: 'OTHER_COUNTRY',
                        },
                    },
                },
            } as unknown as Record<string, WorkspaceCardsList>;
            const result = getTravelInvoicingCard(cardList);
            expect(result).toBeUndefined();
        });

        it('Should return the travel card when feedCountry is PROGRAM_TRAVEL_US', () => {
            const cardList = {
                workspaceCards: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '1234': {
                        cardID: 1234,
                        state: 3,
                        nameValuePairs: {
                            isVirtual: true,
                            feedCountry: CONST.TRAVEL.PROGRAM_TRAVEL_US,
                        },
                    },
                },
            } as unknown as Record<string, WorkspaceCardsList>;
            const result = getTravelInvoicingCard(cardList);
            expect(result).toBeDefined();
            expect(result?.cardID).toBe(1234);
        });

        it('Should return first travel card when multiple cards exist', () => {
            const cardList = {
                workspaceCards: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '1111': {
                        cardID: 1111,
                        state: 3,
                        nameValuePairs: {
                            isVirtual: true,
                            feedCountry: 'OTHER_COUNTRY',
                        },
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '2222': {
                        cardID: 2222,
                        state: 3,
                        nameValuePairs: {
                            isVirtual: true,
                            feedCountry: CONST.TRAVEL.PROGRAM_TRAVEL_US,
                        },
                    },
                },
            } as unknown as Record<string, WorkspaceCardsList>;
            const result = getTravelInvoicingCard(cardList);
            expect(result).toBeDefined();
            expect(result?.nameValuePairs?.feedCountry).toBe(CONST.TRAVEL.PROGRAM_TRAVEL_US);
        });
        it('Should fallback to first available card when testing is enabled and no travel card exists', () => {
            isDevelopmentSpy.mockReturnValue(true);

            const cardList = {
                workspaceCards: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '9999': {
                        cardID: 9999,
                        state: 3,
                        bank: 'Expensify Card',
                        nameValuePairs: {
                            isVirtual: true,
                            feedCountry: 'OTHER_COUNTRY',
                        },
                    },
                },
            } as unknown as Record<string, WorkspaceCardsList>;

            const result = getTravelInvoicingCard(cardList);
            expect(result).toBeDefined();
            expect(result?.cardID).toBe(9999);
        });
    });

    describe('isTravelCVVEligible', () => {
        const mockTravelCardList = {
            workspaceCards: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '1234': {
                    cardID: 1234,
                    state: 3,
                    nameValuePairs: {
                        isVirtual: true,
                        feedCountry: CONST.TRAVEL.PROGRAM_TRAVEL_US,
                    },
                },
            },
        } as unknown as Record<string, WorkspaceCardsList>;

        const mockNonTravelCardList = {
            workspaceCards: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '5678': {
                    cardID: 5678,
                    state: 3,
                    bank: 'Expensify Card',
                    nameValuePairs: {
                        isVirtual: true,
                        feedCountry: 'OTHER_COUNTRY',
                    },
                },
            },
        } as unknown as Record<string, WorkspaceCardsList>;

        it('Should return false when beta is false', () => {
            const result = isTravelCVVEligible(false, mockTravelCardList);
            expect(result).toBe(false);
        });

        it('Should return false when cardList is undefined', () => {
            const result = isTravelCVVEligible(true, undefined);
            expect(result).toBe(false);
        });

        it('Should return false when no travel card exists', () => {
            const result = isTravelCVVEligible(true, mockNonTravelCardList);
            expect(result).toBe(false);
        });

        it('Should return false when beta is false even with travel card', () => {
            const result = isTravelCVVEligible(false, mockTravelCardList);
            expect(result).toBe(false);
        });

        it('Should return true when beta is true and travel card exists', () => {
            const result = isTravelCVVEligible(true, mockTravelCardList);
            expect(result).toBe(true);
        });

        it('Should return true when testing is enabled and beta is true even if no travel card exists', () => {
            isDevelopmentSpy.mockReturnValue(true);
            const result = isTravelCVVEligible(true, mockNonTravelCardList);
            expect(result).toBe(true);
        });
    });
});
