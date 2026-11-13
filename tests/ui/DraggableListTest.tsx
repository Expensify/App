import {act, render} from '@testing-library/react-native';

import type * as DraggableListModule from '@components/DraggableList/index';

import DragCursor from '@libs/DragCursor';

import type {DragStartEvent} from '@dnd-kit/core';
import type * as DndKitCore from '@dnd-kit/core';

import {DndContext} from '@dnd-kit/core';
import React from 'react';

import createMock from '../utils/createMock';

// Jest normally resolves the native implementation, but these regressions concern browser DOM focus.
const DraggableList = jest.requireActual<typeof DraggableListModule>('@components/DraggableList/index.tsx').default;

jest.mock('@dnd-kit/core', () => ({
    ...jest.requireActual<typeof DndKitCore>('@dnd-kit/core'),
    DndContext: jest.fn(() => null),
}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useListKeyboardNav', () => () => ({focusedIndex: -1, setFocusedIndex: jest.fn()}));
jest.mock('@libs/DragCursor', () => ({show: jest.fn(), hide: jest.fn()}));

function startDrag(activatorEvent: Event) {
    render(
        <DraggableList
            data={[]}
            renderItem={() => null}
            keyExtractor={String}
            disableScroll
        />,
    );
    const contextProps = jest.mocked(DndContext).mock.calls.at(-1)?.[0];
    expect(typeof contextProps?.onDragStart).toBe('function');
    act(() => contextProps?.onDragStart?.(createMock<DragStartEvent>({activatorEvent})));
}

describe('DraggableList web focus', () => {
    afterEach(() => {
        document.body.replaceChildren();
        jest.clearAllMocks();
    });

    it.each(['input', 'textarea'] as const)('blurs a focused %s when a pointer drag starts', (tagName) => {
        // Given a text field that retained focus when the row prevented the default mouse-down behavior
        const input = document.createElement(tagName);
        document.body.appendChild(input);
        input.focus();
        expect(document.activeElement).toBe(input);

        // When the pointer moves far enough to activate dragging
        startDrag(new MouseEvent('pointerdown'));

        // Then the field loses real DOM focus, which also removes its focus highlight
        expect(document.activeElement).not.toBe(input);
        expect(DragCursor.show).toHaveBeenCalledTimes(1);
    });

    it('preserves text input focus for a keyboard drag', () => {
        // Given a focused text field so this test detects an unconditional blur before the keyboard guard
        const input = document.createElement('input');
        document.body.appendChild(input);
        input.focus();

        // When a keyboard event activates dragging
        startDrag(new KeyboardEvent('keydown', {key: ' '}));

        // Then keyboard dragging neither blurs the field nor forces a pointer cursor
        expect(document.activeElement).toBe(input);
        expect(DragCursor.show).not.toHaveBeenCalled();
    });

    it('does not blur a focused row when a pointer drag starts', () => {
        // Given a focusable row rather than a text field
        const row = document.createElement('div');
        row.tabIndex = 0;
        document.body.appendChild(row);
        row.focus();

        // When a pointer drag starts
        startDrag(new MouseEvent('pointerdown'));

        // Then the row retains focus while the pointer cursor is shown
        expect(document.activeElement).toBe(row);
        expect(DragCursor.show).toHaveBeenCalledTimes(1);
    });
});
