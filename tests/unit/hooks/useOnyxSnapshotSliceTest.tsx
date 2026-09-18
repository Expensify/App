import {act, render} from '@testing-library/react-native';

import {SearchQueryContext} from '@components/Search/SearchContextDefinitions';
import {SearchScopeProvider} from '@components/Search/SearchScopeProvider';
import type {SearchQueryContextValue} from '@components/Search/types';

import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const HASH = 42;
const SNAPSHOT_KEY = `${ONYXKEYS.COLLECTION.SNAPSHOT}${HASH}` as const;
const REPORT_1_KEY = `${ONYXKEYS.COLLECTION.REPORT}1` as const;
const REPORT_2_KEY = `${ONYXKEYS.COLLECTION.REPORT}2` as const;

const queryContextValue: SearchQueryContextValue = {
    currentSearchHash: HASH,
    currentSimilarSearchHash: HASH,
    currentSearchKey: undefined,
    currentSearchQueryJSON: undefined,
    currentDefaultSearchQueryJSON: undefined,
    currentDefaultSearchQueryFilterKeys: new Set(),
    suggestedSearches: getEmptyObject<SearchQueryContextValue['suggestedSearches']>(),
    shouldResetSearchQuery: false,
    shouldUseLiveData: false,
};

const seenTotals: Array<number | undefined> = [];

/** Stands in for a Search row that reads its own report through the snapshot-aware `useOnyx`. */
function ReportReader() {
    const [report] = useOnyx(REPORT_1_KEY);
    seenTotals.push(report?.total);
    return null;
}

function renderReader() {
    return render(
        <SearchScopeProvider>
            <SearchQueryContext value={queryContextValue}>
                <ReportReader />
            </SearchQueryContext>
        </SearchScopeProvider>,
    );
}

/**
 * Inside Search, `useOnyx` routes snapshot-compatible keys into the search snapshot. Every reader used to subscribe to
 * the whole snapshot and extract its key afterwards, so any write to the snapshot re-rendered every row. The read has to
 * follow the key's own slice instead.
 */
describe('useOnyx snapshot-routed reads', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        seenTotals.length = 0;
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(SNAPSHOT_KEY, {data: {[REPORT_1_KEY]: {reportID: '1', total: 10}, [REPORT_2_KEY]: {reportID: '2', total: 20}}, search: {}});
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('reads the key out of the snapshot', async () => {
        renderReader();
        await waitForBatchedUpdatesWithAct();

        expect(seenTotals.at(-1)).toBe(10);
    });

    it('does not re-render when another key in the snapshot changes', async () => {
        renderReader();
        await waitForBatchedUpdatesWithAct();
        const rendersBefore = seenTotals.length;

        await act(async () => {
            await Onyx.merge(SNAPSHOT_KEY, {data: {[REPORT_2_KEY]: {total: 25}}});
            await waitForBatchedUpdatesWithAct();
        });

        expect(seenTotals.length).toBe(rendersBefore);
    });

    it('re-renders with the new value when its own key changes', async () => {
        renderReader();
        await waitForBatchedUpdatesWithAct();
        const rendersBefore = seenTotals.length;

        await act(async () => {
            await Onyx.merge(SNAPSHOT_KEY, {data: {[REPORT_1_KEY]: {total: 15}}});
            await waitForBatchedUpdatesWithAct();
        });

        expect(seenTotals.length).toBeGreaterThan(rendersBefore);
        expect(seenTotals.at(-1)).toBe(15);
    });
});
