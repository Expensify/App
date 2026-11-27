import getInsightsDetailsPeriodName from '@pages/Insights/details/getInsightsDetailsPeriodName';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';

import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('getInsightsDetailsPeriodName', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    it.each([
        [CONST.SEARCH.GROUP_BY.DAY, '2026-10-03', false, 'Oct 3'],
        [CONST.SEARCH.GROUP_BY.WEEK, '2026-09-28', false, 'Week of Sep 28'],
        [CONST.SEARCH.GROUP_BY.MONTH, '2026-09-01', false, 'September'],
        [CONST.SEARCH.GROUP_BY.MONTH, '2025-12-01', true, 'December 2025'],
        [CONST.SEARCH.GROUP_BY.QUARTER, '2025-10-01', true, 'Q4 2025'],
    ] as const)('names a %s starting on %s', (groupBy, start, shouldIncludeYear, expected) => {
        // Given a period, and whether it falls outside the current year
        // When its name is formatted
        const name = getInsightsDetailsPeriodName(groupBy, start, shouldIncludeYear, undefined, translateLocal);

        // Then it reads like the rest of Insights, with the year only when it isn't the current one
        expect(name).toBe(expected);
    });
});
