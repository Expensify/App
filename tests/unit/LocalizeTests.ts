 import Onyx from 'react-native-onyx';
import IntlStore from '@src/languages/IntlStore';
import type {TranslationPaths} from '@src/languages/types';
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

    describe('translate method - missing translation behavior', () => {        
        beforeEach(async () => {
            await IntlStore.load(CONST.LOCALES.EN);
        });

        it('should return MISSING_TRANSLATION for missing key with expensify email in production', () => {
            // Mock production environment
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const CONFIG = require('@src/CONFIG');
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const originalConfig = {...CONFIG.default};
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            CONFIG.default.IS_IN_PRODUCTION = true;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            CONFIG.default.IS_IN_STAGING = false;

            const result = Localize.translate(CONST.LOCALES.EN, 'user@expensify.com', 'missing.translation.key' as TranslationPaths);
            
            expect(result).toBe(CONST.MISSING_TRANSLATION);
            
            // Restore original config
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            Object.assign(CONFIG.default, originalConfig);
        });

        it('should return MISSING_TRANSLATION for missing key with expensify email in staging', () => {
            // Mock staging environment  
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const CONFIG = require('@src/CONFIG');
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const originalConfig = {...CONFIG.default};
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            CONFIG.default.IS_IN_PRODUCTION = false;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            CONFIG.default.IS_IN_STAGING = true;

            const result = Localize.translate(CONST.LOCALES.EN, 'test@expensify.com', 'missing.translation.key' as TranslationPaths);
            
            expect(result).toBe(CONST.MISSING_TRANSLATION);
            
            // Restore original config
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            Object.assign(CONFIG.default, originalConfig);
        });

        it('should return key string for missing key with external email in production', () => {
            // Mock production environment
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const CONFIG = require('@src/CONFIG');
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const originalConfig = {...CONFIG.default};
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            CONFIG.default.IS_IN_PRODUCTION = true;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            CONFIG.default.IS_IN_STAGING = false;

            const result = Localize.translate(CONST.LOCALES.EN, 'user@external.com', 'missing.translation.key' as TranslationPaths);
            
            expect(result).toBe('missing.translation.key');
            
            // Restore original config
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            Object.assign(CONFIG.default, originalConfig);
        });

        it('should return key string for missing key with external email in staging', () => {
            // Mock staging environment
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const CONFIG = require('@src/CONFIG');
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const originalConfig = {...CONFIG.default};
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            CONFIG.default.IS_IN_PRODUCTION = false;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            CONFIG.default.IS_IN_STAGING = true;

            const result = Localize.translate(CONST.LOCALES.EN, 'user@external.com', 'missing.translation.key' as TranslationPaths);
            
            expect(result).toBe('missing.translation.key');
            
            // Restore original config
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            Object.assign(CONFIG.default, originalConfig);
        });

        it('should return key string for missing key without email in production', () => {
            // Mock production environment
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const CONFIG = require('@src/CONFIG');
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const originalConfig = {...CONFIG.default};
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            CONFIG.default.IS_IN_PRODUCTION = true;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            CONFIG.default.IS_IN_STAGING = false;

            const result = Localize.translate(CONST.LOCALES.EN, undefined, 'missing.translation.key' as TranslationPaths);
            
            expect(result).toBe('missing.translation.key');
            
            // Restore original config
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            Object.assign(CONFIG.default, originalConfig);
        });
    });
});
