import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../src/ONYXKEYS';
import * as LocalePhoneNumber from '../../src/libs/LocalePhoneNumber';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';

const ES_NUMBER = '+34702474537';
const US_NUMBER = '+18332403627';

describe('LocalePhoneNumber utils', () => {
    beforeAll(() => Onyx.init({
        keys: ONYXKEYS,
    }));

    describe('formatPhoneNumber function - when the current user has a phone number', () => {
        beforeEach(() => Onyx.multiSet({
            [ONYXKEYS.SESSION]: {email: 'current@user.com'},
            [ONYXKEYS.COUNTRY_CODE]: 1,
        }).then(waitForPromisesToResolve));

        afterEach(() => Onyx.clear());

        it('should display a number from the same region formatted locally', () => {
            expect(LocalePhoneNumber.formatPhoneNumber(US_NUMBER)).toBe('(833) 240-3627');
        });

        it('should display a number from another region formatted internationally', () => {
            expect(LocalePhoneNumber.formatPhoneNumber(ES_NUMBER)).toBe('+34 702 47 45 37');
        });
    });
});
