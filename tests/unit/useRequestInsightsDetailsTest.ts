import {renderHook} from '@testing-library/react-native';

import {getInsightsDetails} from '@libs/actions/Insights';

import type {InsightsDetailsQuery} from '@pages/Insights/details/buildInsightsDetailsQuery';
import useRequestInsightsDetails from '@pages/Insights/details/useRequestInsightsDetails';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

let mockIsOffline = false;
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: mockIsOffline})));
let mockIsFocused = true;
jest.mock('@react-navigation/native', () => ({...jest.requireActual<Record<string, unknown>>('@react-navigation/native'), useIsFocused: () => mockIsFocused}));
jest.mock('@libs/actions/Insights', () => ({...jest.requireActual<Record<string, unknown>>('@libs/actions/Insights'), getInsightsDetails: jest.fn()}));

/** Builds a Details request stored under the given hashes. */
function buildDetailsQuery(hash: number, topExpensesSnapshotHash: number): InsightsDetailsQuery {
    return {
        jsonQuery: JSON.stringify({hash}),
        hash,
        topExpensesSnapshotHash,
        period: {start: '2026-01-01', end: '2026-03-31'},
        periodGroupBy: CONST.SEARCH.GROUP_BY.QUARTER,
        isPeriodInProgress: false,
    };
}

const QUERY = buildDetailsQuery(1, 10);
const OTHER_QUERY = buildDetailsQuery(2, 20);

function renderRequest(query: InsightsDetailsQuery | undefined) {
    return renderHook((props: {query: InsightsDetailsQuery | undefined}) => useRequestInsightsDetails(props.query), {initialProps: {query}});
}

describe('useRequestInsightsDetails', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(() => {
        mockIsOffline = false;
        mockIsFocused = true;
        jest.clearAllMocks();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('requests the panel with its Top expenses snapshot when it mounts', async () => {
        // Given the Details request of a clicked chart item
        // When the panel mounts
        renderRequest(QUERY);
        await waitForBatchedUpdatesWithAct();

        // Then it requests once, naming the snapshot the response fills with the Top expenses
        expect(getInsightsDetails).toHaveBeenCalledTimes(1);
        expect(getInsightsDetails).toHaveBeenCalledWith(QUERY.hash, QUERY.jsonQuery, QUERY.topExpensesSnapshotHash);
    });

    it('requests again when the query changes', async () => {
        // Given a panel that already requested its query
        const {rerender} = renderRequest(QUERY);
        await waitForBatchedUpdatesWithAct();

        // When the item or date range changes the query
        rerender({query: OTHER_QUERY});
        await waitForBatchedUpdatesWithAct();

        // Then it requests the new query, so the sections follow what the panel shows
        expect(getInsightsDetails).toHaveBeenCalledTimes(2);
        expect(getInsightsDetails).toHaveBeenLastCalledWith(OTHER_QUERY.hash, OTHER_QUERY.jsonQuery, OTHER_QUERY.topExpensesSnapshotHash);
    });

    it('waits for the network while offline and requests once back online', async () => {
        // Given a panel opened offline
        mockIsOffline = true;
        const {rerender} = renderRequest(QUERY);
        await waitForBatchedUpdatesWithAct();

        // Then it sends nothing, since the request would only fail
        expect(getInsightsDetails).not.toHaveBeenCalled();

        // When the device comes back online
        mockIsOffline = false;
        rerender({query: QUERY});
        await waitForBatchedUpdatesWithAct();

        // Then it requests the panel without the user having to retry
        expect(getInsightsDetails).toHaveBeenCalledTimes(1);
    });

    it('requests nothing when the panel regains focus without an expense change', async () => {
        // Given a panel that requested its query and lost focus to an expense opened from it
        const {rerender} = renderRequest(QUERY);
        await waitForBatchedUpdatesWithAct();
        mockIsFocused = false;
        rerender({query: QUERY});
        await waitForBatchedUpdatesWithAct();

        // When the user goes back without changing anything
        mockIsFocused = true;
        rerender({query: QUERY});
        await waitForBatchedUpdatesWithAct();

        // Then it doesn't request again, since the stored sections are still current
        expect(getInsightsDetails).toHaveBeenCalledTimes(1);
    });

    it('requests again once visible after an expense changed behind it', async () => {
        // Given a panel that requested its query and lost focus to an expense opened from it
        const {rerender} = renderRequest(QUERY);
        await waitForBatchedUpdatesWithAct();
        mockIsFocused = false;
        rerender({query: QUERY});
        await waitForBatchedUpdatesWithAct();

        // When the expense is edited while the panel is hidden
        await Onyx.set(ONYXKEYS.DERIVED.SPEND_DATA_SIGNATURE, {expenses: 1, cardExpenses: 0});
        await waitForBatchedUpdatesWithAct();

        // Then it waits, since nobody sees the panel
        expect(getInsightsDetails).toHaveBeenCalledTimes(1);

        // When the user goes back
        mockIsFocused = true;
        rerender({query: QUERY});
        await waitForBatchedUpdatesWithAct();

        // Then it requests again, so an edit that moved the expense out of the item updates both sections
        expect(getInsightsDetails).toHaveBeenCalledTimes(2);
    });

    it('requests nothing without a query', async () => {
        // Given a panel whose period has not resolved yet
        const {result} = renderRequest(undefined);
        await waitForBatchedUpdatesWithAct();

        // When the user retries
        result.current();

        // Then nothing is sent, since there is nothing to ask for
        expect(getInsightsDetails).not.toHaveBeenCalled();
    });
});
