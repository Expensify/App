import Onyx from 'react-native-onyx';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import type {MockFetchEventsOptions} from '@libs/Events/mockEvents';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Event} from '@src/types/onyx';

type EventCollectionUpdate = Record<`${typeof ONYXKEYS.COLLECTION.EVENT}${string}`, Event>;

type MockEventsModule = {
    MOCK_EVENTS: Event[];
    mockFetchEvents: (options?: MockFetchEventsOptions) => Promise<Event[]>;
};

let isFetchInFlight = false;

function eventsToCollection(events: Event[]): EventCollectionUpdate {
    const collection: EventCollectionUpdate = {};
    for (const event of events) {
        collection[`${ONYXKEYS.COLLECTION.EVENT}${event.id}`] = event;
    }
    return collection;
}

function isMockEventsModule(value: unknown): value is MockEventsModule {
    if (!value || typeof value !== 'object') {
        return false;
    }

    if (!('MOCK_EVENTS' in value) || !('mockFetchEvents' in value)) {
        return false;
    }

    return Array.isArray(value.MOCK_EVENTS) && typeof value.mockFetchEvents === 'function';
}

function getMockEventsModule(): MockEventsModule {
    // Read the mock module at fetch time
    const mockEventsModule: unknown = require('@libs/Events/mockEvents');
    if (!isMockEventsModule(mockEventsModule)) {
        throw new Error('Invalid mock events module');
    }
    return mockEventsModule;
}

/**
 * Loads mocked events into Onyx, mirroring the API optimistic/success/failure request shape.
 * Uses setTimeout instead of API.write since there is no real backend.
 */
function fetchEvents() {
    if (isFetchInFlight) {
        return;
    }

    isFetchInFlight = true;
    const {mockFetchEvents} = getMockEventsModule();

    Onyx.merge(ONYXKEYS.EVENTS_FETCH_METADATA, {loading: true, errors: null});

    mockFetchEvents()
        .then((events) => {
            Onyx.setCollection(ONYXKEYS.COLLECTION.EVENT, eventsToCollection(events));
            Onyx.merge(ONYXKEYS.EVENTS_FETCH_METADATA, {
                loading: false,
                errors: null,
                hasCompletedInitialFetch: true,
            });
        })
        .catch(() => {
            Onyx.merge(ONYXKEYS.EVENTS_FETCH_METADATA, {
                loading: false,
                hasCompletedInitialFetch: true,
                errors: getMicroSecondOnyxErrorWithTranslationKey('events.error'),
            });
        })
        .finally(() => {
            isFetchInFlight = false;
        });
}

/**
 * Toggles the favorite state of an event.
 * Optimistic local-only toggle — appropriate since this is purely local/mocked data.
 * Setting to null removes the key from the Onyx map.
 */
function toggleFavoriteEvent(eventID: string, isFavorite: boolean) {
    Onyx.merge(ONYXKEYS.FAVORITE_EVENT_IDS, {[eventID]: isFavorite ? null : true});
}

export {fetchEvents, toggleFavoriteEvent};
