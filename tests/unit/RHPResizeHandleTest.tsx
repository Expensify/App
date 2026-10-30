import {fireEvent, render} from '@testing-library/react-native';

import type RHPResizeHandleComponent from '@components/RHPResizeHandle';

import {resetSingleRHPWidth, setSingleRHPWidth} from '@libs/actions/SingleRHPWidth';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';

// Jest resolves the native no-op, so the web implementation is loaded by its file name.
const {default: RHPResizeHandle} = jest.requireActual<{default: typeof RHPResizeHandleComponent}>('@components/RHPResizeHandle/index.tsx');

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

type PointerEventName = 'pointerEnter' | 'pointerDown' | 'pointerMove' | 'pointerUp' | 'pointerCancel' | 'lostPointerCapture';

const DEFAULT_WIDTH = variables.rhpWidth;

/** Renders the handle the way the RHP navigators mount it. */
function renderHandle() {
    const handleElement = document.createElement('div');

    // jsdom has no pointer capture.
    handleElement.setPointerCapture = jest.fn();

    // The test renderer leaves refs empty, so the line's ref gets a real element to take the snapped width the handle sets on the DOM.
    const lineElement = document.createElement('div');

    // Only the line holds a ref among the divs, so handing this element to every div reaches just the line.
    const screen = render(<RHPResizeHandle />, {createNodeMock: (element) => (element.type === 'div' ? lineElement : null)});

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

    const readLiveWidth = () => document.documentElement.style.getPropertyValue(WIDTH_VARIABLE);

    const rerenderHandle = () => screen.rerender(<RHPResizeHandle />);

    const readLineWidth = () => {
        const lineStyle: unknown = screen.UNSAFE_root.findAll((node) => node.type === 'div').at(1)?.props.style;
        return lineStyle && typeof lineStyle === 'object' && 'width' in lineStyle ? lineStyle.width : undefined;
    };

    /** Reads the width set on the line's DOM node mid-drag, which overrides the one React renders. */
    const readPaintedLineWidth = () => lineElement.style.width;

    return {...screen, firePointer, readLineWidth, readPaintedLineWidth, readLiveWidth, rerenderHandle};
}

describe('RHPResizeHandle', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSavedWidth = 400;
        // The live width lives on the shared document, so a test that leaves it set would leak into the next.
        document.documentElement.style.removeProperty(WIDTH_VARIABLE);
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

    it('skips the save and clears the live width when a drag ends at the saved width', () => {
        // Given a single RHP saved at 400px
        const {firePointer, readLiveWidth} = renderHandle();

        // When its edge is dragged away and back, then released where it started
        firePointer('pointerDown', 1000);
        firePointer('pointerMove', 900);
        firePointer('pointerMove', 1000);
        firePointer('pointerUp', 1000);

        // Then nothing is saved or reset, so no needless Onyx write follows, and the live width is cleared because no render follows to clear it
        expect(setSingleRHPWidth).not.toHaveBeenCalled();
        expect(resetSingleRHPWidth).not.toHaveBeenCalled();
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

        // Then the live width is cleared, since the document outlives the handle and would otherwise pin the cards
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

        // Then the saved width is dropped, so getting back to the default doesn't take pixel-perfect aim and follows the default if it changes
        expect(resetSingleRHPWidth).toHaveBeenCalledTimes(1);
        expect(setSingleRHPWidth).not.toHaveBeenCalled();
    });

    it('thickens the line while a drag is held on the default width', () => {
        // Given a single RHP saved at 400px, its edge pressed
        const {firePointer, readPaintedLineWidth} = renderHandle();
        firePointer('pointerDown', 1000);

        // When its edge is dragged to within 20px of the 440px default
        firePointer('pointerMove', 970);

        // Then the line thickens, so the snap onto the default is visible before release
        expect(readPaintedLineWidth()).toBe(`${CONST.RHP_RESIZE.SNAPPED_INDICATOR_WIDTH}px`);

        // When it is dragged past the snap threshold
        firePointer('pointerMove', 930);

        // Then the line goes back to the pressed width, since the cards follow the pointer again
        expect(readPaintedLineWidth()).toBe(`${CONST.RHP_RESIZE.ACTIVE_INDICATOR_WIDTH}px`);
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

    it.each([
        ['never moves', []],
        ['moves within the drag slop', [1000 - CONST.RESIZE_HANDLE.DRAG_SLOP]],
    ])('resets the saved width on a click that %s', (_, moves: number[]) => {
        // Given a single RHP saved at 400px
        const {firePointer, readLiveWidth} = renderHandle();

        // When its edge is pressed and released, with at most the jitter of a mouse click in between
        firePointer('pointerDown', 1000);
        for (const clientX of moves) {
            firePointer('pointerMove', clientX);
        }
        firePointer('pointerUp', 1000);

        // Then the saved width is dropped, so a single click returns the RHP to the default the same way a click resets a table column, and nothing is painted on the way
        expect(resetSingleRHPWidth).toHaveBeenCalledTimes(1);
        expect(setSingleRHPWidth).not.toHaveBeenCalled();
        expect(readLiveWidth()).toBe('');
    });

    it('keeps the saved width when a press is cancelled', () => {
        // Given a single RHP saved at 400px
        const {firePointer} = renderHandle();

        // When its edge is pressed, then the browser cancels the pointer, as it does when a gesture takes over
        firePointer('pointerDown', 1000);
        firePointer('pointerCancel', 1000);

        // Then nothing is reset, since only a release counts as a click
        expect(resetSingleRHPWidth).not.toHaveBeenCalled();
        expect(setSingleRHPWidth).not.toHaveBeenCalled();
    });

    it('widens the line by a pixel while the edge is pressed', () => {
        // Given a single RHP saved at 400px, its edge hovered
        const {firePointer, readLineWidth} = renderHandle();
        firePointer('pointerEnter', 1000);

        // When its edge is pressed without moving
        firePointer('pointerDown', 1000);

        // Then the line is a pixel wider than the hover one, so the press reads as grabbing the edge
        expect(readLineWidth()).toBe(CONST.RHP_RESIZE.ACTIVE_INDICATOR_WIDTH);

        // When it is released
        firePointer('pointerUp', 1000);

        // Then the still-hovered line goes back to the resting width
        expect(readLineWidth()).toBe(CONST.RESIZE_HANDLE.INDICATOR_WIDTH);
    });

    it('stays put when an edge already on the default is dragged within the snap threshold', () => {
        // Given a single RHP already at the 440px default
        mockSavedWidth = DEFAULT_WIDTH;
        const {firePointer, readLiveWidth} = renderHandle();

        // When its edge is dragged 10px, inside the snap threshold, and released
        firePointer('pointerDown', 1000);
        firePointer('pointerMove', 990);
        const liveWidthMidDrag = readLiveWidth();
        firePointer('pointerUp', 990);

        // Then nothing is painted or saved, so the drag holds on the default without counting as a snap onto it
        expect(liveWidthMidDrag).toBe('');
        expect(setSingleRHPWidth).not.toHaveBeenCalled();
        expect(resetSingleRHPWidth).not.toHaveBeenCalled();
    });
});
