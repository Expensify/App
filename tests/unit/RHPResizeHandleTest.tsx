import {fireEvent, render} from '@testing-library/react-native';

import {resetSingleRHPWidth, setSingleRHPWidth} from '@libs/actions/SingleRHPWidth';
import type RHPResizeHandleComponent from '@libs/Navigation/AppNavigator/Navigators/RHPResizeHandle';

import React from 'react';

// Jest resolves the native no-op, so the web implementation is loaded by its file name.
const {default: RHPResizeHandle} = jest.requireActual<{default: typeof RHPResizeHandleComponent}>('@libs/Navigation/AppNavigator/Navigators/RHPResizeHandle/index.tsx');

// The native helpers never touch the DOM, so the web ones are loaded by their file name too.
jest.mock('@libs/Navigation/helpers/singleRHPWidth', () => jest.requireActual<Record<string, unknown>>('@libs/Navigation/helpers/singleRHPWidth/index.ts'));

jest.mock('@libs/actions/SingleRHPWidth', () => ({
    setSingleRHPWidth: jest.fn(),
    resetSingleRHPWidth: jest.fn(),
}));

const MIN_WIDTH = 380;
const MAX_WIDTH = 800;

let mockSavedWidth = 400;
jest.mock('@hooks/useSingleRHPWidth', () => () => ({width: mockSavedWidth, min: MIN_WIDTH, max: MAX_WIDTH}));

const WIDTH_VARIABLE = '--rhp-width';

type PointerEventName = 'pointerDown' | 'pointerMove' | 'pointerUp' | 'lostPointerCapture';

const DEFAULT_WIDTH = 440;

/** Renders the handle with a scope element, the way the RHP navigators mount it. */
function renderHandle() {
    const scopeElement = document.createElement('div');
    const handleElement = document.createElement('div');

    // jsdom has no pointer capture.
    handleElement.setPointerCapture = jest.fn();

    const scopeRef = {current: scopeElement};
    const screen = render(<RHPResizeHandle scopeRef={scopeRef} />);

    const getHandle = () => {
        // The first div is the handle; the indicator line is a second one, rendered while hovered or dragging.
        const handle = screen.UNSAFE_root.findAll((node) => node.type === 'div').at(0);

        if (!handle) {
            throw new Error('Expected the handle to render a div');
        }

        return handle;
    };

    /** Fires a pointer event carrying only what the handle reads. */
    const firePointer = (eventName: PointerEventName, clientX: number) =>
        fireEvent(getHandle(), eventName, {button: 0, clientX, pointerId: 1, currentTarget: handleElement, preventDefault: jest.fn(), stopPropagation: jest.fn()});

    const readLiveWidth = () => scopeElement.style.getPropertyValue(WIDTH_VARIABLE);

    const rerenderHandle = () => screen.rerender(<RHPResizeHandle scopeRef={scopeRef} />);

    const fireDoubleClick = () => fireEvent(getHandle(), 'doubleClick');

    return {...screen, firePointer, fireDoubleClick, readLiveWidth, rerenderHandle};
}

describe('RHPResizeHandle', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSavedWidth = 400;
    });

    it('paints the live width mid-drag and saves it once on release', () => {
        // Given a single RHP saved at 400px
        const {firePointer, readLiveWidth} = renderHandle();

        // When its left edge is dragged 100px to the left
        firePointer('pointerDown', 1000);
        firePointer('pointerMove', 900);

        // Then the cards follow through the CSS variable without saving yet, since mid-drag widths only live in CSS
        expect(readLiveWidth()).toBe('500px');
        expect(setSingleRHPWidth).not.toHaveBeenCalled();

        // When the pointer is released, and the browser then reclaims capture as it always does after pointerup
        firePointer('pointerUp', 900);
        firePointer('lostPointerCapture', 900);

        // Then the dragged width is saved exactly once, so it survives a reload without a duplicate Onyx write
        expect(jest.mocked(setSingleRHPWidth).mock.calls).toEqual([[500]]);
    });

    it('clamps the live width to the bounds the window allows', () => {
        // Given a single RHP saved at 400px, with an 800px maximum
        const {firePointer, readLiveWidth} = renderHandle();

        // When its edge is dragged far past the maximum
        firePointer('pointerDown', 1000);
        firePointer('pointerMove', 0);

        // Then the cards stop at the maximum, so the RHP never covers more than the window allows
        expect(readLiveWidth()).toBe(`${MAX_WIDTH}px`);
    });

    it.each([
        ['a press never moves', []],
        ['a drag ends at the saved width', [900, 1000]],
    ])('skips the save and clears the live width when %s', (_, moves: number[]) => {
        // Given a single RHP saved at 400px
        const {firePointer, readLiveWidth} = renderHandle();

        // When its edge is pressed, optionally moved, and released where it started
        firePointer('pointerDown', 1000);
        for (const clientX of moves) {
            firePointer('pointerMove', clientX);
        }
        firePointer('pointerUp', 1000);

        // Then nothing is saved, so no needless Onyx write follows, and the live width is cleared because no render follows to clear it
        expect(setSingleRHPWidth).not.toHaveBeenCalled();
        expect(readLiveWidth()).toBe('');
    });

    it('clears the live width once the saved width renders', () => {
        // Given a drag released at 500px
        const {firePointer, readLiveWidth, rerenderHandle} = renderHandle();
        firePointer('pointerDown', 1000);
        firePointer('pointerMove', 900);
        firePointer('pointerUp', 900);
        expect(readLiveWidth()).toBe('500px');

        // When the saved width comes back from Onyx
        mockSavedWidth = 500;
        rerenderHandle();

        // Then the live width is dropped, since the saved width now renders as the fallback
        expect(readLiveWidth()).toBe('');
    });

    it('keeps the live width when the saved width changes mid-drag', () => {
        // Given a drag in progress at 500px
        const {firePointer, readLiveWidth, rerenderHandle} = renderHandle();
        firePointer('pointerDown', 1000);
        firePointer('pointerMove', 900);

        // When the saved width changes underneath it, as a window resize re-clamps it
        mockSavedWidth = 450;
        rerenderHandle();

        // Then the live width stays, so the cards don't jump back while the pointer is still down
        expect(readLiveWidth()).toBe('500px');
    });

    it('clears the live width when it unmounts mid-drag', () => {
        // Given a drag in progress at 500px
        const {firePointer, readLiveWidth, unmount} = renderHandle();
        firePointer('pointerDown', 1000);
        firePointer('pointerMove', 900);

        // When the handle unmounts, as it does when a wide RHP opens on top
        unmount();

        // Then the live width is cleared, since the scope outlives the handle and would otherwise pin the cards
        expect(readLiveWidth()).toBe('');
    });

    it.each([
        ['just short of the default', 970],
        ['just past the default', 950],
    ])('snaps onto the default width when a drag ends %s', (_, releaseClientX: number) => {
        // Given a single RHP saved at 400px
        const {firePointer, readLiveWidth} = renderHandle();

        // When its edge is dragged to within 20px of the 440px default and released there
        firePointer('pointerDown', 1000);
        firePointer('pointerMove', releaseClientX);
        expect(readLiveWidth()).toBe(`${DEFAULT_WIDTH}px`);
        firePointer('pointerUp', releaseClientX);

        // Then the default width is saved, so getting back to it doesn't take pixel-perfect aim
        expect(jest.mocked(setSingleRHPWidth).mock.calls).toEqual([[DEFAULT_WIDTH]]);
    });

    it('lets go of the default width once a drag passes the snap threshold', () => {
        // Given a single RHP saved at 400px
        const {firePointer, readLiveWidth} = renderHandle();

        // When its edge is dragged 30px past the 440px default
        firePointer('pointerDown', 1000);
        firePointer('pointerMove', 930);

        // Then the cards follow the pointer again, so widths near the default stay reachable
        expect(readLiveWidth()).toBe('470px');
    });

    it('resets the saved width on a double-click', () => {
        // Given a single RHP saved at 400px
        const {firePointer, fireDoubleClick} = renderHandle();

        // When its edge is double-clicked, two presses that never move
        firePointer('pointerDown', 1000);
        firePointer('pointerUp', 1000);
        firePointer('pointerDown', 1000);
        firePointer('pointerUp', 1000);
        fireDoubleClick();

        // Then the saved width is dropped, so the RHP returns to the default, and the presses save nothing of their own
        expect(resetSingleRHPWidth).toHaveBeenCalledTimes(1);
        expect(setSingleRHPWidth).not.toHaveBeenCalled();
    });
});
