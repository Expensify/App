/**
 * @jest-environment jsdom
 */
import {render} from '@testing-library/react-native';
import React from 'react';
import SwipeToDismiss, {DEFAULT_SWIPE_THRESHOLD_PX} from '@components/Modal/v2/compound/SwipeToDismiss';
import Text from '@components/Text';
import CONST from '@src/CONST';

const gestureDetectorMounts: {current: number} = {current: 0};

jest.mock('react-native-gesture-handler', () => ({
    Gesture: {
        Pan: () => ({
            onStart: () => ({
                onEnd: () => ({type: 'pan-mock'}),
            }),
        }),
    },
    GestureDetector: ({children}: {children: React.ReactNode}) => {
        gestureDetectorMounts.current += 1;
        return children;
    },
}));

jest.mock('react-native-reanimated', () => ({
    useSharedValue: () => ({get: () => 0, set: () => {}}),
}));

jest.mock('react-native-worklets', () => ({
    scheduleOnRN: (fn: () => void) => fn(),
}));

beforeEach(() => {
    gestureDetectorMounts.current = 0;
});

describe('Modal/v2/SwipeToDismiss', () => {
    it('default swipe threshold is 150px', () => {
        expect(DEFAULT_SWIPE_THRESHOLD_PX).toBe(150);
    });

    it('renders children without wrapping when swipeDirections is undefined', () => {
        render(
            <SwipeToDismiss onSwipeDismiss={jest.fn()}>
                <Text>body</Text>
            </SwipeToDismiss>,
        );
        expect(gestureDetectorMounts.current).toBe(0);
    });

    it('renders children without wrapping when swipeDirections is an empty array', () => {
        render(
            <SwipeToDismiss
                swipeDirections={[]}
                onSwipeDismiss={jest.fn()}
            >
                <Text>body</Text>
            </SwipeToDismiss>,
        );
        expect(gestureDetectorMounts.current).toBe(0);
    });

    it('renders children without wrapping when onSwipeDismiss is undefined', () => {
        render(
            <SwipeToDismiss swipeDirections={[CONST.SWIPE_DIRECTION.DOWN]}>
                <Text>body</Text>
            </SwipeToDismiss>,
        );
        expect(gestureDetectorMounts.current).toBe(0);
    });

    it('wraps children in GestureDetector when both directions and onSwipeDismiss are provided', () => {
        render(
            <SwipeToDismiss
                swipeDirections={[CONST.SWIPE_DIRECTION.DOWN, CONST.SWIPE_DIRECTION.RIGHT]}
                onSwipeDismiss={jest.fn()}
            >
                <Text>body</Text>
            </SwipeToDismiss>,
        );
        expect(gestureDetectorMounts.current).toBe(1);
    });
});
