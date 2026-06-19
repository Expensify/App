import Onyx from 'react-native-onyx';
import * as MockEventsModule from '@libs/Events/mockEvents';
import {MOCK_EVENTS} from '@libs/Events/mockEvents';
import {fetchEvents, toggleFavoriteEvent} from '@userActions/Events';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Events/mockEvents', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/Events/mockEvents');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        mockFetchEvents: jest.fn(actual.mockFetchEvents),
    };
});

describe('Events actions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('fetchEvents loads mocked events into Onyx', async () => {
        fetchEvents();
        await jest.advanceTimersByTimeAsync(CONST.BOOK_EVENTS.MOCK_FETCH_LATENCY_MS);
        await waitForBatchedUpdates();

        const metadata = await getOnyxValue(ONYXKEYS.EVENTS_FETCH_METADATA);
        expect(metadata).toEqual(
            expect.objectContaining({
                loading: false,
                hasCompletedInitialFetch: true,
            }),
        );
        expect(metadata?.errors).toBeFalsy();

        const firstEvent = await getOnyxValue(`${ONYXKEYS.COLLECTION.EVENT}${MOCK_EVENTS.at(0)?.id}`);
        expect(firstEvent).toEqual(MOCK_EVENTS.at(0));
    });

    test('fetchEvents stores an error when the mock fetch rejects', async () => {
        jest.mocked(MockEventsModule.mockFetchEvents).mockRejectedValueOnce(new Error('Failed to load events'));

        fetchEvents();
        await jest.advanceTimersByTimeAsync(CONST.BOOK_EVENTS.MOCK_FETCH_LATENCY_MS);
        await waitForBatchedUpdates();

        const metadata = await getOnyxValue(ONYXKEYS.EVENTS_FETCH_METADATA);
        expect(metadata).toEqual(
            expect.objectContaining({
                loading: false,
                hasCompletedInitialFetch: true,
            }),
        );
        expect(metadata?.errors).toBeTruthy();
    });

    test('fetchEvents ignores duplicate calls while a fetch is in flight', async () => {
        fetchEvents();
        fetchEvents();

        expect(jest.mocked(MockEventsModule.mockFetchEvents)).toHaveBeenCalledTimes(1);

        await jest.advanceTimersByTimeAsync(CONST.BOOK_EVENTS.MOCK_FETCH_LATENCY_MS);
        await waitForBatchedUpdates();
    });

    test('fetchEvents stores an empty collection when the mock resolves with no events', async () => {
        jest.mocked(MockEventsModule.mockFetchEvents).mockResolvedValueOnce([]);

        fetchEvents();
        await jest.advanceTimersByTimeAsync(CONST.BOOK_EVENTS.MOCK_FETCH_LATENCY_MS);
        await waitForBatchedUpdates();

        const firstEvent = await getOnyxValue(`${ONYXKEYS.COLLECTION.EVENT}${MOCK_EVENTS.at(0)?.id}`);
        expect(firstEvent).toBeUndefined();
    });

    test('toggleFavoriteEvent adds and removes favorites', async () => {
        toggleFavoriteEvent('event-1', false);
        await waitForBatchedUpdates();

        let favorites = await getOnyxValue(ONYXKEYS.FAVORITE_EVENT_IDS);
        expect(favorites?.['event-1']).toBe(true);

        toggleFavoriteEvent('event-1', true);
        await waitForBatchedUpdates();

        favorites = await getOnyxValue(ONYXKEYS.FAVORITE_EVENT_IDS);
        expect(favorites?.['event-1']).toBeUndefined();
    });
});
