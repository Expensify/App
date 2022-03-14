const wallet = require('../../src/libs/actions/Wallet');

describe('Wallet', () => {
    it('Test buildIdologyError returning the right error copy based on Idology errors passed', () => {
        // Test address error
        expect(wallet.buildIdologyError(['resultcode.address.does.not.match'])).toBe('We could not verify your personal address. Please fix this information before continuing.');

        // Test date of birth error
        expect(wallet.buildIdologyError(['resultcode.age.below.minimum'])).toBe('We could not verify your date of birth. Please fix this information before continuing.');

        // Test SSN error
        expect(wallet.buildIdologyError(['resultcode.ssn.does.not.match'])).toBe('We could not verify your SSN. Please fix this information before continuing.');

        // Test lastName error
        expect(wallet.buildIdologyError(['resultcode.last.name.does.not.match'])).toBe('We could not verify your legal last name. Please fix this information before continuing.');

        // Test multiple errors
        expect(wallet.buildIdologyError([
            'resultcode.zip.does.not.match',
            'resultcode.yob.within.one.year',
            'resultcode.ssn.not.valid',
        ])).toBe('We could not verify your personal address, your date of birth and your SSN. Please fix this information before continuing.');

        // Test unknown errors
        expect(wallet.buildIdologyError([
            'whatever1',
            'whatever2',
        ])).toBe('');
    });
});
