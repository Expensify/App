import sanitizeLogParams, {sanitizeUrlForLogging} from '@libs/sanitizeLogParams';

describe('sanitizeLogParams', () => {
    it('redacts wallet authentication and provisioning material from API logs', () => {
        // Given signed wallet request fields and encrypted provisioning fields can pass through the API logger.
        const params = {
            command: 'CreateDigitalWallet',
            cardID: 123,
            data: {
                signedChallenge: '{"signature":"secret"}',
                nonce: 'nonce',
                nonceSignature: 'signature',
                certificates: '["certificate"]',
                encryptedPassData: 'encrypted',
                activationData: 'activation',
                ephemeralPublicKey: 'ephemeral',
                opaquePaymentCard: 'opaque',
            },
        };
        // When the shared API logging boundary sanitizes these parameters.
        const result = sanitizeLogParams(params);
        // Then secrets are redacted without changing the actual wire input or nonsensitive identifiers.
        expect(result).toEqual({command: 'CreateDigitalWallet', cardID: 123, data: Object.fromEntries(Object.keys(params.data).map((key) => [key, '<redacted>']))});
        expect(params.data.signedChallenge).toBe('{"signature":"secret"}');
    });

    it('redacts known sensitive keys', () => {
        const result = sanitizeLogParams({authToken: 'secret', password: 'hunter2', token: 'abc'});
        expect(result).toEqual({authToken: '<redacted>', password: '<redacted>', token: '<redacted>'});
    });

    it('redacts card number and CVV so payment card details never reach the logs', () => {
        const result = sanitizeLogParams({
            command: 'AddPaymentCard',
            data: {
                cardNumber: '4111111111111111',
                cardCVV: '123',
                cardMonth: '04',
                cardYear: '2030',
                addressZip: '94105',
            },
        });

        expect(result).toEqual({
            command: 'AddPaymentCard',
            data: {
                cardNumber: '<redacted>',
                cardCVV: '<redacted>',
                cardMonth: '04',
                cardYear: '2030',
                addressZip: '94105',
            },
        });
    });

    it('redacts the inputs of a Wise onboarding page, which can hold an SSN', () => {
        // Given the parameters of a page save whose inputs carry an SSN, which the API logs before sending
        const params = {command: 'UpdateWiseOnboardingAdditionalData', step: 'representative', inputs: JSON.stringify({ssn: '123456789'})};

        // When they are sanitized for the logs
        const result = sanitizeLogParams(params);

        // Then the inputs are redacted, so the SSN never reaches the server logs, and the rest stays readable
        expect(result).toEqual({command: 'UpdateWiseOnboardingAdditionalData', step: 'representative', inputs: '<redacted>'});
    });

    it('redacts bank account details and Plaid tokens', () => {
        // Given the parameters of a manual bank account connection, which the API logs before sending
        const params = {
            command: 'ConnectBankAccountManually',
            bankAccountID: 123,
            accountNumber: '9876543210123',
            routingNumber: '011000015',
            plaidAccessToken: 'access-production-token',
            publicToken: 'public-production-token',
            ssnLast4: '6789',
            plaidMask: '0123',
        };

        // When they are sanitized for the logs
        const result = sanitizeLogParams(params);

        // Then the bank details, tokens and SSN digits are redacted, and the rest stays readable
        expect(result).toEqual({
            command: 'ConnectBankAccountManually',
            bankAccountID: 123,
            accountNumber: '<redacted>',
            routingNumber: '<redacted>',
            plaidAccessToken: '<redacted>',
            publicToken: '<redacted>',
            ssnLast4: '<redacted>',
            plaidMask: '0123',
        });
    });

    it('redacts bank details that are sent as JSON strings', () => {
        // Given parameters that carry SSN digits and bank fields inside JSON strings, where key matching can't see them
        const beneficialOwnersParams = {
            command: 'UpdateBeneficialOwnersForBankAccount',
            bankAccountID: 123,
            beneficialOwners: JSON.stringify([{firstName: 'Jane', ssnLast4: '6789'}]),
        };
        const depositAccountParams = {
            command: 'CreateCollectOnlyDepositAccount',
            accountNumber: '9876543210123',
            additionalData: JSON.stringify({country: 'GB', iban: 'GB00TEST00000012345678'}),
        };

        // When they are sanitized for the logs
        const beneficialOwnersResult = sanitizeLogParams(beneficialOwnersParams);
        const depositAccountResult = sanitizeLogParams(depositAccountParams);

        // Then the whole JSON strings are redacted, so the values inside them never reach the logs
        expect(beneficialOwnersResult).toEqual({command: 'UpdateBeneficialOwnersForBankAccount', bankAccountID: 123, beneficialOwners: '<redacted>'});
        expect(depositAccountResult).toEqual({command: 'CreateCollectOnlyDepositAccount', accountNumber: '<redacted>', additionalData: '<redacted>'});
    });

    it('redacts accounting integration credentials', () => {
        // Given the parameters of Sage Intacct and NetSuite connections, which carry the customer's ERP credentials
        const intacctParams = {command: 'ConnectPolicyToSageIntacct', policyID: '1', intacctUserID: 'user', intacctPassword: 'hunter2'};
        const netSuiteParams = {command: 'ConnectPolicyToNetSuite', policyID: '1', netSuiteAccountID: 'account', netSuiteTokenID: 'tokenID', netSuiteTokenSecret: 'tokenSecret'};

        // When they are sanitized for the logs
        const intacctResult = sanitizeLogParams(intacctParams);
        const netSuiteResult = sanitizeLogParams(netSuiteParams);

        // Then the credentials are redacted, and the account identifiers stay readable
        expect(intacctResult).toEqual({command: 'ConnectPolicyToSageIntacct', policyID: '1', intacctUserID: 'user', intacctPassword: '<redacted>'});
        expect(netSuiteResult).toEqual({
            command: 'ConnectPolicyToNetSuite',
            policyID: '1',
            netSuiteAccountID: 'account',
            netSuiteTokenID: '<redacted>',
            netSuiteTokenSecret: '<redacted>',
        });
    });

    it('leaves non-sensitive keys untouched', () => {
        const result = sanitizeLogParams({policyID: '1', currency: 'USD'});
        expect(result).toEqual({policyID: '1', currency: 'USD'});
    });

    it('redacts sensitive keys nested inside arrays', () => {
        const result = sanitizeLogParams({cards: [{cardNumber: '4111111111111111'}, {cardNumber: '5500000000000004'}]});
        expect(result).toEqual({cards: [{cardNumber: '<redacted>'}, {cardNumber: '<redacted>'}]});
    });

    it('stops recursing past the max depth', () => {
        const deep = {a: {b: {c: {d: {e: {f: {cardNumber: '4111111111111111'}}}}}}};
        const result = sanitizeLogParams(deep);

        // Beyond depth 5 the sanitizer returns the object as-is, so the deeply-nested value is not redacted.
        expect(result.a.b.c.d.e.f.cardNumber).toBe('4111111111111111');
    });

    it('returns primitives unchanged', () => {
        expect(sanitizeLogParams('plain string')).toBe('plain string');
        expect(sanitizeLogParams(42)).toBe(42);
        expect(sanitizeLogParams(null)).toBeNull();
    });
});

describe('sanitizeUrlForLogging', () => {
    it('redacts the validate code in /v/:accountID/:validateCode paths', () => {
        expect(sanitizeUrlForLogging('/v/12345/abcdef')).toBe('/v/12345/<redacted>');
    });

    it('redacts the validate code in /u/:accountID/:validateCode paths', () => {
        expect(sanitizeUrlForLogging('/u/12345/abcdef')).toBe('/u/12345/<redacted>');
    });

    it('strips the query string', () => {
        expect(sanitizeUrlForLogging('https://example.com/path?authToken=secret')).toBe('https://example.com/path?<redacted>');
    });
});
