import {
    getCompletedStepsForBankAccount,
    getBankAccountConnectionStatus,
    getBankAccountState,
    getDefaultCompanyWebsite,
    getLastFourDigits,
    getRequiredKYBDocuments,
    hasBankAccountAllowDebit,
    hasPartiallySetupBankAccount,
    hasPersonalBankAccountMissingInfo,
    isBankAccountPartiallySetup,
    isPersonalBankAccountMissingInfo,
    isUserAddressVerificationRequired,
    isUserDOBVerificationRequired,
    PERSONAL_INFO_STEP,
} from '@libs/BankAccountUtils';
import type {KYBVerificationResponses} from '@libs/BankAccountUtils';

import CONST from '@src/CONST';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {Account, BankAccountList, Session} from '@src/types/onyx';
import type AccountData from '@src/types/onyx/AccountData';

describe('BankAccountUtils', () => {
    describe('isPersonalBankAccountMissingInfo', () => {
        const completeAccountData: AccountData = {
            type: CONST.BANK_ACCOUNT.TYPE.PERSONAL,
            state: CONST.BANK_ACCOUNT.STATE.OPEN,
            additionalData: {
                country: CONST.COUNTRY.US,
                firstName: 'John',
                lastName: 'Doe',
                addressStreet: '123 Main St',
                addressCity: 'New York',
                addressState: 'NY',
                addressZipCode: '10001',
                companyPhone: '+15551234567',
            },
        } as AccountData;

        it('returns false for non-personal bank accounts', () => {
            const accountData = {
                ...completeAccountData,
                type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
            } as AccountData;
            expect(isPersonalBankAccountMissingInfo(accountData)).toBe(false);
        });

        it('returns false for accounts not in OPEN state', () => {
            const accountData = {
                ...completeAccountData,
                state: CONST.BANK_ACCOUNT.STATE.SETUP,
            } as AccountData;
            expect(isPersonalBankAccountMissingInfo(accountData)).toBe(false);
        });

        it('returns false for non-US accounts', () => {
            const accountData = {
                ...completeAccountData,
                additionalData: {...completeAccountData.additionalData, country: 'CA'},
            } as AccountData;
            expect(isPersonalBankAccountMissingInfo(accountData)).toBe(false);
        });

        it('defaults to US when country is undefined and returns false when all info is present', () => {
            const accountData = {
                ...completeAccountData,
                additionalData: {...completeAccountData.additionalData, country: undefined},
            } as AccountData;
            expect(isPersonalBankAccountMissingInfo(accountData)).toBe(false);
        });

        it('defaults to US when country is undefined and returns true when info is missing', () => {
            const accountData = {
                type: CONST.BANK_ACCOUNT.TYPE.PERSONAL,
                state: CONST.BANK_ACCOUNT.STATE.OPEN,
                additionalData: {country: undefined},
            } as AccountData;
            expect(isPersonalBankAccountMissingInfo(accountData)).toBe(true);
        });

        it('returns false when accountData is undefined', () => {
            expect(isPersonalBankAccountMissingInfo(undefined)).toBe(false);
        });

        it('defaults to US when additionalData is undefined and returns true since all fields are missing', () => {
            const accountData = {
                type: CONST.BANK_ACCOUNT.TYPE.PERSONAL,
                state: CONST.BANK_ACCOUNT.STATE.OPEN,
            } as AccountData;
            expect(isPersonalBankAccountMissingInfo(accountData)).toBe(true);
        });

        it.each([
            {field: 'firstName', override: {firstName: ''}},
            {field: 'lastName', override: {lastName: ''}},
            {field: 'addressStreet', override: {addressStreet: ''}},
            {field: 'addressCity', override: {addressCity: ''}},
            {field: 'addressState', override: {addressState: ''}},
            {field: 'addressZipCode', override: {addressZipCode: ''}},
            {field: 'companyPhone', override: {companyPhone: ''}},
        ])('returns true when $field is empty string', ({override}) => {
            const accountData = {
                ...completeAccountData,
                additionalData: {...completeAccountData.additionalData, ...override},
            } as AccountData;
            expect(isPersonalBankAccountMissingInfo(accountData)).toBe(true);
        });

        it.each([
            {field: 'firstName', override: {firstName: undefined}},
            {field: 'lastName', override: {lastName: undefined}},
            {field: 'addressStreet', override: {addressStreet: undefined}},
            {field: 'addressCity', override: {addressCity: undefined}},
            {field: 'addressState', override: {addressState: undefined}},
            {field: 'addressZipCode', override: {addressZipCode: undefined}},
            {field: 'companyPhone', override: {companyPhone: undefined}},
        ])('returns true when $field is undefined', ({override}) => {
            const accountData = {
                ...completeAccountData,
                additionalData: {...completeAccountData.additionalData, ...override},
            } as AccountData;
            expect(isPersonalBankAccountMissingInfo(accountData)).toBe(true);
        });

        it('returns true when all owner fields are missing (only country present)', () => {
            const accountData = {
                type: CONST.BANK_ACCOUNT.TYPE.PERSONAL,
                state: CONST.BANK_ACCOUNT.STATE.OPEN,
                additionalData: {country: CONST.COUNTRY.US},
            } as AccountData;
            expect(isPersonalBankAccountMissingInfo(accountData)).toBe(true);
        });

        it('returns true when name and phone are missing but address is present', () => {
            const accountData = {
                ...completeAccountData,
                additionalData: {
                    country: CONST.COUNTRY.US,
                    addressStreet: '123 Main St',
                    addressCity: 'New York',
                    addressState: 'NY',
                    addressZipCode: '10001',
                },
            } as AccountData;
            expect(isPersonalBankAccountMissingInfo(accountData)).toBe(true);
        });

        it('returns false when all info is present', () => {
            expect(isPersonalBankAccountMissingInfo(completeAccountData)).toBe(false);
        });

        describe('NewDot legalFirstName/legalLastName naming convention', () => {
            it('returns false when legalFirstName/legalLastName are set (NewDot) and firstName/lastName are missing', () => {
                const accountData = {
                    ...completeAccountData,
                    additionalData: {
                        ...completeAccountData.additionalData,
                        firstName: undefined,
                        lastName: undefined,
                        legalFirstName: 'John',
                        legalLastName: 'Doe',
                    },
                } as AccountData;
                expect(isPersonalBankAccountMissingInfo(accountData)).toBe(false);
            });

            it('returns true when only legalFirstName is set (lastName missing from both conventions)', () => {
                const accountData = {
                    ...completeAccountData,
                    additionalData: {
                        ...completeAccountData.additionalData,
                        firstName: undefined,
                        lastName: undefined,
                        legalFirstName: 'John',
                    },
                } as AccountData;
                expect(isPersonalBankAccountMissingInfo(accountData)).toBe(true);
            });

            it('returns true when only legalLastName is set (firstName missing from both conventions)', () => {
                const accountData = {
                    ...completeAccountData,
                    additionalData: {
                        ...completeAccountData.additionalData,
                        firstName: undefined,
                        lastName: undefined,
                        legalLastName: 'Doe',
                    },
                } as AccountData;
                expect(isPersonalBankAccountMissingInfo(accountData)).toBe(true);
            });

            it('returns true when firstName + legalLastName cross-convention (no complete pair)', () => {
                const accountData = {
                    ...completeAccountData,
                    additionalData: {
                        ...completeAccountData.additionalData,
                        firstName: 'John',
                        lastName: undefined,
                        legalLastName: 'Doe',
                    },
                } as AccountData;
                expect(isPersonalBankAccountMissingInfo(accountData)).toBe(true);
            });

            it('returns false when both naming conventions have complete pairs', () => {
                const accountData = {
                    ...completeAccountData,
                    additionalData: {
                        ...completeAccountData.additionalData,
                        firstName: 'John',
                        lastName: 'Doe',
                        legalFirstName: 'John',
                        legalLastName: 'Doe',
                    },
                } as AccountData;
                expect(isPersonalBankAccountMissingInfo(accountData)).toBe(false);
            });
        });
    });

    describe('getLastFourDigits', () => {
        it.each([
            {input: '123456789012', expected: '9012', description: 'long account number'},
            {input: '123', expected: '123', description: 'less than 4 characters'},
            {input: '', expected: '', description: 'empty string'},
            {input: '1234', expected: '1234', description: 'exactly 4 characters'},
        ])('returns $expected for $description', ({input, expected}) => {
            expect(getLastFourDigits(input)).toBe(expected);
        });
    });

    describe('isBankAccountPartiallySetup', () => {
        it.each([
            {state: CONST.BANK_ACCOUNT.STATE.SETUP, name: 'SETUP'},
            {state: CONST.BANK_ACCOUNT.STATE.VERIFYING, name: 'VERIFYING'},
            {state: CONST.BANK_ACCOUNT.STATE.PENDING, name: 'PENDING'},
        ])('returns true for $name state', ({state}) => {
            expect(isBankAccountPartiallySetup(state)).toBe(true);
        });

        it.each([
            {state: CONST.BANK_ACCOUNT.STATE.OPEN, name: 'OPEN'},
            {state: undefined, name: 'undefined'},
            {state: '', name: 'empty string'},
        ])('returns false for $name state', ({state}) => {
            expect(isBankAccountPartiallySetup(state)).toBe(false);
        });
    });

    describe('getBankAccountState', () => {
        it('returns the state from accountData', () => {
            expect(getBankAccountState({state: CONST.BANK_ACCOUNT.STATE.OPEN} as AccountData)).toBe(CONST.BANK_ACCOUNT.STATE.OPEN);
        });

        it('returns undefined when accountData is undefined', () => {
            expect(getBankAccountState(undefined)).toBeUndefined();
        });
    });

    describe('hasBankAccountAllowDebit', () => {
        it('returns true when accountData allows debit', () => {
            expect(hasBankAccountAllowDebit({allowDebit: true} as AccountData)).toBe(true);
        });

        it('returns false when accountData does not allow debit', () => {
            expect(hasBankAccountAllowDebit({allowDebit: false} as AccountData)).toBe(false);
        });

        it('returns false when accountData is undefined', () => {
            expect(hasBankAccountAllowDebit(undefined)).toBe(false);
        });
    });

    describe('getBankAccountConnectionStatus', () => {
        it('maps OPEN bank accounts to Active without an RBR', () => {
            expect(getBankAccountConnectionStatus(CONST.BANK_ACCOUNT.STATE.OPEN)).toEqual({
                labelKey: 'walletPage.bankAccountStatus.active',
                tone: 'success',
            });
        });

        it('maps SETUP bank accounts to Incomplete with the finish action', () => {
            expect(getBankAccountConnectionStatus(CONST.BANK_ACCOUNT.STATE.SETUP)).toEqual({
                labelKey: 'walletPage.bankAccountStatus.incomplete',
                messageKey: 'walletPage.bankAccountStatus.finishAddingBankAccount',
                actionKey: 'walletPage.bankAccountStatus.finish',
                tone: 'danger',
                brickRoadIndicator: CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR,
            });
        });

        it('maps PENDING bank accounts to Pending with the confirm action', () => {
            expect(getBankAccountConnectionStatus(CONST.BANK_ACCOUNT.STATE.PENDING)).toEqual({
                labelKey: 'walletPage.bankAccountStatus.pending',
                messageKey: 'walletPage.bankAccountStatus.confirmTestTransactions',
                actionKey: 'common.confirm',
                tone: 'danger',
                brickRoadIndicator: CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR,
            });
        });

        it('maps VERIFYING bank accounts to Verifying with only a tooltip', () => {
            expect(getBankAccountConnectionStatus(CONST.BANK_ACCOUNT.STATE.VERIFYING)).toEqual({
                labelKey: 'walletPage.bankAccountStatus.verifying',
                tooltipKey: 'walletPage.bankAccountStatus.reviewingDocumentation',
                tone: 'default',
            });
        });

        it('maps LOCKED bank accounts to Locked with the unlock action', () => {
            expect(getBankAccountConnectionStatus(CONST.BANK_ACCOUNT.STATE.LOCKED)).toEqual({
                labelKey: 'common.locked',
                messageKey: 'walletPage.bankAccountStatus.accountRequiresAttention',
                actionKey: 'walletPage.bankAccountStatus.unlock',
                requiresUnlockHandler: true,
                tone: 'danger',
                brickRoadIndicator: CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR,
            });
        });

        it.each([undefined, '', 'UNKNOWN'])('returns undefined for unsupported state "%s"', (state) => {
            expect(getBankAccountConnectionStatus(state)).toBeUndefined();
        });
    });

    describe('hasPartiallySetupBankAccount', () => {
        it('returns true when at least one account is in SETUP state', () => {
            const bankAccountList = {
                accountOne: {accountData: {state: CONST.BANK_ACCOUNT.STATE.OPEN}, bankCurrency: 'USD', bankCountry: 'US'},
                accountTwo: {accountData: {state: CONST.BANK_ACCOUNT.STATE.SETUP}, bankCurrency: 'USD', bankCountry: 'US'},
            } as unknown as BankAccountList;
            expect(hasPartiallySetupBankAccount(bankAccountList)).toBe(true);
        });

        it('returns true when at least one account is in VERIFYING state', () => {
            const bankAccountList = {
                accountOne: {accountData: {state: CONST.BANK_ACCOUNT.STATE.VERIFYING}, bankCurrency: 'USD', bankCountry: 'US'},
            } as unknown as BankAccountList;
            expect(hasPartiallySetupBankAccount(bankAccountList)).toBe(true);
        });

        it('returns false when all accounts are in OPEN state', () => {
            const bankAccountList = {
                accountOne: {accountData: {state: CONST.BANK_ACCOUNT.STATE.OPEN}, bankCurrency: 'USD', bankCountry: 'US'},
                accountTwo: {accountData: {state: CONST.BANK_ACCOUNT.STATE.OPEN}, bankCurrency: 'USD', bankCountry: 'US'},
            } as unknown as BankAccountList;
            expect(hasPartiallySetupBankAccount(bankAccountList)).toBe(false);
        });

        it('returns false for empty bank account list', () => {
            expect(hasPartiallySetupBankAccount({})).toBe(false);
        });

        it('returns false for null/undefined bank account list', () => {
            expect(hasPartiallySetupBankAccount(undefined)).toBe(false);
        });
    });

    describe('getDefaultCompanyWebsite', () => {
        it('returns website URL from email domain when not public domain', () => {
            const session: Session = {email: 'user@company.com'} as Session;
            const account: Account = {isFromPublicDomain: false} as Account;
            expect(getDefaultCompanyWebsite(session, account)).toBe('https://www.company.com');
        });

        it('returns empty string for public domain when shouldShowPublicDomain is false', () => {
            const session: Session = {email: 'user@gmail.com'} as Session;
            const account: Account = {isFromPublicDomain: true} as Account;
            expect(getDefaultCompanyWebsite(session, account, false)).toBe('');
        });

        it('returns website URL for public domain when shouldShowPublicDomain is true', () => {
            const session: Session = {email: 'user@gmail.com'} as Session;
            const account: Account = {isFromPublicDomain: true} as Account;
            expect(getDefaultCompanyWebsite(session, account, true)).toBe('https://www.gmail.com');
        });

        it('handles undefined session email', () => {
            const session: Session = {} as Session;
            const account: Account = {isFromPublicDomain: false} as Account;
            expect(getDefaultCompanyWebsite(session, account)).toBe('https://www.');
        });

        it('handles undefined session', () => {
            const account: Account = {isFromPublicDomain: false} as Account;
            expect(getDefaultCompanyWebsite(undefined, account)).toBe('https://www.');
        });
    });

    describe('hasPersonalBankAccountMissingInfo', () => {
        it('returns true when at least one account has missing info', () => {
            const bankAccountList = {
                accountOne: {
                    accountData: {
                        type: CONST.BANK_ACCOUNT.TYPE.PERSONAL,
                        state: CONST.BANK_ACCOUNT.STATE.OPEN,
                        additionalData: {country: CONST.COUNTRY.US, firstName: 'John'},
                    },
                    bankCurrency: 'USD',
                    bankCountry: 'US',
                },
            } as unknown as BankAccountList;
            expect(hasPersonalBankAccountMissingInfo(bankAccountList)).toBe(true);
        });

        it('returns false when all accounts have complete info', () => {
            const bankAccountList = {
                accountOne: {
                    accountData: {
                        type: CONST.BANK_ACCOUNT.TYPE.PERSONAL,
                        state: CONST.BANK_ACCOUNT.STATE.OPEN,
                        additionalData: {
                            country: CONST.COUNTRY.US,
                            firstName: 'John',
                            lastName: 'Doe',
                            addressStreet: '123 Main St',
                            addressCity: 'New York',
                            addressState: 'NY',
                            addressZipCode: '10001',
                            companyPhone: '+15551234567',
                        },
                    },
                    bankCurrency: 'USD',
                    bankCountry: 'US',
                },
            } as unknown as BankAccountList;
            expect(hasPersonalBankAccountMissingInfo(bankAccountList)).toBe(false);
        });

        it('returns false for empty bank account list', () => {
            expect(hasPersonalBankAccountMissingInfo({})).toBe(false);
        });

        it('returns false for undefined bank account list', () => {
            expect(hasPersonalBankAccountMissingInfo(undefined)).toBe(false);
        });

        it('returns false when account uses NewDot legalFirstName/legalLastName naming', () => {
            const bankAccountList = {
                accountOne: {
                    accountData: {
                        type: CONST.BANK_ACCOUNT.TYPE.PERSONAL,
                        state: CONST.BANK_ACCOUNT.STATE.OPEN,
                        additionalData: {
                            country: CONST.COUNTRY.US,
                            legalFirstName: 'John',
                            legalLastName: 'Doe',
                            addressStreet: '123 Main St',
                            addressCity: 'New York',
                            addressState: 'NY',
                            addressZipCode: '10001',
                            companyPhone: '+15551234567',
                        },
                    },
                    bankCurrency: 'USD',
                    bankCountry: 'US',
                },
            } as unknown as BankAccountList;
            expect(hasPersonalBankAccountMissingInfo(bankAccountList)).toBe(false);
        });
    });

    describe('getCompletedStepsForBankAccount', () => {
        const bankAccountID = 12345;
        const bankAccountKey = String(bankAccountID);

        const fullAdditionalData = {
            firstName: 'John',
            lastName: 'Doe',
            addressStreet: '123 Main St',
            addressCity: 'New York',
            addressState: 'NY',
            addressZipCode: '10001',
            companyPhone: '+15551234567',
        };

        it('returns all steps when all data is present', () => {
            const bankAccountList = {
                [bankAccountKey]: {accountData: {additionalData: fullAdditionalData}, bankCurrency: 'USD', bankCountry: 'US'},
            } as unknown as BankAccountList;
            const result = getCompletedStepsForBankAccount(bankAccountList, bankAccountID);
            expect(result).toEqual([PERSONAL_INFO_STEP.NAME, PERSONAL_INFO_STEP.ADDRESS, PERSONAL_INFO_STEP.PHONE]);
        });

        it('returns empty array when bank account is not found', () => {
            const bankAccountList = {} as BankAccountList;
            expect(getCompletedStepsForBankAccount(bankAccountList, bankAccountID)).toEqual([]);
        });

        it('returns empty array when bankAccountList is undefined', () => {
            expect(getCompletedStepsForBankAccount(undefined, bankAccountID)).toEqual([]);
        });

        it('returns only NAME step when only name fields are present', () => {
            const bankAccountList = {
                [bankAccountKey]: {accountData: {additionalData: {firstName: 'John', lastName: 'Doe'}}, bankCurrency: 'USD', bankCountry: 'US'},
            } as unknown as BankAccountList;
            expect(getCompletedStepsForBankAccount(bankAccountList, bankAccountID)).toEqual([PERSONAL_INFO_STEP.NAME]);
        });

        it('returns only ADDRESS step when only address fields are present', () => {
            const bankAccountList = {
                [bankAccountKey]: {
                    accountData: {additionalData: {addressStreet: '123 Main St', addressCity: 'New York', addressState: 'NY', addressZipCode: '10001'}},
                    bankCurrency: 'USD',
                    bankCountry: 'US',
                },
            } as unknown as BankAccountList;
            expect(getCompletedStepsForBankAccount(bankAccountList, bankAccountID)).toEqual([PERSONAL_INFO_STEP.ADDRESS]);
        });

        it('returns only PHONE step when only phone is present', () => {
            const bankAccountList = {
                [bankAccountKey]: {accountData: {additionalData: {companyPhone: '+15551234567'}}, bankCurrency: 'USD', bankCountry: 'US'},
            } as unknown as BankAccountList;
            expect(getCompletedStepsForBankAccount(bankAccountList, bankAccountID)).toEqual([PERSONAL_INFO_STEP.PHONE]);
        });

        it('returns empty array when accountData has no additionalData', () => {
            const bankAccountList = {
                [bankAccountKey]: {accountData: {}, bankCurrency: 'USD', bankCountry: 'US'},
            } as unknown as BankAccountList;
            expect(getCompletedStepsForBankAccount(bankAccountList, bankAccountID)).toEqual([]);
        });

        it('does not include NAME when only firstName is present (lastName missing)', () => {
            const bankAccountList = {
                [bankAccountKey]: {accountData: {additionalData: {firstName: 'John'}}, bankCurrency: 'USD', bankCountry: 'US'},
            } as unknown as BankAccountList;
            expect(getCompletedStepsForBankAccount(bankAccountList, bankAccountID)).toEqual([]);
        });

        it('returns multiple steps when some groups are complete', () => {
            const bankAccountList = {
                [bankAccountKey]: {
                    accountData: {additionalData: {firstName: 'John', lastName: 'Doe', companyPhone: '+15551234567'}},
                    bankCurrency: 'USD',
                    bankCountry: 'US',
                },
            } as unknown as BankAccountList;
            expect(getCompletedStepsForBankAccount(bankAccountList, bankAccountID)).toEqual([PERSONAL_INFO_STEP.NAME, PERSONAL_INFO_STEP.PHONE]);
        });

        it('does not include ADDRESS when one address field is missing', () => {
            const bankAccountList = {
                [bankAccountKey]: {
                    accountData: {additionalData: {addressStreet: '123 Main St', addressCity: 'New York', addressState: 'NY'}},
                    bankCurrency: 'USD',
                    bankCountry: 'US',
                },
            } as unknown as BankAccountList;
            expect(getCompletedStepsForBankAccount(bankAccountList, bankAccountID)).toEqual([]);
        });

        it('includes NAME step when only NewDot legalFirstName/legalLastName are present', () => {
            const bankAccountList = {
                [bankAccountKey]: {accountData: {additionalData: {legalFirstName: 'John', legalLastName: 'Doe'}}, bankCurrency: 'USD', bankCountry: 'US'},
            } as unknown as BankAccountList;
            expect(getCompletedStepsForBankAccount(bankAccountList, bankAccountID)).toEqual([PERSONAL_INFO_STEP.NAME]);
        });

        it('does not include NAME when only legalFirstName is present (legalLastName missing)', () => {
            const bankAccountList = {
                [bankAccountKey]: {accountData: {additionalData: {legalFirstName: 'John'}}, bankCurrency: 'USD', bankCountry: 'US'},
            } as unknown as BankAccountList;
            expect(getCompletedStepsForBankAccount(bankAccountList, bankAccountID)).toEqual([]);
        });
    });

    describe('isUserAddressVerificationRequired', () => {
        const qualifier = (key: string) => ({key, message: 'irrelevant'});
        const PASS = CONST.BANK_ACCOUNT.KYB_STATUS.PASS;
        const ADDRESS_KEYS = CONST.BANK_ACCOUNT.KYB_REQUESTOR_IDENTITY_ERROR.ADDRESS;
        const DOB_KEYS = CONST.BANK_ACCOUNT.KYB_REQUESTOR_IDENTITY_ERROR.DOB;
        const SOME_ADDRESS_KEY = ADDRESS_KEYS.at(0) ?? '';

        it('returns false when status is PASS, even with a matching address qualifier', () => {
            expect(isUserAddressVerificationRequired(PASS, [qualifier(SOME_ADDRESS_KEY)])).toBe(false);
        });

        it.each(ADDRESS_KEYS)('returns true for non-pass status when qualifiers contain address key "%s"', (key) => {
            expect(isUserAddressVerificationRequired('fail', [qualifier(key)])).toBe(true);
        });

        it('returns false when status is non-pass but qualifiers only contain an unrelated key', () => {
            expect(isUserAddressVerificationRequired('fail', [qualifier('resultcode.some.unrelated.code')])).toBe(false);
        });

        it('returns false when status is non-pass and qualifiers is undefined', () => {
            expect(isUserAddressVerificationRequired('fail', undefined)).toBe(false);
        });

        it('returns false when status is non-pass and qualifiers is empty', () => {
            expect(isUserAddressVerificationRequired('fail', [])).toBe(false);
        });

        it('returns true when status is undefined and qualifiers contain a matching address key', () => {
            expect(isUserAddressVerificationRequired(undefined, [qualifier(SOME_ADDRESS_KEY)])).toBe(true);
        });

        it.each(DOB_KEYS)('returns false when qualifiers contain only DOB key "%s" (cross-category)', (key) => {
            expect(isUserAddressVerificationRequired('fail', [qualifier(key)])).toBe(false);
        });
    });

    describe('isUserDOBVerificationRequired', () => {
        const qualifier = (key: string) => ({key, message: 'irrelevant'});
        const PASS = CONST.BANK_ACCOUNT.KYB_STATUS.PASS;
        const ADDRESS_KEYS = CONST.BANK_ACCOUNT.KYB_REQUESTOR_IDENTITY_ERROR.ADDRESS;
        const DOB_KEYS = CONST.BANK_ACCOUNT.KYB_REQUESTOR_IDENTITY_ERROR.DOB;
        const SOME_DOB_KEY = DOB_KEYS.at(0) ?? '';

        it('returns false when status is PASS, even with a matching DOB qualifier', () => {
            expect(isUserDOBVerificationRequired(PASS, [qualifier(SOME_DOB_KEY)])).toBe(false);
        });

        it.each(DOB_KEYS)('returns true for non-pass status when qualifiers contain DOB key "%s"', (key) => {
            expect(isUserDOBVerificationRequired('fail', [qualifier(key)])).toBe(true);
        });

        it('returns false when status is non-pass but qualifiers only contain an unrelated key', () => {
            expect(isUserDOBVerificationRequired('fail', [qualifier('resultcode.some.unrelated.code')])).toBe(false);
        });

        it('returns false when status is non-pass and qualifiers is undefined', () => {
            expect(isUserDOBVerificationRequired('fail', undefined)).toBe(false);
        });

        it('returns false when status is non-pass and qualifiers is empty', () => {
            expect(isUserDOBVerificationRequired('fail', [])).toBe(false);
        });

        it('returns true when status is undefined and qualifiers contain a matching DOB key', () => {
            expect(isUserDOBVerificationRequired(undefined, [qualifier(SOME_DOB_KEY)])).toBe(true);
        });

        it.each(ADDRESS_KEYS)('returns false when qualifiers contain only address key "%s" (cross-category)', (key) => {
            expect(isUserDOBVerificationRequired('fail', [qualifier(key)])).toBe(false);
        });
    });

    describe('getRequiredKYBDocuments', () => {
        const PASS = CONST.BANK_ACCOUNT.KYB_STATUS.PASS;
        const ADDRESS_KEY = CONST.BANK_ACCOUNT.KYB_REQUESTOR_IDENTITY_ERROR.ADDRESS.at(0);
        const DOB_KEY = CONST.BANK_ACCOUNT.KYB_REQUESTOR_IDENTITY_ERROR.DOB.at(0);

        const requestorIdentity = (status: string, ...keys: Array<string | undefined>): NonNullable<KYBVerificationResponses>['requestorIdentityID'] => ({
            status,
            apiResult: {
                qualifiers: {
                    qualifier: keys.filter((key): key is string => key !== undefined).map((key) => ({key, message: 'irrelevant'})),
                },
            },
        });

        it('returns an empty array when externalApiResponses is undefined', () => {
            expect(getRequiredKYBDocuments(undefined)).toEqual([]);
        });

        it('returns an empty array when externalApiResponses is empty', () => {
            expect(getRequiredKYBDocuments({})).toEqual([]);
        });

        it('returns an empty array when every check passes', () => {
            const externalApiResponses: KYBVerificationResponses = {
                companyTaxID: {status: PASS},
                lexisNexisInstantIDResult: {status: PASS},
                requestorIdentityID: requestorIdentity(PASS, ADDRESS_KEY, DOB_KEY),
            };
            expect(getRequiredKYBDocuments(externalApiResponses)).toEqual([]);
        });

        it('requires the company tax ID document when the companyTaxID check does not pass', () => {
            expect(getRequiredKYBDocuments({companyTaxID: {status: 'fail'}})).toEqual([INPUT_IDS.KYB_DOCUMENTS.COMPANY_TAX_ID]);
        });

        it('does not require the company tax ID document when the companyTaxID check passes', () => {
            expect(getRequiredKYBDocuments({companyTaxID: {status: PASS}})).toEqual([]);
        });

        it('requires the name change and company address documents when the lexisNexis check does not pass', () => {
            expect(getRequiredKYBDocuments({lexisNexisInstantIDResult: {status: 'fail'}})).toEqual([
                INPUT_IDS.KYB_DOCUMENTS.NAME_CHANGE_DOCUMENT,
                INPUT_IDS.KYB_DOCUMENTS.COMPANY_ADDRESS_VERIFICATION,
            ]);
        });

        it('does not require the lexisNexis documents when the check passes', () => {
            expect(getRequiredKYBDocuments({lexisNexisInstantIDResult: {status: PASS}})).toEqual([]);
        });

        it('requires the user address verification document when a non-passing identity check flags an address error', () => {
            expect(getRequiredKYBDocuments({requestorIdentityID: requestorIdentity('fail', ADDRESS_KEY)})).toEqual([INPUT_IDS.KYB_DOCUMENTS.USER_ADDRESS_VERIFICATION]);
        });

        it('requires the user DOB verification document when a non-passing identity check flags a DOB error', () => {
            expect(getRequiredKYBDocuments({requestorIdentityID: requestorIdentity('fail', DOB_KEY)})).toEqual([INPUT_IDS.KYB_DOCUMENTS.USER_DOB_VERIFICATION]);
        });

        it('requires both user verification documents when the identity check flags address and DOB errors', () => {
            expect(getRequiredKYBDocuments({requestorIdentityID: requestorIdentity('fail', ADDRESS_KEY, DOB_KEY)})).toEqual([
                INPUT_IDS.KYB_DOCUMENTS.USER_ADDRESS_VERIFICATION,
                INPUT_IDS.KYB_DOCUMENTS.USER_DOB_VERIFICATION,
            ]);
        });

        it('does not require user verification documents when a non-passing identity check has only unrelated qualifiers', () => {
            expect(getRequiredKYBDocuments({requestorIdentityID: requestorIdentity('fail', 'resultcode.some.unrelated.code')})).toEqual([]);
        });

        it('aggregates the documents from all failing checks in a stable order', () => {
            const externalApiResponses: KYBVerificationResponses = {
                companyTaxID: {status: 'fail'},
                lexisNexisInstantIDResult: {status: 'fail'},
                requestorIdentityID: requestorIdentity('fail', ADDRESS_KEY, DOB_KEY),
            };
            expect(getRequiredKYBDocuments(externalApiResponses)).toEqual([
                INPUT_IDS.KYB_DOCUMENTS.COMPANY_TAX_ID,
                INPUT_IDS.KYB_DOCUMENTS.NAME_CHANGE_DOCUMENT,
                INPUT_IDS.KYB_DOCUMENTS.COMPANY_ADDRESS_VERIFICATION,
                INPUT_IDS.KYB_DOCUMENTS.USER_ADDRESS_VERIFICATION,
                INPUT_IDS.KYB_DOCUMENTS.USER_DOB_VERIFICATION,
            ]);
        });
    });
});
