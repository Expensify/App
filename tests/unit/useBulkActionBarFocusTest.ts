/**
 * Tests for useBulkActionBarFocus (web), the hand-back of focus when the bulk action bar unmounts with the
 * selection it describes. Runs against real DOM nodes in jsdom rather than a rendered bar, because the hook only
 * ever reads the bar through a ref.
 */

import {act, renderHook} from '@testing-library/react-native';

import type {RefObject} from 'react';

// Jest resolves index.native.ts by default, and that one is a no-op.
const useBulkActionBarFocus = require<{
    default: (barRef: RefObject<unknown>, isScreenFocused: boolean) => {suppressStrayFocusRing: () => void; isFocusInsideBar: boolean};
}>('../../src/components/BulkActionBar/useBulkActionBarFocus/index.ts').default;

function createButton(label: string) {
    const button = document.createElement('button');
    button.textContent = label;
    document.body.appendChild(button);
    return button;
}

/** jsdom fires focusin for `focus()`, which is what the hook listens on, so the real event is enough here. */
function focus(element: HTMLElement) {
    act(() => element.focus());
}

afterEach(() => {
    document.body.innerHTML = '';
});

describe('useBulkActionBarFocus', () => {
    it('hands focus back to the table when the bar unmounts holding it', () => {
        // Given a row that was focused before the bar appeared, and a bar that has since taken focus
        const row = createButton('Row');
        const bar = document.createElement('div');
        const barButton = createButton('Change role');
        bar.appendChild(barButton);
        document.body.appendChild(bar);

        const {unmount} = renderHook(() => useBulkActionBarFocus({current: bar}, true));

        focus(row);
        focus(barButton);

        // When the action clears the selection and the bar goes away under the focused button
        unmount();
        bar.remove();

        // Then focus is back on the row rather than lost to the document
        expect(document.activeElement).toBe(row);
    });

    it('hands focus back when an action run from another screen has already dropped it to the document', () => {
        // Given a row focused on the table, and a screen opened over it that takes focus to its own Save button
        const row = createButton('Row');
        const bar = document.createElement('div');
        document.body.appendChild(bar);
        const save = createButton('Save');

        const {rerender, unmount} = renderHook(({isScreenFocused}) => useBulkActionBarFocus({current: bar}, isScreenFocused), {initialProps: {isScreenFocused: true}});

        focus(row);

        rerender({isScreenFocused: false});
        focus(save);

        // When that screen saves and leaves, so its own controls are gone and focus has fallen to the document
        // before the bar unmounts with the selection
        act(() => save.remove());
        expect(document.activeElement).toBe(document.body);

        unmount();
        bar.remove();

        // Then focus is back on the row, not left on the document
        expect(document.activeElement).toBe(row);
    });

    it('leaves focus alone when the bar unmounts without holding it', () => {
        // Given a bar that unmounts while focus sits on a control of the table behind it
        const row = createButton('Row');
        const other = createButton('Other');
        const bar = document.createElement('div');
        document.body.appendChild(bar);

        const {unmount} = renderHook(() => useBulkActionBarFocus({current: bar}, true));

        focus(row);
        focus(other);

        // When the last row is deselected and the bar goes away
        unmount();
        bar.remove();

        // Then the control the user is actually on keeps focus
        expect(document.activeElement).toBe(other);
    });
});
