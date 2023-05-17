import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../src/ONYXKEYS';
import * as LocalePhoneNumber from '../../src/libs/LocalePhoneNumber';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';

const ES_NUMBER = '+34702474537';
const US_NUMBER = '+18332403627';
const INVALID_NUMBER = '+4818332403627';
const EMAIL_LOGIN = 'user@test.com';

describe('LocalePhoneNumber utils', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
        }),
    );

    describe('formatPhoneNumber function', () => {
        beforeEach(() =>
            Onyx.multiSet({
                [ONYXKEYS.SESSION]: {email: 'current@user.com'},
                [ONYXKEYS.COUNTRY_CODE]: 1,
            }).then(waitForPromisesToResolve),
        );

        afterEach(() => Onyx.clear());

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
    });
});
