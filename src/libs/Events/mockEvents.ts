import CONST from '@src/CONST';
import type {Event} from '@src/types/onyx';

type MockFetchEventsOptions = {
    /** When true, the mock fetch rejects to simulate a server failure. */
    shouldSimulateError?: boolean;
    /** When true, the mock fetch resolves with an empty list. */
    shouldSimulateEmpty?: boolean;
    /** Simulated network latency in milliseconds. */
    simulatedLatencyMs?: number;
};

const MOCK_EVENTS: Event[] = [
    {
        id: '1',
        name: 'TechCrunch Disrupt 2026',
        startDate: '2026-09-12',
        endDate: '2026-09-14',
        thumbnailUrl: 'https://picsum.photos/seed/event1/240/240',
    },
    {
        id: '2',
        name: 'Design Systems Summit',
        startDate: '2026-10-03',
        thumbnailUrl: 'https://picsum.photos/seed/event2/240/240',
    },
    {
        id: '3',
        name: 'React Conf 2026',
        startDate: '2026-11-08',
        endDate: '2026-11-09',
        thumbnailUrl: 'https://picsum.photos/seed/event3/240/240',
    },
    {
        id: '4',
        name: 'Fintech Innovation Forum',
        startDate: '2026-12-01',
        endDate: '2026-12-03',
        thumbnailUrl: 'https://picsum.photos/seed/event4/240/240',
    },
    {
        id: '5',
        name: 'Remote Work Summit',
        startDate: '2027-01-15',
        thumbnailUrl: 'https://picsum.photos/seed/event5/240/240',
    },
    {
        id: '6',
        name: 'AI & Machine Learning Expo',
        startDate: '2027-02-20',
        endDate: '2027-02-22',
        thumbnailUrl: 'https://picsum.photos/seed/event6/240/240',
    },
    {
        id: '7',
        name: 'Product Leaders Conference',
        startDate: '2027-03-10',
        thumbnailUrl: 'https://picsum.photos/seed/event7/240/240',
    },
    {
        id: '8',
        name: 'Global HR Tech Summit',
        startDate: '2027-04-05',
        endDate: '2027-04-06',
        thumbnailUrl: 'https://picsum.photos/seed/event8/240/240',
    },
    {
        id: '9',
        name: 'SaaS Growth Conference',
        startDate: '2027-05-18',
        endDate: '2027-05-20',
        thumbnailUrl: 'https://picsum.photos/seed/event9/240/240',
    },
    {
        id: '10',
        name: 'Startup Founders Meetup',
        startDate: '2027-06-22',
        thumbnailUrl: 'https://picsum.photos/seed/event10/240/240',
    },
    {
        id: '11',
        name: 'Cloud Infrastructure Summit',
        startDate: '2027-07-14',
        endDate: '2027-07-16',
        thumbnailUrl: 'https://picsum.photos/seed/event11/240/240',
    },
];

/** Mocked async fetch: resolves after a simulated network latency, or rejects to simulate a failure. */
function mockFetchEvents({shouldSimulateError = false, shouldSimulateEmpty = false, simulatedLatencyMs = CONST.BOOK_EVENTS.MOCK_FETCH_LATENCY_MS}: MockFetchEventsOptions = {}): Promise<
    Event[]
> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldSimulateError) {
                reject(new Error('Failed to load events'));
                return;
            }
            resolve(shouldSimulateEmpty ? [] : MOCK_EVENTS);
        }, simulatedLatencyMs);
    });
}

export {MOCK_EVENTS, mockFetchEvents};
export type {MockFetchEventsOptions};
