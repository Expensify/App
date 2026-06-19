import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import type ReactNative from 'react-native';
import EventCard from '@pages/Events/EventCard';
import type {Event} from '@src/types/onyx';

const mockEvent: Event = {
    id: 'event-1',
    name: 'React Conf 2026',
    startDate: '2026-11-08',
    endDate: '2026-11-09',
    thumbnailUrl: 'https://example.com/thumb.png',
};

jest.mock('@pages/Events/getEventDateLabel', () => jest.fn(() => 'Nov 8 – Nov 9, 2026'));

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
        success: 'success-color',
        icon: 'icon-color',
    })),
);

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({Star: 'star-icon'})),
}));

jest.mock('@components/Image', () => {
    const {View} = jest.requireActual<typeof ReactNative>('react-native');
    function MockImage() {
        return <View accessibilityLabel="event-thumbnail" />;
    }
    return MockImage;
});

jest.mock('@components/Icon', () => {
    const {View} = jest.requireActual<typeof ReactNative>('react-native');
    function MockIcon() {
        return <View accessibilityLabel="favorite-icon" />;
    }
    return MockIcon;
});

jest.mock('@components/Pressable/PressableWithFeedback', () => {
    const {TouchableOpacity} = jest.requireActual<typeof ReactNative>('react-native');
    function MockPressableWithFeedback({children, onPress, accessibilityLabel}: {children: React.ReactNode; onPress: () => void; accessibilityLabel?: string}) {
        return (
            <TouchableOpacity
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel={accessibilityLabel}
            >
                {children}
            </TouchableOpacity>
        );
    }
    return MockPressableWithFeedback;
});

describe('EventCard', () => {
    it('renders the event name and formatted date label', () => {
        render(
            <EventCard
                event={mockEvent}
                isFavorite={false}
                onToggleFavorite={jest.fn()}
            />,
        );

        expect(screen.getByText('React Conf 2026')).toBeTruthy();
        expect(screen.getByText('Nov 8 – Nov 9, 2026')).toBeTruthy();
    });

    it('uses the favorite accessibility label when the event is not favorited', () => {
        render(
            <EventCard
                event={mockEvent}
                isFavorite={false}
                onToggleFavorite={jest.fn()}
            />,
        );

        expect(screen.getByLabelText('events.favorite')).toBeTruthy();
    });

    it('uses the unfavorite accessibility label when the event is favorited', () => {
        render(
            <EventCard
                event={mockEvent}
                isFavorite
                onToggleFavorite={jest.fn()}
            />,
        );

        expect(screen.getByLabelText('events.unfavorite')).toBeTruthy();
    });

    it('calls onToggleFavorite with the event id and favorite state when pressed', () => {
        const onToggleFavorite = jest.fn();

        render(
            <EventCard
                event={mockEvent}
                isFavorite={false}
                onToggleFavorite={onToggleFavorite}
            />,
        );

        fireEvent.press(screen.getByLabelText('events.favorite'));

        expect(onToggleFavorite).toHaveBeenCalledWith('event-1', false);
    });
});
