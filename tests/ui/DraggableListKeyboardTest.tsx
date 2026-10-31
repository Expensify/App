import {act, render} from '@testing-library/react-native';

import DraggableList from '@components/DraggableList/index';

import type useListKeyboardNav from '@hooks/useListKeyboardNav';

import type * as DndKit from '@dnd-kit/core';
import type {PropsWithChildren} from 'react';

import React from 'react';
import {View as MockView} from 'react-native';

import createMock from '../utils/createMock';

const mockKeyboardNav = jest.fn<ReturnType<typeof useListKeyboardNav>, Parameters<typeof useListKeyboardNav>>(() => ({focusedIndex: -1, setFocusedIndex: jest.fn()}));
const mockDndContext = jest.fn(({children}: DndKit.DndContextProps) => <MockView>{children}</MockView>);

jest.mock('@components/DraggableList/index', () => jest.requireActual<{default: typeof DraggableList}>('@components/DraggableList/index.tsx'));
jest.mock('@hooks/useListKeyboardNav', () => (config: Parameters<typeof useListKeyboardNav>[0]) => mockKeyboardNav(config));
jest.mock('@components/ScrollView', () => ({children}: PropsWithChildren) => <MockView>{children}</MockView>);
jest.mock('@components/DraggableList/SortableItem', () => ({children}: PropsWithChildren) => <MockView>{children}</MockView>);
jest.mock('@dnd-kit/core', () => ({
    ...jest.requireActual<typeof DndKit>('@dnd-kit/core'),
    DndContext: (props: DndKit.DndContextProps) => mockDndContext(props),
}));

function getDragHandlers() {
    const props = mockDndContext.mock.calls.at(-1)?.at(0);
    if (!props) {
        throw new Error('Expected the drag context to render');
    }
    return props;
}

describe('web drag keyboard navigation', () => {
    beforeEach(() => jest.clearAllMocks());

    it.each(['drop', 'cancel'] as const)('releases arrow keys to the drag sensor until %s', (action) => {
        // Given a picker whose arrow keys normally move focus between rows.
        render(
            <DraggableList
                data={['amount', 'merchant']}
                keyExtractor={(item) => item}
                renderItem={() => null}
                onSelectRow={jest.fn()}
            />,
        );
        expect(mockKeyboardNav.mock.lastCall?.at(0)?.isActive).toBe(true);

        // When a keyboard drag starts, moving focus must not cancel the active sensor.
        act(() => getDragHandlers().onDragStart?.(createMock<DndKit.DragStartEvent>({activatorEvent: new KeyboardEvent('keydown', {code: 'Space'})})));
        expect(mockKeyboardNav.mock.lastCall?.at(0)?.isActive).toBe(false);

        act(() => {
            if (action === 'cancel') {
                getDragHandlers().onDragCancel?.(createMock<DndKit.DragEndEvent>({}));
                return;
            }
            getDragHandlers().onDragEnd?.(createMock<DndKit.DragEndEvent>({active: {id: 'amount'}, over: {id: 'merchant'}}));
        });

        // Then regular arrow navigation is available again after either exit path.
        expect(mockKeyboardNav.mock.lastCall?.at(0)?.isActive).toBe(true);
    });

    it('suspends the shared focus manager for a grouped picker', () => {
        // Given a section whose focus is controlled by the picker containing both lists.
        const onDragActiveChange = jest.fn();
        render(
            <DraggableList
                data={['amount', 'merchant']}
                keyExtractor={(item) => item}
                renderItem={() => null}
                focusedIndex={0}
                onDragActiveChange={onDragActiveChange}
            />,
        );

        // When dragging starts and is then cancelled.
        act(() => getDragHandlers().onDragStart?.(createMock<DndKit.DragStartEvent>({activatorEvent: new KeyboardEvent('keydown', {code: 'Space'})})));
        act(() => getDragHandlers().onDragCancel?.(createMock<DndKit.DragEndEvent>({})));

        // Then the shared focus manager can stop and resume without enabling a second one.
        expect(onDragActiveChange.mock.calls).toEqual([[true], [false]]);
        expect(mockKeyboardNav.mock.calls.every(([config]) => !config.isActive)).toBe(true);
    });
});
