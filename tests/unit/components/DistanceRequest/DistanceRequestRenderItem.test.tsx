import {fireEvent, render, screen} from '@testing-library/react-native';

import DistanceRequestRenderItem from '@components/DistanceRequest/DistanceRequestRenderItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';

import type {WaypointCollection} from '@src/types/onyx/Transaction';

import type {GestureResponderEvent, View} from 'react-native';

import React from 'react';

jest.mock('@components/MenuItemWithTopDescription', () => {
    const ReactLocal = jest.requireActual<typeof React>('react');
    const RN = jest.requireActual<{View: typeof View}>('react-native');
    return jest.fn(({onPress}: {onPress?: (event: GestureResponderEvent) => void}) => ReactLocal.createElement(RN.View, {onTouchEnd: onPress, testID: 'waypoint'}));
});
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useTheme', () => () => ({icon: 'icon'}));
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({Location: 'location', DotIndicatorUnfilled: 'start', DotIndicator: 'middle', DragHandles: 'handle'}),
}));
jest.mock('@libs/TransactionUtils', () => ({isWaypointNullIsland: (waypoint: {lat?: number; lng?: number}) => waypoint.lat === 0 && waypoint.lng === 0}));
const waypoints: WaypointCollection = {
    waypoint0: {name: 'Start'},
    waypoint1: {address: 'Middle'},
    waypoint2: {name: 'End', lat: 0, lng: 0},
};
describe('DistanceRequestRenderItem', () => {
    it.each([
        [-1, 'distance.waypointDescription.stop', 'middle', undefined],
        [0, 'distance.waypointDescription.start', 'start', 'Start'],
        [1, 'distance.waypointDescription.stop', 'middle', 'Middle'],
        [2, 'distance.waypointDescription.stop', 'location', 'End'],
    ])('preserves the description, icon and click index for waypoint %i', (index, description, secondaryIcon, title) => {
        // Given unresolved or real waypoint positions, including a null-island destination
        const onPress = jest.fn();
        // When the selected item renders and is pressed
        render(
            <DistanceRequestRenderItem
                waypoints={waypoints}
                getIndex={index === -1 ? undefined : () => index}
                onPress={onPress}
            />,
        );
        const props = jest.mocked(MenuItemWithTopDescription).mock.lastCall?.[0];
        fireEvent(screen.getByTestId('waypoint'), 'touchEnd');
        // Then its finite translation, icon, title, error and index still match that position
        expect(props).toMatchObject({description, secondaryIcon, title});
        expect(props?.errorText).toBe(index === 2 ? 'violations.noRoute' : undefined);
        expect(onPress).toHaveBeenCalledWith(index);
    });
    it('uses the start branch for the only waypoint', () => {
        // Given a one-stop route where first and last refer to the same item
        // When the item renders
        render(
            <DistanceRequestRenderItem
                waypoints={{waypoint0: {name: 'Only'}}}
                getIndex={() => 0}
            />,
        );
        // Then the first branch wins as before
        expect(jest.mocked(MenuItemWithTopDescription).mock.lastCall?.[0]).toMatchObject({
            description: 'distance.waypointDescription.start',
            secondaryIcon: 'start',
        });
    });
});
