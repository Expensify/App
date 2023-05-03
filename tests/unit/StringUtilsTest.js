import Onyx from 'react-native-onyx';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import CONST from '../../src/CONST';
import ONYXKEYS from '../../src/ONYXKEYS';
import StringUtils from '../../src/libs/StringUtils';

describe('StringUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: {NVP_PREFERRED_LOCALE: ONYXKEYS.NVP_PREFERRED_LOCALE},
            initialKeyStates: {[ONYXKEYS.NVP_PREFERRED_LOCALE]: CONST.LOCALES.DEFAULT},
        });
        return waitForPromisesToResolve();
    });

    afterEach(() => Onyx.clear());

    describe('arrayToSpokenList', () => {
        test.each([
            [[], {
                [CONST.LOCALES.DEFAULT]: '',
                [CONST.LOCALES.ES]: '',
            }],
            [['rory'], {
                [CONST.LOCALES.DEFAULT]: 'rory',
                [CONST.LOCALES.ES]: 'rory',
            }],
            [['rory', 'vit'], {
                [CONST.LOCALES.DEFAULT]: 'rory and vit',
                [CONST.LOCALES.ES]: 'rory y vit',
            }],
            [['rory', 'vit', 'jules'], {
                [CONST.LOCALES.DEFAULT]: 'rory, vit, and jules',
                [CONST.LOCALES.ES]: 'rory, vit y jules',
            }],
            [['rory', 'vit', 'ionatan'], {
                [CONST.LOCALES.DEFAULT]: 'rory, vit, and ionatan',
                [CONST.LOCALES.ES]: 'rory, vit e ionatan',
            }],
        ])('arrayToSpokenList(%s)', (input, {
            [CONST.LOCALES.DEFAULT]: expectedOutput,
            [CONST.LOCALES.ES]: expectedOutputES,
        }) => {
            expect(StringUtils.arrayToSpokenList(input)).toBe(expectedOutput);
            return Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.ES)
                .then(() => expect(StringUtils.arrayToSpokenList(input)).toBe(expectedOutputES));
        });
    });
});
