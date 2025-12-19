import Onyx from 'react-native-onyx';
import IntlStore from '@src/languages/IntlStore';
import type {TranslationPaths} from '@src/languages/types';
import CONST from '../../src/CONST';
import * as Localize from '../../src/libs/Localize';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type EnvironmentConfig = {
    isProduction: boolean;
    isStaging: boolean;
};

type SessionEmail = string | null;

jest.mock('@src/libs/Log');

function mockEnvironmentConfig(config: EnvironmentConfig): () => void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const CONFIG = require('@src/CONFIG');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const originalConfig = {...CONFIG.default};

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    CONFIG.default.IS_IN_PRODUCTION = config.isProduction;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    CONFIG.default.IS_IN_STAGING = config.isStaging;

    // Return cleanup function
    return () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        Object.assign(CONFIG.default, originalConfig);
    };
}

async function setupSession(email: SessionEmail): Promise<void> {
    await Onyx.merge(ONYXKEYS.SESSION, email ? {email} : null);
    await waitForBatchedUpdates();
}

async function testMissingTranslationBehavior(environmentConfig: EnvironmentConfig, sessionEmail: SessionEmail, expectedResult: string): Promise<void> {
    const cleanup = mockEnvironmentConfig(environmentConfig);

    try {
        await setupSession(sessionEmail);

        const result = Localize.translate(CONST.LOCALES.EN, 'missing.translation.key' as TranslationPaths);
        expect(result).toBe(expectedResult);
    } finally {
        cleanup();
    }
}

describe('localize', () => {
    beforeAll(() => {
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

        test.each([
            // [description, environment, sessionEmail, expectedResult]
            [
                'should return MISSING_TRANSLATION for missing key when user has expensify email in production environment',
                {isProduction: true, isStaging: false},
                'user@expensify.com',
                CONST.MISSING_TRANSLATION,
            ],
            [
                'should return MISSING_TRANSLATION for missing key when user has expensify email in staging environment',
                {isProduction: false, isStaging: true},
                'test@expensify.com',
                CONST.MISSING_TRANSLATION,
            ],
            [
                'should return key string for missing key when user has external email in production environment',
                {isProduction: true, isStaging: false},
                'user@external.com',
                'missing.translation.key',
            ],
            [
                'should return key string for missing key when user has external email in staging environment',
                {isProduction: false, isStaging: true},
                'user@external.com',
                'missing.translation.key',
            ],
            ['should return key string for missing key when user has no email in production environment', {isProduction: true, isStaging: false}, null, 'missing.translation.key'],
        ])('%s', async (description, environmentConfig, sessionEmail, expectedResult) => {
            await testMissingTranslationBehavior(environmentConfig, sessionEmail, expectedResult);
        });
    });
});
