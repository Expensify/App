/** Waypoint composition preserves editing, drag gestures, active feedback and route errors. */
import {fireEvent, render, renderHook, screen} from '@testing-library/react-native';

import DistanceRequestRenderItem from '@components/DistanceRequest/DistanceRequestRenderItem';
import MenuItem from '@components/MenuItem';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import getButtonState from '@libs/getButtonState';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {WaypointCollection} from '@src/types/onyx/Transaction';

import type {ViewStyle} from 'react-native';

import React from 'react';
import {StyleSheet, View} from 'react-native';

jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@userActions/Session', () => ({callIfAuthenticated: (callback: () => void) => callback}));

const waypoints: WaypointCollection = {
    waypoint0: {name: 'Home', address: 'Home address', lat: 1, lng: 1},
    waypoint1: {address: 'Office address', lat: 2, lng: 2},
};
const startLabel = 'distance.waypointDescription.start, Home';
const pressEvent = {nativeEvent: {}, preventDefault: jest.fn()};

it('retains waypoint editing and row-wide long-press dragging', () => {
    // Given an editable starting waypoint with a drag callback.
    const onPress = jest.fn();
    const onDrag = jest.fn();
    render(
        <DistanceRequestRenderItem
            waypoints={waypoints}
            getIndex={() => 0}
            onPress={onPress}
            onSecondaryInteraction={onDrag}
        />,
        {wrapper: OnyxListItemProvider},
    );

    // When the user activates the row and then long presses it.
    const row = screen.getByRole('button', {name: startLabel});
    fireEvent.press(row, pressEvent);
    fireEvent(row, 'longPress', pressEvent);

    // Then both gestures retain their original callbacks and the current waypoint index.
    expect(onPress).toHaveBeenCalledWith(0);
    expect(onDrag).toHaveBeenCalledTimes(1);
    expect(screen.UNSAFE_getByType(MenuItem.Root).props.sentryLabel).toBe(CONST.SENTRY_LABEL.IOU_REQUEST_STEP.WAYPOINT_START_MENU_ITEM);
});

it('blocks editing and dragging while disabled', () => {
    // Given a waypoint disabled during submission.
    const onPress = jest.fn();
    const onDrag = jest.fn();
    render(
        <DistanceRequestRenderItem
            waypoints={waypoints}
            getIndex={() => 0}
            onPress={onPress}
            onSecondaryInteraction={onDrag}
            disabled
        />,
        {wrapper: OnyxListItemProvider},
    );

    // When the user tries both gestures.
    const row = screen.getByRole('button', {name: startLabel});
    fireEvent.press(row, pressEvent);
    fireEvent(row, 'longPress', pressEvent);

    // Then no edit screen or drag can begin.
    expect(row).toBeDisabled();
    expect(onPress).not.toHaveBeenCalled();
    expect(onDrag).not.toHaveBeenCalled();
});

it('keeps the active-drag background without requiring hover', () => {
    // Given an active waypoint while the pointer is not hovering it.
    const {result} = renderHook(() => useStyleUtils());
    const {result: styles} = renderHook(() => useThemeStyles());
    render(
        <DistanceRequestRenderItem
            waypoints={waypoints}
            getIndex={() => 0}
            isActive
        />,
        {wrapper: OnyxListItemProvider},
    );

    // When its pressable is laid out.
    const row = screen.getByRole('button', {name: startLabel});

    // Then active feedback uses the same button state as the legacy focused row.
    expect(row).toHaveStyle(result.current.getButtonBackgroundColorStyle(getButtonState({isActive: true, isPressed: false, isDisabled: false, isInteractive: true}), true));
    expect(screen.getByTestId('menu-item-chevron')).toHaveStyle(styles.current.opacitySemiTransparent);
});

it('retains address fallback and the no-route indicator for null-island stops', () => {
    // Given the last stop has an address but no name and cannot be routed.
    render(
        <DistanceRequestRenderItem
            waypoints={{...waypoints, waypoint1: {address: 'Office address', lat: 0, lng: 0}}}
            getIndex={() => 1}
        />,
        {wrapper: OnyxListItemProvider},
    );

    // When the stop row renders.
    const row = screen.getByRole('button', {name: /^distance.waypointDescription.stop, Office address/});

    // Then its fallback value and validation feedback remain visible.
    expect(row).toBeOnTheScreen();
    expect(screen.getByText('violations.noRoute')).toBeOnTheScreen();
    expect(screen.getByTestId('menu-item-brick-road-indicator')).toBeOnTheScreen();
});

it('retains the legacy minimum height for an empty waypoint', () => {
    // Given a newly added stop has no address yet.
    render(
        <DistanceRequestRenderItem
            waypoints={{waypoint0: {}}}
            getIndex={() => 0}
        />,
        {wrapper: OnyxListItemProvider},
    );

    // When its single placeholder line is rendered.
    const views = screen.UNSAFE_getAllByType(View);

    // Then the text line cannot shrink the waypoint's edit/drag target below its previous height.
    expect(views.some(({props}) => StyleSheet.flatten<ViewStyle>(props.style)?.minHeight === variables.componentSizeNormal)).toBe(true);
});
