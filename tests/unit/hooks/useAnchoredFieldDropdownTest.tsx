import {act, render} from '@testing-library/react-native';

import useAnchoredFieldDropdown from '@hooks/useAnchoredFieldDropdown';

import getSelectionListPopoverContentHeight from '@libs/getSelectionListPopoverContentHeight';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React, {useEffect} from 'react';
import {View} from 'react-native';

// Below this width the container is a bottom sheet, so these tests default to a wide layout.
let mockIsSmallScreenWidth = false;
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({isSmallScreenWidth: mockIsSmallScreenWidth, shouldUseNarrowLayout: mockIsSmallScreenWidth})));
// Read lazily so a test can shrink the viewport, leaving the row short of room on both sides at once.
let mockWindowHeight = 800;
jest.mock('@hooks/useWindowDimensions', () => jest.fn(() => ({windowWidth: 1280, windowHeight: mockWindowHeight})));
let mockContentHeaderHeight = 0;
jest.mock('@hooks/useContentHeaderHeight', () => jest.fn(() => ({contentHeaderHeight: mockContentHeaderHeight, contentHeaderHeightStyle: {}})));
jest.mock('@hooks/useSafeAreaInsets', () => jest.fn(() => ({top: 0, bottom: 0, left: 0, right: 0})));

const ROW_X = 16;
const ROW_TOP = 100;
const ROW_WIDTH = 300;
const ROW_HEIGHT = 60;
const CONTAINER_GAP = 4;
const MAX_CONTAINER_HEIGHT = getSelectionListPopoverContentHeight({optionCount: 4});

/**
 * Stands in for the measurement the row does when it opens: the container is positioned off the row's real
 * geometry, which the test renderer never lays out, so each test says where the row sits instead.
 */
const mockRowAt = (rowTop: number) =>
    jest.spyOn(View.prototype, 'measureInWindow').mockImplementation((callback) => {
        callback(ROW_X, rowTop, ROW_WIDTH, ROW_HEIGHT);
    });

type DropdownState = ReturnType<typeof useAnchoredFieldDropdown>;

let dropdown: DropdownState | undefined;

type RowProps = {
    onFallback: () => void;
    listHeaderHeight?: number;
    onRender: (state: DropdownState) => void;
};

/** A row the hook anchors to, which reports the hook's latest state once each render commits */
function Row({onFallback, listHeaderHeight, onRender}: RowProps) {
    const {anchorRef, isVisible, hasEverOpened, toggleDropdown, dropdownProps} = useAnchoredFieldDropdown({onFallback, listHeaderHeight});
    useEffect(() => {
        onRender({anchorRef, isVisible, hasEverOpened, toggleDropdown, dropdownProps});
    });
    return <View ref={anchorRef} />;
}

const renderRow = (onFallback: () => void = jest.fn(), listHeaderHeight?: number) =>
    render(
        <Row
            onFallback={onFallback}
            listHeaderHeight={listHeaderHeight}
            onRender={(state) => {
                dropdown = state;
            }}
        />,
    );

describe('useAnchoredFieldDropdown', () => {
    beforeEach(() => {
        dropdown = undefined;
        mockIsSmallScreenWidth = false;
        mockWindowHeight = 800;
        mockContentHeaderHeight = 0;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('opens below the row at its width, sized to four options', () => {
        // Given a row with plenty of room below it
        mockRowAt(ROW_TOP);
        renderRow();

        // When the row is opened
        act(() => dropdown?.toggleDropdown());

        // Then the container lines up with the row's left edge and width, just below it, and shows four options before scrolling
        expect(dropdown?.isVisible).toBe(true);
        expect(dropdown?.hasEverOpened).toBe(true);
        expect(dropdown?.dropdownProps.anchorPosition).toEqual({horizontal: ROW_X, vertical: ROW_TOP + ROW_HEIGHT + CONTAINER_GAP});
        expect(dropdown?.dropdownProps.anchorAlignment.vertical).toBe(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP);
        expect(dropdown?.dropdownProps.shouldMeasureAnchorPositionFromTop).toBe(true);
        expect(dropdown?.dropdownProps.popoverWidth).toBe(ROW_WIDTH);
        expect(dropdown?.dropdownProps.popoverHeight).toBe(MAX_CONTAINER_HEIGHT);
    });

    it('opens above a row near the bottom of the window', () => {
        // Given a row with little room below it and more above
        const rowTop = 700;
        mockRowAt(rowTop);
        renderRow();

        // When the row is opened
        act(() => dropdown?.toggleDropdown());

        // Then the container sits just above the row, positioned from its bottom edge so it never covers the row
        expect(dropdown?.dropdownProps.anchorPosition).toEqual({horizontal: ROW_X, vertical: rowTop - CONTAINER_GAP});
        expect(dropdown?.dropdownProps.anchorAlignment.vertical).toBe(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM);
        expect(dropdown?.dropdownProps.shouldMeasureAnchorPositionFromTop).toBe(false);
    });

    it('falls back to the full page when neither side has room for one option', () => {
        // Given a row squeezed between the screen's header and the bottom of a short window
        const onFallback = jest.fn();
        mockContentHeaderHeight = ROW_TOP;
        mockWindowHeight = ROW_TOP + ROW_HEIGHT + CONTAINER_GAP + 10;
        mockRowAt(ROW_TOP);
        renderRow(onFallback);

        // When the row is opened
        act(() => dropdown?.toggleDropdown());

        // Then the field opens its full page instead of a container too short to show an option
        expect(onFallback).toHaveBeenCalledTimes(1);
        expect(dropdown?.isVisible).toBe(false);
        expect(dropdown?.hasEverOpened).toBe(false);
    });

    it('grows the container by a header above the list, so it still fits four options', () => {
        // Given a row whose list shows a header above its options, e.g. an add button
        const headerHeight = variables.componentSizeNormal;
        mockRowAt(ROW_TOP);
        renderRow(jest.fn(), headerHeight);

        // When the row is opened
        act(() => dropdown?.toggleDropdown());

        // Then the container is taller by the header
        expect(dropdown?.dropdownProps.popoverHeight).toBe(MAX_CONTAINER_HEIGHT + headerHeight);
    });

    it('opens a bottom sheet on a narrow layout without measuring the row', () => {
        // Given a phone, where the container docks at the bottom of the screen
        mockIsSmallScreenWidth = true;
        const measureInWindow = mockRowAt(ROW_TOP);
        // The spy on the shared prototype keeps the calls of earlier tests.
        measureInWindow.mockClear();
        renderRow();

        // When the row is opened
        act(() => dropdown?.toggleDropdown());

        // Then the sheet opens at the standard size, and the row's position plays no part
        expect(dropdown?.isVisible).toBe(true);
        expect(measureInWindow).not.toHaveBeenCalled();
        expect(dropdown?.dropdownProps.popoverWidth).toBe(CONST.POPOVER_DROPDOWN_WIDTH);
        expect(dropdown?.dropdownProps.popoverHeight).toBe(CONST.POPOVER_DROPDOWN_MAX_HEIGHT);
    });

    it('closes when the row is pressed again, and when the container asks to', () => {
        // Given an open container
        mockRowAt(ROW_TOP);
        renderRow();
        act(() => dropdown?.toggleDropdown());

        // When the row is pressed again
        act(() => dropdown?.toggleDropdown());

        // Then the container closes, but the list stays mounted for the next opening
        expect(dropdown?.isVisible).toBe(false);
        expect(dropdown?.hasEverOpened).toBe(true);

        // When it opens again and the container dismisses itself, e.g. on an outside click
        act(() => dropdown?.toggleDropdown());
        act(() => dropdown?.dropdownProps.onClose());

        // Then it is closed again
        expect(dropdown?.isVisible).toBe(false);
    });
});
