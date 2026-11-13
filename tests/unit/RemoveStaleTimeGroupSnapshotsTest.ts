import RemoveStaleTimeGroupSnapshots from '@libs/migrations/RemoveStaleTimeGroupSnapshots';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const GROUP_KEY = 'group_month_1_year_2026';

describe('RemoveStaleTimeGroupSnapshots', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));
    beforeEach(() => Onyx.clear().then(waitForBatchedUpdates));

    it.each([
        ['type:expense groupBy:month submitted:this-year', true],
        ['type:expense groupBy:week anyApproval:this-year has:approved-violation', true],
        ['type:expense groupBy:month date:this-year submitted:this-year', false],
        ['type:expense groupBy:month -submitted:this-year', false],
        ['type:expense groupBy:from submitted:this-year', false],
    ])('removes only changed time grouping for %s', async (inputQuery, shouldRemove) => {
        // Given a cached query whose buckets may have been grouped by the old expense-date rule
        const key = `${ONYXKEYS.COLLECTION.SNAPSHOT}111` as const;
        await Onyx.merge(key, {search: {hash: 111, inputQuery}, data: {}});

        // When the migration runs
        await RemoveStaleTimeGroupSnapshots();
        await waitForBatchedUpdates();

        // Then affected action/report-date groups are removed, while explicit expense dates and other groups survive
        expect((await getOnyxValue(key)) === undefined).toBe(shouldRemove);
    });

    it('removes unidentified legacy time buckets once without clearing newly loaded data', async () => {
        // Given an Insights time snapshot with no query metadata
        const key = `${ONYXKEYS.COLLECTION.SNAPSHOT}222` as const;
        const value = {search: {hash: 222}, data: {[GROUP_KEY]: {month: 1, year: 2026, count: 1, total: 100, currency: 'USD'}}};
        await Onyx.merge(key, value);

        // When cleanup removes it and the same query later fetches fresh buckets
        await RemoveStaleTimeGroupSnapshots();
        expect(await getOnyxValue(key)).toBeUndefined();
        await Onyx.merge(key, value);
        await RemoveStaleTimeGroupSnapshots();
        await waitForBatchedUpdates();

        // Then the completion marker prevents deleting fresh data on another launch
        expect(await getOnyxValue(key)).toEqual(value);
        expect(await getOnyxValue(ONYXKEYS.SEARCH_TIME_GROUPING_MIGRATED)).toBe(true);
    });
});
