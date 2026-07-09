import * as LocalePhoneNumber from '../../src/libs/LocalePhoneNumber';

const ES_NUMBER = '+34702474537';
const US_NUMBER = '+18332403627';
const INVALID_NUMBER = '+4818332403627';
const EMAIL_LOGIN = 'user@test.com';
const US_NUMBER_WITH_SMS_DOMAIN = '+15857527441@expensify.sms';
const ES_NUMBER_WITH_SMS_DOMAIN = '+34702474537@expensify.sms';

describe('LocalePhoneNumber utils', () => {
    beforeEach(() => {
        LocalePhoneNumber.setCountryCodeByIP(1);
    });

    describe('formatPhoneNumber function', () => {
        it('should display a number from the same region formatted locally', () => {
            expect(LocalePhoneNumber.formatPhoneNumber(US_NUMBER)).toBe('(833) 240-3627');
        });

        it('should display a number from another region formatted internationally', () => {
            expect(LocalePhoneNumber.formatPhoneNumber(ES_NUMBER)).toBe('+34 702 47 45 37');
        });

        it('should display a number with a space after the region code if the phone number is not valid', () => {
            expect(LocalePhoneNumber.formatPhoneNumber(INVALID_NUMBER)).toBe('+48 18332403627');
        });

        it('should display unchanged text if the string passed to the function is not a phone number', () => {
            expect(LocalePhoneNumber.formatPhoneNumber(EMAIL_LOGIN)).toBe('user@test.com');
        });

        it('should strip @expensify.sms domain and format a US number locally', () => {
            expect(LocalePhoneNumber.formatPhoneNumber(US_NUMBER_WITH_SMS_DOMAIN)).toBe('(585) 752-7441');
        });

        it('should strip @expensify.sms domain and format a foreign number internationally', () => {
            expect(LocalePhoneNumber.formatPhoneNumber(ES_NUMBER_WITH_SMS_DOMAIN)).toBe('+34 702 47 45 37');
        });

        it('should use the synced country code when formatting locally', () => {
            LocalePhoneNumber.setCountryCodeByIP(34);

            expect(LocalePhoneNumber.formatPhoneNumber(ES_NUMBER)).toBe('702 47 45 37');
        });
    });

    describe('formatPhoneNumberWithCountryCode function', () => {
        it('should format a number from the same region locally', () => {
            expect(LocalePhoneNumber.formatPhoneNumberWithCountryCode(US_NUMBER, 1)).toBe('(833) 240-3627');
        });

        it('should format a number from another region internationally', () => {
            expect(LocalePhoneNumber.formatPhoneNumberWithCountryCode(ES_NUMBER, 1)).toBe('+34 702 47 45 37');
        });
    });
});
