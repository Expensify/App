import {act, render} from '@testing-library/react-native';

import useMultipleSnapshots from '@hooks/useMultipleSnapshots';
import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const HASH = '42';

/** Stable, the way `useSearchSnapshot` memoizes the hashes it subscribes to. */
const HASHES = [HASH];

const SNAPSHOT_KEY = `${ONYXKEYS.COLLECTION.SNAPSHOT}${HASH}` as const;

const renders: Array<{fromParent: boolean; ofItsOwn: boolean}> = [];

/** Stands in for an expanded group row, which reads its own sub-snapshot rather than the enriched rows it is handed. */
function Row({fromParent}: {fromParent: boolean}) {
    const [ownSnapshot] = useOnyx(SNAPSHOT_KEY);
    renders.push({fromParent, ofItsOwn: !!ownSnapshot});
    return null;
}

/** Stands in for `useSearchSnapshot`, which subscribes to the whole collection and enriches each group's rows from it. */
function List() {
    const snapshots = useMultipleSnapshots(HASHES);
    return <Row fromParent={!!snapshots[HASH]} />;
}

/**
 * `useSearchSnapshot` subscribes to the whole snapshot collection and writes each group's rows onto `group.transactions`.
 * The components that render those rows used to derive them from the group's own sub-snapshot instead. Reading the list's
 * copy is only safe if the two land in the same commit, so this records every render of both. It pins Onyx's delivery,
 * which is that premise, rather than the enrichment itself.
 */
describe('sub-snapshot subscriptions', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        renders.length = 0;
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('reaches the row and the list it is rendered by in the same commit, so neither can range over rows the other cannot see', async () => {
        render(<List />);

        await act(async () => {
            await Onyx.merge(SNAPSHOT_KEY, {search: {hash: Number(HASH)}});
            await waitForBatchedUpdatesWithAct();
        });

        expect(renders.at(-1)).toEqual({fromParent: true, ofItsOwn: true});
        // The claim under test: no commit ever showed the row holding rows its list had not been given, or the reverse.
        expect(renders.filter((commit) => commit.fromParent !== commit.ofItsOwn)).toEqual([]);
    });

    it('leaves both in the same commit, so a range cannot outlive the rows on screen', async () => {
        await act(async () => {
            await Onyx.merge(SNAPSHOT_KEY, {search: {hash: Number(HASH)}});
            await waitForBatchedUpdatesWithAct();
        });
        renders.length = 0;
        render(<List />);

        await act(async () => {
            await Onyx.set(SNAPSHOT_KEY, null);
            await waitForBatchedUpdatesWithAct();
        });

        expect(renders.at(-1)).toEqual({fromParent: false, ofItsOwn: false});
        expect(renders.filter((commit) => commit.fromParent !== commit.ofItsOwn)).toEqual([]);
    });
});
