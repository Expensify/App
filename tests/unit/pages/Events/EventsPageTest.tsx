import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import type ReactNative from 'react-native';
import useOnyx from '@hooks/useOnyx';
import EventsPage from '@pages/Events/EventsPage';
import {fetchEvents} from '@userActions/Events';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Event, EventsFetchMetadata} from '@src/types/onyx';

jest.mock('@userActions/Events', () => ({
    fetchEvents: jest.fn(),
    toggleFavoriteEvent: jest.fn(),
}));

jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined, {status: 'loaded'}]));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);

jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(
        () =>
            new Proxy(
                {},
                {
                    get: () => ({}),
                },
            ),
    ),
);

jest.mock('@hooks/useTheme', () =>
    jest.fn(() => ({
        spinner: 'spinner-color',
    })),
);

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: jest.fn(() => ({EmptyStateTravel: 'empty-illustration'})),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
}));

jest.mock('@shopify/flash-list', () => {
    const ReactLocal = jest.requireActual<typeof React>('react');
    const RN = jest.requireActual<typeof ReactNative>('react-native');

    const FlashList = ({data, renderItem, keyExtractor}: {data?: Event[]; renderItem?: (info: {item: Event; index: number}) => React.ReactNode; keyExtractor?: (item: Event) => string}) =>
        ReactLocal.createElement(
            RN.View,
            {testID: 'events-flash-list'},
            ...(data ?? []).map((item, index) => ReactLocal.createElement(ReactLocal.Fragment, {key: keyExtractor?.(item) ?? String(index)}, renderItem?.({item, index}))),
        );

    return {FlashList};
});

jest.mock('@components/ScreenWrapper', () => {
    function MockScreenWrapper({children, testID}: {children: React.ReactNode; testID?: string}) {
        const {View} = jest.requireActual<typeof ReactNative>('react-native');
        return <View testID={testID}>{children}</View>;
    }
    return MockScreenWrapper;
});

jest.mock('@components/HeaderWithBackButton', () => {
    function MockHeader({title}: {title: string}) {
        const {Text} = jest.requireActual<typeof ReactNative>('react-native');
        return <Text>{title}</Text>;
    }
    return MockHeader;
});

jest.mock('@components/ActivityIndicator', () => {
    function MockActivityIndicator() {
        const {Text} = jest.requireActual<typeof ReactNative>('react-native');
        return <Text>Loading</Text>;
    }
    return MockActivityIndicator;
});

jest.mock('@components/Button', () => {
    const {TouchableOpacity, Text} = jest.requireActual<typeof ReactNative>('react-native');
    function MockButton({text, onPress}: {text: string; onPress: () => void}) {
        return (
            <TouchableOpacity
                accessibilityRole="button"
                onPress={onPress}
            >
                <Text>{text}</Text>
            </TouchableOpacity>
        );
    }
    return MockButton;
});

jest.mock('@components/ScrollView', () => {
    function MockScrollView({children}: {children: React.ReactNode}) {
        const {View} = jest.requireActual<typeof ReactNative>('react-native');
        return <View testID="events-empty-scroll">{children}</View>;
    }
    return MockScrollView;
});

jest.mock('@components/EmptyStateComponent/GenericEmptyStateComponent', () => {
    function MockEmptyState({title, subtitle}: {title: string; subtitle: string}) {
        const {Text, View} = jest.requireActual<typeof ReactNative>('react-native');
        return (
            <View>
                <Text>{title}</Text>
                <Text>{subtitle}</Text>
            </View>
        );
    }
    return MockEmptyState;
});

jest.mock('@pages/Events/EventCard', () => {
    function MockEventCard({event}: {event: Event}) {
        const {Text} = jest.requireActual<typeof ReactNative>('react-native');
        return <Text>{event.name}</Text>;
    }
    return MockEventCard;
});

const mockUseOnyx = jest.mocked(useOnyx);
const mockFetchEvents = jest.mocked(fetchEvents);

const sampleEvent: Event = {
    id: '1',
    name: 'TechCrunch Disrupt 2026',
    startDate: '2026-09-12',
    endDate: '2026-09-14',
    thumbnailUrl: 'https://example.com/event1.png',
};

const fetchErrorTimestamp = '1700000000000000';

function setOnyxState({events, meta, favorites}: {events?: Record<string, Event | null | undefined>; meta?: EventsFetchMetadata; favorites?: Record<string, boolean>}) {
    mockUseOnyx.mockImplementation((key) => {
        if (key === ONYXKEYS.COLLECTION.EVENT) {
            return [events, {status: 'loaded'}];
        }
        if (key === ONYXKEYS.EVENTS_FETCH_METADATA) {
            return [meta, {status: 'loaded'}];
        }
        if (key === ONYXKEYS.FAVORITE_EVENT_IDS) {
            return [favorites, {status: 'loaded'}];
        }
        return [undefined, {status: 'loaded'}];
    });
}

describe('EventsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setOnyxState({
            events: {},
            meta: {
                loading: false,
                hasCompletedInitialFetch: true,
            },
            favorites: {},
        });
    });

    it('calls fetchEvents when the page mounts', () => {
        render(<EventsPage />);

        expect(mockFetchEvents).toHaveBeenCalledTimes(1);
    });

    it('shows a loading indicator during the initial fetch', () => {
        setOnyxState({
            events: {},
            meta: {
                loading: true,
                hasCompletedInitialFetch: false,
            },
        });

        render(<EventsPage />);

        expect(screen.getByText('Loading')).toBeTruthy();
    });

    it('shows an error state with a retry button when the fetch fails', () => {
        setOnyxState({
            events: {},
            meta: {
                loading: false,
                hasCompletedInitialFetch: true,
                errors: {
                    [fetchErrorTimestamp]: 'events.error',
                },
            },
        });

        render(<EventsPage />);

        expect(screen.getByText('events.error')).toBeTruthy();
        expect(screen.getByText('events.retry')).toBeTruthy();
    });

    it('calls fetchEvents again when retry is pressed', () => {
        setOnyxState({
            events: {},
            meta: {
                loading: false,
                hasCompletedInitialFetch: true,
                errors: {
                    [fetchErrorTimestamp]: 'events.error',
                },
            },
        });

        render(<EventsPage />);

        fireEvent.press(screen.getByText('events.retry'));

        expect(mockFetchEvents).toHaveBeenCalledTimes(2);
    });

    it('shows the empty state when there are no events', () => {
        render(<EventsPage />);

        expect(screen.getByText('events.emptyTitle')).toBeTruthy();
        expect(screen.getByText('events.emptySubtitle')).toBeTruthy();
    });

    it('renders the events list when events are available', () => {
        setOnyxState({
            events: {
                [`${ONYXKEYS.COLLECTION.EVENT}1`]: sampleEvent,
            },
            meta: {
                loading: false,
                hasCompletedInitialFetch: true,
            },
        });

        render(<EventsPage />);

        expect(screen.getByTestId('events-flash-list')).toBeTruthy();
        expect(screen.getByText('TechCrunch Disrupt 2026')).toBeTruthy();
    });

    it('sorts favorited events to the top of the list', () => {
        const favoritedEventID = '2';

        setOnyxState({
            events: {
                [`${ONYXKEYS.COLLECTION.EVENT}1`]: sampleEvent,
                [`${ONYXKEYS.COLLECTION.EVENT}2`]: {
                    id: favoritedEventID,
                    name: 'Design Systems Summit',
                    startDate: '2026-10-03',
                    thumbnailUrl: 'https://example.com/event2.png',
                },
            },
            meta: {
                loading: false,
                hasCompletedInitialFetch: true,
            },
            favorites: {
                [favoritedEventID]: true,
            },
        });

        render(<EventsPage />);

        const eventNames = screen.getAllByText(/TechCrunch Disrupt 2026|Design Systems Summit/);
        expect(eventNames.at(0)).toHaveTextContent('Design Systems Summit');
    });
});
