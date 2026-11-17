import {fireEvent, render} from '@testing-library/react-native';

import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type RHPResizeHandleComponent from '@components/RHPResizeHandle';

import {resetPaneWidth, setPaneWidth} from '@libs/actions/PaneWidth';
import {translate} from '@libs/Localize';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

// Jest resolves the native no-op, so the web implementation is loaded by its file name.
const {default: RHPResizeHandle} = jest.requireActual<{default: typeof RHPResizeHandleComponent}>('@components/RHPResizeHandle/index.tsx');

// The native helpers never touch the DOM, so the web ones are loaded by their file name too.
jest.mock('@libs/Navigation/helpers/singleRHPWidth', () => jest.requireActual<Record<string, unknown>>('@libs/Navigation/helpers/singleRHPWidth/index.ts'));

// Without a LocaleContextProvider every translation is empty, so the label and the announced widths are read in English instead.
const mockTranslate: LocaleContextProps['translate'] = (path, ...parameters) => translate(CONST.LOCALES.EN, path, ...parameters);
jest.mock('@hooks/useLocalize', () => () => ({translate: mockTranslate}));

jest.mock('@libs/actions/PaneWidth', () => ({
    setPaneWidth: jest.fn(),
    resetPaneWidth: jest.fn(),
}));

const MIN_WIDTH = 380;
const MAX_WIDTH = 800;

let mockSavedWidth = 400;
jest.mock('@hooks/useSingleRHPWidth', () => () => ({width: mockSavedWidth, bounds: {min: MIN_WIDTH, max: MAX_WIDTH}}));

const WIDTH_VARIABLE = '--rhp-width';

type PointerEventName = 'pointerEnter' | 'pointerDown' | 'pointerMove' | 'pointerUp' | 'pointerCancel' | 'lostPointerCapture';

const DEFAULT_WIDTH = variables.rhpWidth;

/** Renders the handle the way the RHP navigators mount it. */
function renderHandle() {
    const handleElement = document.createElement('div');

    // jsdom has no pointer capture.
    handleElement.setPointerCapture = jest.fn();

    // jsdom doesn't track how an element got focus.
    let isFocusVisible = false;
    jest.spyOn(handleElement, 'matches').mockImplementation((selector: string) => selector === ':focus-visible' && isFocusVisible);

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

    /** Fires a key press carrying only what the handle reads, returning the spies that tell whether the handle took the key. */
    const fireKey = (eventName: 'keyDown' | 'keyUp', key: string, {repeat = false} = {}) => {
        const keyEvent = {key, repeat, currentTarget: handleElement, preventDefault: jest.fn(), stopPropagation: jest.fn()};
        fireEvent(getHandle(), eventName, keyEvent);
        return keyEvent;
    };

    /** Presses and releases a key, as a tap of it does. */
    const pressKey = (key: string) => {
        fireKey('keyDown', key);
        fireKey('keyUp', key);
    };

    const fireFocus = (isFromKeyboard: boolean) => {
        isFocusVisible = isFromKeyboard;
        fireEvent(getHandle(), 'focus', {currentTarget: handleElement});
    };

    const fireBlur = () => {
        isFocusVisible = false;
        fireEvent(getHandle(), 'blur', {currentTarget: handleElement});
    };

    const readHandleProps = (): Record<string, unknown> => getHandle().props;

    const isLineShown = () => screen.UNSAFE_root.findAll((node) => node.type === 'div').length > 1;

    const readLiveWidth = () => document.documentElement.style.getPropertyValue(WIDTH_VARIABLE);

    const rerenderHandle = () => screen.rerender(<RHPResizeHandle />);

    const readLineWidth = () => {
        const lineStyle: unknown = screen.UNSAFE_root.findAll((node) => node.type === 'div').at(1)?.props.style;
        return lineStyle && typeof lineStyle === 'object' && 'width' in lineStyle ? lineStyle.width : undefined;
    };

    /** Reads the width set on the line's DOM node mid-drag, which overrides the one React renders. */
    const readPaintedLineWidth = () => lineElement.style.width;

    return {...screen, handleElement, firePointer, fireKey, pressKey, fireFocus, fireBlur, readHandleProps, isLineShown, readLineWidth, readPaintedLineWidth, readLiveWidth, rerenderHandle};
}

describe('RHPResizeHandle', () => {
    beforeAll(() => IntlStore.load(CONST.LOCALES.EN));

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
        expect(setPaneWidth).not.toHaveBeenCalled();

        // When the pointer is released, and the browser then reclaims capture as it always does after pointerup
        firePointer('pointerUp', 900);
        firePointer('lostPointerCapture', 900);

        // Then the dragged width is saved exactly once, so it survives a reload without a duplicate Onyx write
        expect(jest.mocked(setPaneWidth).mock.calls).toEqual([[ONYXKEYS.SINGLE_RHP_WIDTH, 500]]);
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
        expect(setPaneWidth).not.toHaveBeenCalled();
        expect(resetPaneWidth).not.toHaveBeenCalled();
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

    it('keeps the live width when the saved width changes while another handle drags', () => {
        // Given a modal stacked on the RHP, each with its own handle, and a drag at 500px on the modal's
        const rhpHandle = renderHandle();
        const modalHandle = renderHandle();
        modalHandle.firePointer('pointerDown', 1000);
        modalHandle.firePointer('pointerMove', 900);

        // When the saved width changes underneath both, as a window resize re-clamps it
        mockSavedWidth = 450;
        rhpHandle.rerenderHandle();
        modalHandle.rerenderHandle();

        // Then the idle RHP handle leaves the shared live width alone, so the cards don't jump back mid-drag
        expect(modalHandle.readLiveWidth()).toBe('500px');
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
        expect(jest.mocked(resetPaneWidth).mock.calls).toEqual([[ONYXKEYS.SINGLE_RHP_WIDTH]]);
        expect(setPaneWidth).not.toHaveBeenCalled();
    });

    it('thickens the line while a drag is held on the default width', () => {
        // Given a single RHP saved at 400px, its edge pressed
        const {firePointer, readPaintedLineWidth} = renderHandle();
        firePointer('pointerDown', 1000);

        // When its edge is dragged to within 20px of the 440px default
        firePointer('pointerMove', 970);

        // Then the line thickens, so the snap onto the default is visible before release
        expect(readPaintedLineWidth()).toBe(`${CONST.RESIZE_HANDLE.PANE_SNAPPED_INDICATOR_WIDTH}px`);

        // When it is dragged past the snap threshold
        firePointer('pointerMove', 930);

        // Then the line goes back to the pressed width, since the cards follow the pointer again
        expect(readPaintedLineWidth()).toBe(`${CONST.RESIZE_HANDLE.PANE_ACTIVE_INDICATOR_WIDTH}px`);
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
        expect(jest.mocked(resetPaneWidth).mock.calls).toEqual([[ONYXKEYS.SINGLE_RHP_WIDTH]]);
        expect(setPaneWidth).not.toHaveBeenCalled();
        expect(readLiveWidth()).toBe('');
    });

    it('keeps the saved width when a press is cancelled', () => {
        // Given a single RHP saved at 400px
        const {firePointer} = renderHandle();

        // When its edge is pressed, then the browser cancels the pointer, as it does when a gesture takes over
        firePointer('pointerDown', 1000);
        firePointer('pointerCancel', 1000);

        // Then nothing is reset, since only a release counts as a click
        expect(resetPaneWidth).not.toHaveBeenCalled();
        expect(setPaneWidth).not.toHaveBeenCalled();
    });

    it('widens the line by a pixel while the edge is pressed', () => {
        // Given a single RHP saved at 400px, its edge hovered
        const {firePointer, readLineWidth} = renderHandle();
        firePointer('pointerEnter', 1000);

        // When its edge is pressed without moving
        firePointer('pointerDown', 1000);

        // Then the line is a pixel wider than the hover one, so the press reads as grabbing the edge
        expect(readLineWidth()).toBe(CONST.RESIZE_HANDLE.PANE_ACTIVE_INDICATOR_WIDTH);

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
        expect(setPaneWidth).not.toHaveBeenCalled();
        expect(resetPaneWidth).not.toHaveBeenCalled();
    });

    it('exposes the edge to assistive technology as a focusable separator holding the width', () => {
        // Given a single RHP saved at 400px, in a window that lets it range from 380px to 800px
        const {readHandleProps} = renderHandle();

        // When the handle renders
        const handleProps = readHandleProps();

        // Then it can be reached with Tab and is announced as a named vertical separator at the RHP's width, within the bounds a drag has
        expect(handleProps.role).toBe('separator');
        expect(handleProps.tabIndex).toBe(0);
        expect(handleProps['aria-label']).toBe('Resize panel');
        expect(handleProps['aria-orientation']).toBe('vertical');
        expect(handleProps['aria-valuenow']).toBe(400);
        expect(handleProps['aria-valuemin']).toBe(MIN_WIDTH);
        expect(handleProps['aria-valuemax']).toBe(MAX_WIDTH);

        // And it's read out in pixels, the same as a table column's edge
        expect(handleProps['aria-valuetext']).toBe('400 pixels');
    });

    it('widens on the left arrow and narrows on the right one, saving the width once the key is released', () => {
        // Given a single RHP saved at 400px, its edge focused
        const {handleElement, fireKey, readLiveWidth, rerenderHandle} = renderHandle();

        // When the left arrow is pressed and held for one repeat
        const arrowLeft = fireKey('keyDown', 'ArrowLeft');
        fireKey('keyDown', 'ArrowLeft', {repeat: true});

        // Then the edge moves left a step per press, widening the cards right away without scrolling anything, and nothing is
        // saved yet, since each save's render would pull the edge back mid-hold
        const widenedWidth = 400 + 2 * CONST.RESIZE_HANDLE.KEYBOARD_STEP;
        expect(readLiveWidth()).toBe(`${widenedWidth}px`);
        expect(arrowLeft.preventDefault).toHaveBeenCalled();
        expect(setPaneWidth).not.toHaveBeenCalled();

        // And the announced width follows each press, since nothing renders until the key is released
        expect(handleElement.getAttribute('aria-valuenow')).toBe(String(widenedWidth));
        expect(handleElement.getAttribute('aria-valuetext')).toBe(`${widenedWidth} pixels`);

        // When the key is released
        fireKey('keyUp', 'ArrowLeft');

        // Then the width is saved once, the same way a drag saves it
        expect(jest.mocked(setPaneWidth).mock.calls).toEqual([[ONYXKEYS.SINGLE_RHP_WIDTH, widenedWidth]]);

        // When the saved width renders and the right arrow is tapped
        jest.clearAllMocks();
        mockSavedWidth = widenedWidth;
        rerenderHandle();
        fireKey('keyDown', 'ArrowRight');
        fireKey('keyUp', 'ArrowRight');

        // Then the edge moves back right, narrowing the cards by a step
        expect(jest.mocked(setPaneWidth).mock.calls).toEqual([[ONYXKEYS.SINGLE_RHP_WIDTH, widenedWidth - CONST.RESIZE_HANDLE.KEYBOARD_STEP]]);
    });

    it.each([
        ['widest', MAX_WIDTH, 'ArrowLeft'],
        ['narrowest', MIN_WIDTH, 'ArrowRight'],
    ])('stops at the %s width a drag allows', (_, savedWidth: number, key: string) => {
        // Given a single RHP already at a bound
        mockSavedWidth = savedWidth;
        const {pressKey, readLiveWidth} = renderHandle();

        // When the arrow pushing past it is tapped
        pressKey(key);

        // Then nothing is painted or saved, the same as dragging past the bound
        expect(readLiveWidth()).toBe('');
        expect(setPaneWidth).not.toHaveBeenCalled();
        expect(resetPaneWidth).not.toHaveBeenCalled();
    });

    it('drops the saved width when the arrow keys land on the default', () => {
        // Given a single RHP saved a step narrower than the default
        mockSavedWidth = DEFAULT_WIDTH - CONST.RESIZE_HANDLE.KEYBOARD_STEP;
        const {pressKey} = renderHandle();

        // When the left arrow is tapped
        pressKey('ArrowLeft');

        // Then the saved width is dropped rather than pinned to the default, the same as a drag that snaps onto it
        expect(jest.mocked(resetPaneWidth).mock.calls).toEqual([[ONYXKEYS.SINGLE_RHP_WIDTH]]);
        expect(setPaneWidth).not.toHaveBeenCalled();
    });

    it('steps off the default width without snapping back to it', () => {
        // Given a single RHP at the default width
        mockSavedWidth = DEFAULT_WIDTH;
        const {pressKey} = renderHandle();

        // When the left arrow is tapped, moving it less than the drag's snap threshold
        pressKey('ArrowLeft');

        // Then the width moves a step anyway, since snapping would keep the arrow keys from ever leaving the default
        expect(jest.mocked(setPaneWidth).mock.calls).toEqual([[ONYXKEYS.SINGLE_RHP_WIDTH, DEFAULT_WIDTH + CONST.RESIZE_HANDLE.KEYBOARD_STEP]]);
    });

    it.each(['Enter', ' '])('resets the width on %p, the same as a click, once while it is held', (key: string) => {
        // Given a single RHP saved at 400px, its edge focused
        const {fireKey} = renderHandle();

        // When the key is pressed and held for one repeat
        const keyDown = fireKey('keyDown', key);
        fireKey('keyDown', key, {repeat: true});

        // Then the saved width is dropped once, without the key reaching the page or global shortcuts
        expect(jest.mocked(resetPaneWidth).mock.calls).toEqual([[ONYXKEYS.SINGLE_RHP_WIDTH]]);
        expect(keyDown.stopPropagation).toHaveBeenCalled();
    });

    it('saves an arrow-key width when focus leaves before the key is released', () => {
        // Given a single RHP saved at 400px, its edge moved by the left arrow
        const {fireKey, fireBlur} = renderHandle();
        fireKey('keyDown', 'ArrowLeft');

        // When focus moves on, so the key release lands elsewhere
        fireBlur();

        // Then the width is saved anyway, rather than left painted until the next render drops it
        expect(jest.mocked(setPaneWidth).mock.calls).toEqual([[ONYXKEYS.SINGLE_RHP_WIDTH, 400 + CONST.RESIZE_HANDLE.KEYBOARD_STEP]]);
    });

    it('keeps the arrow-key width when the saved width changes mid-hold', () => {
        // Given a single RHP saved at 400px, its edge moved a step by a held left arrow
        const {fireKey, readLiveWidth, rerenderHandle} = renderHandle();
        fireKey('keyDown', 'ArrowLeft');

        // When the saved width changes underneath it, as a window resize re-clamps it
        mockSavedWidth = 390;
        rerenderHandle();

        // Then the cards stay where the key put them
        expect(readLiveWidth()).toBe(`${400 + CONST.RESIZE_HANDLE.KEYBOARD_STEP}px`);
    });

    it('ignores the arrow keys mid-drag', () => {
        // Given a drag in progress at 500px
        const {firePointer, pressKey, readLiveWidth} = renderHandle();
        firePointer('pointerDown', 1000);
        firePointer('pointerMove', 900);

        // When an arrow key is tapped before the drag ends
        pressKey('ArrowLeft');

        // Then the drag keeps the width, and nothing is saved behind its back
        expect(readLiveWidth()).toBe('500px');
        expect(setPaneWidth).not.toHaveBeenCalled();
    });

    it('shows the line while the edge has keyboard focus', () => {
        // Given a single RHP whose edge isn't hovered
        const {fireFocus, fireBlur, fireKey, isLineShown} = renderHandle();

        // When its edge is focused by a pointer press
        fireFocus(false);

        // Then no line appears, since a press shows it only while hovered or dragging
        expect(isLineShown()).toBe(false);

        // When a key acts on it
        fireKey('keyDown', 'ArrowLeft');

        // Then the line appears, so the user sees which edge the arrow keys move
        expect(isLineShown()).toBe(true);

        // When focus moves on, and then comes back from the keyboard
        fireBlur();
        expect(isLineShown()).toBe(false);
        fireFocus(true);

        // Then the line shows straight away
        expect(isLineShown()).toBe(true);
    });

    it('leaves other keys and modified arrows to the page', () => {
        // Given a single RHP whose edge has focus
        const {fireKey, readLiveWidth} = renderHandle();

        // When Tab and Escape are pressed
        const tab = fireKey('keyDown', 'Tab');
        const escape = fireKey('keyDown', 'Escape');

        // Then they keep their usual jobs, moving focus on and closing the RHP, and the width is untouched
        expect(tab.preventDefault).not.toHaveBeenCalled();
        expect(escape.stopPropagation).not.toHaveBeenCalled();
        expect(readLiveWidth()).toBe('');
    });
});
