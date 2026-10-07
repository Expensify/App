import IntlStore from '@src/languages/IntlStore';

import Onyx from 'react-native-onyx';

import CONST from '../../src/CONST';
import * as Localize from '../../src/libs/Localize';
import ONYXKEYS from '../../src/ONYXKEYS';
import createRandomReportAction from '../utils/collections/reportActions';
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

    it('adds the unreported-expenses warning only when confirming report deletion', async () => {
        // Given report, expense, and comment actions
        await IntlStore.load(CONST.LOCALES.EN);
        const reportAction = {...createRandomReportAction(1), actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW};
        const expenseAction = {...createRandomReportAction(2), actionName: CONST.REPORT.ACTIONS.TYPE.IOU};
        const commentAction = {...createRandomReportAction(3), actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT};

        // When translating each deletion confirmation
        const reportConfirmation = Localize.translate(CONST.LOCALES.EN, 'reportActionContextMenu.deleteConfirmation', reportAction);
        const expenseConfirmation = Localize.translate(CONST.LOCALES.EN, 'reportActionContextMenu.deleteConfirmation', expenseAction);
        const commentConfirmation = Localize.translate(CONST.LOCALES.EN, 'reportActionContextMenu.deleteConfirmation', commentAction);

        // Then only the report confirmation explains that its expenses become unreported
        expect(reportConfirmation).toContain('All expenses in this report will become unreported.');
        expect(expenseConfirmation).not.toContain('All expenses in this report will become unreported.');
        expect(commentConfirmation).not.toContain('All expenses in this report will become unreported.');
    });

    it('keeps the unreported-expenses warning separate from the generic report confirmation', async () => {
        // Given the generic and expense-report deletion confirmation translations
        await IntlStore.load(CONST.LOCALES.EN);

        // When translating both confirmations
        const genericReportConfirmation = Localize.translate(CONST.LOCALES.EN, 'iou.deleteReportConfirmation', {count: 1});
        const expenseReportConfirmation = Localize.translate(CONST.LOCALES.EN, 'iou.deleteExpenseReportConfirmation');

        // Then only the expense-report confirmation explains that its expenses become unreported
        expect(genericReportConfirmation).not.toContain('All expenses in this report will become unreported.');
        expect(expenseReportConfirmation).toContain('All expenses in this report will become unreported.');
    });
});
