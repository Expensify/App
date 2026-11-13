import IntlStore from '@src/languages/IntlStore';

import Onyx from 'react-native-onyx';

import CONST from '../../src/CONST';
import * as Localize from '../../src/libs/Localize';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type EnvironmentConfig = {
    isProduction: boolean;
    isStaging: boolean;
};

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

async function testMissingTranslationBehavior(environmentConfig: EnvironmentConfig, expectedResult: string): Promise<void> {
    const cleanup = mockEnvironmentConfig(environmentConfig);

    try {
        // @ts-expect-error This scenario intentionally exercises runtime handling of a key absent from TranslationPaths.
        const result = Localize.translate(CONST.LOCALES.EN, 'missing.translation.key');
        expect(result).toBe(expectedResult);
    } finally {
        cleanup();
    }
}

describe('localize', () => {
    beforeAll(() => {
        Onyx.init({
            keys: {
                NVP_PREFERRED_LOCALE: ONYXKEYS.NVP_PREFERRED_LOCALE,
                ARE_TRANSLATIONS_LOADING: ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING,
                SESSION: ONYXKEYS.SESSION,
            },
        });
        return waitForBatchedUpdates();
    });

    afterEach(() => Onyx.clear());

    it.each([
        [1, 'pokaż 1 aktualizację'],
        [2, 'pokaż 2 aktualizacje'],
        [12, 'pokaż 12 aktualizacji'],
        [22, 'pokaż 22 aktualizacje'],
    ])('uses Polish plural categories for %s collapsed updates', async (count, expected) => {
        // Given the Polish locale loaded through the real localization store
        await IntlStore.load(CONST.LOCALES.PL);
        // When the summary is translated, its plural handler receives a numeric count
        const message = Localize.translate(CONST.LOCALES.PL, 'report.collapsedSystemMessages', {count});
        // Then few and many forms are selected without a handwritten modulo expression
        expect(message).toBe(expected);
    });

    // Localized fixtures intentionally contain words outside the English spelling dictionary.
    // cspell:disable
    describe.each([
        [CONST.LOCALES.EN, 'in two weeks', 'in one week', 'soon'],
        [CONST.LOCALES.DE, 'in zwei Wochen', 'in einer Woche', 'bald'],
        [CONST.LOCALES.EL, 'σε δύο εβδομάδες', 'σε μία εβδομάδα', 'σύντομα'],
        [CONST.LOCALES.ES, 'en dos semanas', 'en una semana', 'pronto'],
        [CONST.LOCALES.FR, 'dans deux semaines', 'dans une semaine', 'bientôt'],
        [CONST.LOCALES.IT, 'tra due settimane', 'tra una settimana', 'presto'],
        [CONST.LOCALES.JA, '2週間後', '1週間後', 'まもなく'],
        [CONST.LOCALES.NL, 'over twee weken', 'over een week', 'binnenkort'],
        [CONST.LOCALES.PL, 'za dwa tygodnie', 'za tydzień', 'wkrótce'],
        [CONST.LOCALES.PT_BR, 'em duas semanas', 'em uma semana', 'em breve'],
        [CONST.LOCALES.ZH_HANS, '两周后', '一周后', '即将'],
    ] as const)('company card consent warning in %s', (locale, twoWeeks, oneWeek, soon) => {
        // cspell:enable
        it.each([
            [14, twoWeeks],
            [7, oneWeek],
            [1, soon],
        ])('preserves the localized warning for %s days', async (warningDaysBeforeExpiry, expectedTime) => {
            // Given a loaded locale and a server-provided warning interval
            await IntlStore.load(locale);

            // When the consent warning is translated
            const message = Localize.translate(locale, 'report.actions.type.companyCardConsentExpiring', {
                feedName: 'American Express Business',
                warningDaysBeforeExpiry,
                workspaceCompanyCardRoute: '',
            });

            // Then the existing localized interval and unlinked fallback are preserved
            expect(message).toContain(expectedTime);
            expect(message).toContain('<strong>American Express Business</strong>');
            expect(message).not.toContain('<a ');
        });
    });

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
            // [description, environment, expectedResult]
            ['should return key string for missing key when user is in production environment', {isProduction: true, isStaging: false}, 'missing.translation.key'],
            ['should return key string for missing key when user is in staging environment', {isProduction: false, isStaging: true}, 'missing.translation.key'],
        ])('%s', async (description, environmentConfig, expectedResult) => {
            await testMissingTranslationBehavior(environmentConfig, expectedResult);
        });
    });
});
