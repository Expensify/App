import {act, fireEvent, render, screen} from '@testing-library/react-native';

import type {ComponentType} from 'react';
import type {DraggableFlatListProps} from 'react-native-draggable-flatlist';

import React from 'react';

const mockNativeScrollRef = {};
const mockGetNativeScrollRef = jest.fn((): typeof mockNativeScrollRef | null => mockNativeScrollRef);
const mockSetOuterScrollEnabled = jest.fn();
const mockOuterScrollOffset = {value: 0};
const mockBaseList = jest.fn<null, [DraggableFlatListProps<string>]>(() => null);

jest.mock('react-native-draggable-flatlist/src/components/DraggableFlatList', () => ({
    __esModule: true,
    default: mockBaseList,
}));
jest.mock('react-native-draggable-flatlist/src/context/nestableScrollContainerContext', () => ({
    useSafeNestableScrollContainerContext: () => ({
        scrollableRef: {current: {getNativeScrollRef: mockGetNativeScrollRef}},
        outerScrollOffset: mockOuterScrollOffset,
        setOuterScrollEnabled: mockSetOuterScrollEnabled,
    }),
}));
jest.mock('react-native-draggable-flatlist/src/hooks/useNestedAutoScroll', () => ({useNestedAutoScroll: jest.fn()}));

const {NestableDraggableFlatList} = jest.requireActual<{
    NestableDraggableFlatList: ComponentType<DraggableFlatListProps<string>>;
}>('react-native-draggable-flatlist/src/components/NestableDraggableFlatList');

function renderNestedList(props: Partial<DraggableFlatListProps<string>> = {}) {
    render(
        <NestableDraggableFlatList
            data={['Merchant', 'Amount']}
            keyExtractor={(item) => item}
            renderItem={() => null}
            {...props}
        />,
    );
    const list = mockBaseList.mock.calls.at(-1)?.at(0);
    if (!list) {
        throw new Error('Expected the nested list to render');
    }
    return list;
}

describe('native nested drag scrolling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetNativeScrollRef.mockReturnValue(mockNativeScrollRef);
    });

    it('measures the list against the outer native scroll view', () => {
        // Given a nested section below other content in a scrollable picker.
        const list = renderNestedList();
        const measureLayout = jest.fn();
        const containerRef = {current: {measureLayout}};

        // When the section reports its layout for automatic scrolling during a drag.
        fireEvent(screen.UNSAFE_getByType(mockBaseList), 'containerLayout', {containerRef});

        // Then measurement uses the native view ref required by Fabric instead of a numeric handle.
        expect(measureLayout).toHaveBeenCalledWith(mockNativeScrollRef, expect.any(Function), expect.any(Function));
        expect(list.outerScrollOffset).toBe(mockOuterScrollOffset);
        expect(list.scrollEnabled).toBe(false);
    });

    it('waits for the outer native view before measuring', () => {
        // Given a picker whose outer scroll view has not mounted yet.
        mockGetNativeScrollRef.mockReturnValue(null);
        renderNestedList();
        const measureLayout = jest.fn();
        const containerRef = {current: {measureLayout}};

        // When a section lays out before the outer native ref is available.
        fireEvent(screen.UNSAFE_getByType(mockBaseList), 'containerLayout', {containerRef});

        // Then it avoids an invalid native measurement.
        expect(measureLayout).not.toHaveBeenCalled();
    });

    it('locks the outer scroll gesture only while a row is being dragged', () => {
        // Given a section that shares its viewport with another draggable list.
        const onDragEnd = jest.fn();
        const list = renderNestedList({onDragEnd});
        const result = {data: ['Amount', 'Merchant'], from: 0, to: 1};

        // When the user starts and completes a reorder.
        act(() => list.onDragBegin?.(0));
        act(() => list.onDragEnd?.(result));

        // Then the library prevents competing scroll gestures during the drag and restores them afterward.
        expect(mockSetOuterScrollEnabled.mock.calls).toEqual([[false], [true]]);
        expect(onDragEnd).toHaveBeenCalledWith(result);
    });
});
