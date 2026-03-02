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
import type ExpensifyCardSettings from '@src/types/onyx/ExpensifyCardSettings';

jest.mock('@src/libs/Environment/Environment');

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
        it('Should return false when cardSettings is undefined', () => {
            const result = getIsTravelInvoicingEnabled(undefined);
            expect(result).toBe(false);
        });

        it('Should return false when cardSettings is null', () => {
            // Using undefined since OnyxEntry doesn't accept null
            const result = getIsTravelInvoicingEnabled(undefined);
            expect(result).toBe(false);
        });

        it('Should return false when root-level isEnabled is false without TRAVEL_US', () => {
            const cardSettings = {isEnabled: false} as ExpensifyCardSettings;
            const result = getIsTravelInvoicingEnabled(cardSettings);
            expect(result).toBe(false);
        });

        it('Should return false when root-level isEnabled is true without TRAVEL_US (not travel settings)', () => {
            const cardSettings = {isEnabled: true} as ExpensifyCardSettings;
            const result = getIsTravelInvoicingEnabled(cardSettings);
            expect(result).toBe(false);
        });

        it('Should return false when isEnabled is undefined and no TRAVEL_US (new account)', () => {
            // Empty settings (like from loading state) should return false, not true
            const cardSettings = {} as ExpensifyCardSettings;
            const result = getIsTravelInvoicingEnabled(cardSettings);
            expect(result).toBe(false);
        });

        it('Should return false when root-level paymentBankAccountID exists but no TRAVEL_US (Expensify Card settlement account)', () => {
            const cardSettings = {paymentBankAccountID: 12345} as ExpensifyCardSettings;
            const result = getIsTravelInvoicingEnabled(cardSettings);
            expect(result).toBe(false);
        });

        it('Should return true when TRAVEL_US has valid paymentBankAccountID and isEnabled is undefined', () => {
            const cardSettings = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                TRAVEL_US: {paymentBankAccountID: 12345},
            } as ExpensifyCardSettings;
            const result = getIsTravelInvoicingEnabled(cardSettings);
            expect(result).toBe(true);
        });

        // Tests for nested TRAVEL_US structure (backend response format)
        it('Should return false when nested TRAVEL_US.isEnabled is false', () => {
            const cardSettings = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                TRAVEL_US: {isEnabled: false, paymentBankAccountID: 12345},
            } as ExpensifyCardSettings;
            const result = getIsTravelInvoicingEnabled(cardSettings);
            expect(result).toBe(false);
        });

        it('Should return true when nested TRAVEL_US.isEnabled is true', () => {
            const cardSettings = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                TRAVEL_US: {isEnabled: true, paymentBankAccountID: 12345},
            } as ExpensifyCardSettings;
            const result = getIsTravelInvoicingEnabled(cardSettings);
            expect(result).toBe(true);
        });

        it('Should prioritize nested TRAVEL_US over root level', () => {
            // Even if root level says enabled, nested TRAVEL_US should take precedence
            const cardSettings = {
                isEnabled: true,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                TRAVEL_US: {isEnabled: false},
            } as ExpensifyCardSettings;
            const result = getIsTravelInvoicingEnabled(cardSettings);
            expect(result).toBe(false);
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

        it('Should return false when only root-level paymentBankAccountID exists (no TRAVEL_US)', () => {
            const cardSettings = {paymentBankAccountID: 67890} as ExpensifyCardSettings;
            const result = hasTravelInvoicingSettlementAccount(cardSettings);
            expect(result).toBe(false);
        });

        it('Should return true when TRAVEL_US has a valid non-zero paymentBankAccountID', () => {
            const cardSettings = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                TRAVEL_US: {paymentBankAccountID: 67890},
            } as ExpensifyCardSettings;
            const result = hasTravelInvoicingSettlementAccount(cardSettings);
            expect(result).toBe(true);
        });
    });

    describe('getTravelLimit', () => {
        it('Should return 0 when cardSettings is undefined', () => {
            const result = getTravelLimit(undefined);
            expect(result).toBe(0);
        });

        it('Should return 0 when no TRAVEL_US exists', () => {
            const cardSettings = {remainingLimit: 50000} as ExpensifyCardSettings;
            const result = getTravelLimit(cardSettings);
            expect(result).toBe(0);
        });

        it('Should return the limit value from TRAVEL_US when set', () => {
            const cardSettings = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                TRAVEL_US: {remainingLimit: 50000},
            } as ExpensifyCardSettings;
            const result = getTravelLimit(cardSettings);
            expect(result).toBe(50000);
        });
    });

    describe('getTravelSpend', () => {
        it('Should return 0 when cardSettings is undefined', () => {
            const result = getTravelSpend(undefined);
            expect(result).toBe(0);
        });

        it('Should return 0 when no TRAVEL_US exists', () => {
            const cardSettings = {currentBalance: 25000} as ExpensifyCardSettings;
            const result = getTravelSpend(cardSettings);
            expect(result).toBe(0);
        });

        it('Should return the currentBalance value from TRAVEL_US when set', () => {
            const cardSettings = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                TRAVEL_US: {currentBalance: 25000},
            } as ExpensifyCardSettings;
            const result = getTravelSpend(cardSettings);
            expect(result).toBe(25000);
        });
    });

    describe('getTravelSettlementFrequency', () => {
        it('Should return monthly (default) when cardSettings is undefined', () => {
            const result = getTravelSettlementFrequency(undefined);
            expect(result).toBe(CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY);
        });

        it('Should return monthly (default) when no TRAVEL_US exists', () => {
            const cardSettings = {} as ExpensifyCardSettings;
            const result = getTravelSettlementFrequency(cardSettings);
            expect(result).toBe(CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY);
        });

        it('Should return daily when TRAVEL_US has no monthlySettlementDate', () => {
            const cardSettings = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                TRAVEL_US: {isEnabled: true},
            } as ExpensifyCardSettings;
            const result = getTravelSettlementFrequency(cardSettings);
            expect(result).toBe(CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY);
        });

        it('Should return monthly when TRAVEL_US has monthlySettlementDate', () => {
            const cardSettings = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                TRAVEL_US: {monthlySettlementDate: new Date('2024-01-15')},
            } as ExpensifyCardSettings;
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

        it('Should return undefined when only root-level paymentBankAccountID exists (no TRAVEL_US)', () => {
            const cardSettings = {
                paymentBankAccountID: 12345,
                paymentBankAccountAddressName: 'Custom Name',
            } as ExpensifyCardSettings;
            const result = getTravelSettlementAccount(cardSettings, mockBankAccountList);
            expect(result).toBeUndefined();
        });

        it('Should use paymentBankAccountAddressName from TRAVEL_US when available', () => {
            const cardSettings = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                TRAVEL_US: {
                    paymentBankAccountID: 12345,
                    paymentBankAccountAddressName: 'Custom Name',
                    paymentBankAccountNumber: '****5678',
                },
            } as ExpensifyCardSettings;
            const result = getTravelSettlementAccount(cardSettings, mockBankAccountList);
            expect(result).toBeDefined();
            expect(result?.displayName).toBe('Custom Name');
            expect(result?.last4).toBe('5678');
        });

        it('Should fallback to bank account data when TRAVEL_US paymentBankAccountAddressName is not set', () => {
            const cardSettings = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                TRAVEL_US: {
                    paymentBankAccountID: 'bankAccountID' as unknown as number,
                },
            } as ExpensifyCardSettings;
            const result = getTravelSettlementAccount(cardSettings, mockBankAccountList);
            expect(result).toBeDefined();
            expect(result?.displayName).toBe('Test Company');
            expect(result?.last4).toBe('1234');
        });

        it('Should return bankAccountID from TRAVEL_US in the result', () => {
            const cardSettings = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                TRAVEL_US: {
                    paymentBankAccountID: 12345,
                },
            } as ExpensifyCardSettings;
            const result = getTravelSettlementAccount(cardSettings, mockBankAccountList);
            expect(result).toBeDefined();
            expect(result?.bankAccountID).toBe(12345);
        });

        it('Should handle missing bank account in list gracefully', () => {
            const cardSettings = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                TRAVEL_US: {
                    paymentBankAccountID: 99999,
                },
            } as ExpensifyCardSettings;
            const result = getTravelSettlementAccount(cardSettings, mockBankAccountList);
            expect(result).toBeDefined();
            expect(result?.displayName).toBe('');
            expect(result?.last4).toBe('');
        });
    });

    describe('getTravelSettings (internal usage via other public methods)', () => {
        // We test this via getTravelSettlementFrequency which relies on getTravelSettings
        it('Should merge root settings with partial nested TRAVEL_US settings', () => {
            const cardSettings = {
                monthlySettlementDate: new Date('2024-01-01'), // Root level
                // eslint-disable-next-line @typescript-eslint/naming-convention
                TRAVEL_US: {
                    isEnabled: true, // Nested level (partial)
                },
            } as ExpensifyCardSettings;

            // Should get frequency from root (Monthly) even though TRAVEL_US doesn't have it
            const result = getTravelSettlementFrequency(cardSettings);
            expect(result).toBe(CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY);

            // Should get enabled state from nested (true)
            const isEnabled = getIsTravelInvoicingEnabled(cardSettings);
            expect(isEnabled).toBe(true);
        });

        it('Should prioritize nested TRAVEL_US values over root values', () => {
            const cardSettings = {
                monthlySettlementDate: new Date('2024-01-01'), // Root level (Monthly)
                [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {
                    monthlySettlementDate: null as Date | null, // Nested level (Daily)
                },
            } as ExpensifyCardSettings;

            // Nested value (Daily) should win
            const result = getTravelSettlementFrequency(cardSettings);
            expect(result).toBe(CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY);
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
