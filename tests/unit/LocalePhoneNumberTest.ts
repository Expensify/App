import * as LocalePhoneNumber from '../../src/libs/LocalePhoneNumber';

const ES_NUMBER = '+34702474537';
const ES_CODE = 34;
const US_NUMBER = '+18332403627';
const US_CODE = 1;
const INVALID_NUMBER = '+4818332403627';
const EMAIL_LOGIN = 'user@test.com';

describe('LocalePhoneNumber utils', () => {
    describe('formatPhoneNumber function', () => {
        it('should display a number from the same region formatted locally', () => {
            expect(LocalePhoneNumber.formatPhoneNumber(US_NUMBER, US_CODE)).toBe('(833) 240-3627');
            expect(LocalePhoneNumber.formatPhoneNumber(ES_NUMBER, ES_CODE)).toBe('702 47 45 37');
        });

        it('should display a number from another region formatted internationally', () => {
            expect(LocalePhoneNumber.formatPhoneNumber(US_NUMBER, ES_CODE)).toBe('+1 833-240-3627');
            expect(LocalePhoneNumber.formatPhoneNumber(ES_NUMBER, US_CODE)).toBe('+34 702 47 45 37');
        });

        it('should display a number with a space after the region code if the phone number is not valid', () => {
            expect(LocalePhoneNumber.formatPhoneNumber(INVALID_NUMBER, US_CODE)).toBe('+48 18332403627');
        });

        it('should display unchanged text if the string passed to the function is not a phone number', () => {
            expect(LocalePhoneNumber.formatPhoneNumber(EMAIL_LOGIN, US_CODE)).toBe('user@test.com');
        });
    });
});
