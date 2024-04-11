import Onyx from 'react-native-onyx';
import localeCompare from '@libs/LocaleCompare';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('localeCompare', () => {
    beforeAll(() => {
        Onyx.init({
            keys: {NVP_PREFERRED_LOCALE: ONYXKEYS.NVP_PREFERRED_LOCALE},
            initialKeyStates: {[ONYXKEYS.NVP_PREFERRED_LOCALE]: CONST.LOCALES.DEFAULT},
        });
        return waitForBatchedUpdates();
    });

    afterEach(() => Onyx.clear());

    it('should return -1 for descending comparison', () => {
        const result = localeCompare('Da Vinci', 'Tesla');

        expect(result).toBe(-1);
    });

    it('should return -1 for ascending comparison', () => {
        const result = localeCompare('Zidane', 'Messi');

        expect(result).toBe(1);
    });

    it('should return 0 for equal strings', () => {
        const result = localeCompare('Cat', 'Cat');

        expect(result).toBe(0);
    });

    it('should discard sensitivity differences', () => {
        const result = localeCompare('apple', 'Apple');

        expect(result).toBe(0);
    });

    it('distinguishes spanish diacritic characters', async () => {
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.ES);

        const input = ['zorro', 'árbol', 'jalapeño', 'jalapeno', 'nino', 'niño'];

        input.sort(localeCompare);

        expect(input).toEqual(['árbol', 'jalapeno', 'jalapeño', 'nino', 'niño', 'zorro']);
    });
});
