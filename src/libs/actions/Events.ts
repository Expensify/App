import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Event} from '@src/types/onyx/Event';

const MOCK_EVENTS: Event[] = [
    {
        id: '1',
        name: 'Tech Conference 2024',
        startDate: '2024-06-15',
        endDate: '2024-06-17',
        thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60',
        isFavorite: false,
    },
    {
        id: '2',
        name: 'Business Networking Event',
        startDate: '2024-07-01',
        thumbnail: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&auto=format&fit=crop&q=60',
        isFavorite: false,
    },
    {
        id: '3',
        name: 'Annual Company Retreat',
        startDate: '2024-08-10',
        endDate: '2024-08-12',
        thumbnail: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=60',
        isFavorite: false,
    },
    {
        id: '4',
        name: 'Product Launch Party',
        startDate: '2024-09-05',
        thumbnail: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=60',
        isFavorite: false,
    },
    {
        id: '5',
        name: 'Team Building Workshop',
        startDate: '2024-09-20',
        thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60',
        isFavorite: false,
    },
];

/**
 * Fetches events and stores them in Onyx
 */
function fetchEvents() {
    const optimisticEvents = MOCK_EVENTS.reduce((acc, event) => ({...acc, [`${ONYXKEYS.COLLECTION.EVENTS}${event.id}`]: event}), {});

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
            key: ONYXKEYS.COLLECTION.EVENTS,
            value: optimisticEvents,
        },
    ];

    API.read(READ_COMMANDS.GET_EVENTS, null, {
        optimisticData,
    });
}

/**
 * Mark an event as a favorite and update the Onyx collection
 */
function markEventAsFavorite(eventId: string, isFavorite: boolean) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.EVENTS}${eventId}`,
            value: {isFavorite},
        },
    ];

    API.write(
        WRITE_COMMANDS.MARK_EVENT_AS_FAVORITE,
        {eventID: eventId, isFavorite},
        {
            optimisticData,
        },
    );
}

export default {
    fetchEvents,
    markEventAsFavorite,
};
