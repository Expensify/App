import Onyx from 'react-native-onyx';
import IntlStore from '@src/languages/IntlStore';
import CONST from '../../src/CONST';
import * as Localize from '../../src/libs/Localize';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('localize', () => {
    beforeAll(() => {
        Onyx.init({
            keys: {
                NVP_PREFERRED_LOCALE: ONYXKEYS.NVP_PREFERRED_LOCALE,
                ARE_TRANSLATIONS_LOADING: ONYXKEYS.ARE_TRANSLATIONS_LOADING,
            },
        });
        return waitForBatchedUpdates();
    });

    afterEach(() => Onyx.clear());

    describe('formatList', () => {
        test.each([
            [
                [],
                {
                    [CONST.LOCALES.DEFAULT]: '',
                    [CONST.LOCALES.ES]: '',
                },
            ],
            [
                ['rory'],
                {
                    [CONST.LOCALES.DEFAULT]: 'rory',
                    [CONST.LOCALES.ES]: 'rory',
                },
            ],
            [
                ['rory', 'vit'],
                {
                    [CONST.LOCALES.DEFAULT]: 'rory and vit',
                    [CONST.LOCALES.ES]: 'rory y vit',
                },
            ],
            [
                ['rory', 'vit', 'jules'],
                {
                    [CONST.LOCALES.DEFAULT]: 'rory, vit, and jules',
                    [CONST.LOCALES.ES]: 'rory, vit y jules',
                },
            ],
            [
                ['rory', 'vit', 'ionatan'],
                {
                    [CONST.LOCALES.DEFAULT]: 'rory, vit, and ionatan',
                    [CONST.LOCALES.ES]: 'rory, vit e ionatan',
                },
            ],
        ])('formatList(%s)', async (input, {[CONST.LOCALES.DEFAULT]: expectedOutput, [CONST.LOCALES.ES]: expectedOutputES}) => {
            await IntlStore.load(CONST.LOCALES.EN);
            expect(Localize.formatList(input)).toBe(expectedOutput);
            await IntlStore.load(CONST.LOCALES.ES);
            expect(Localize.formatList(input)).toBe(expectedOutputES);
        });
    });
});
